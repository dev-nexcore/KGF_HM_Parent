'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import axios from 'axios';

export default function DashboardCards() {
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    roomNo: '',
    bedAllotment: '',
    profileImage: null,
    loading: true,
    error: null
  });
  const [wardenData, setWardenData] = useState({ 
    wardens: [],
    loading: true,
    error: null
  });

  const [attendance, setAttendance] = useState({
    today: 'Loading...',
    last7Days: 'Loading...',
    totalAbsences: 'Loading...',
    lastAbsenceDate: 'Loading...'
  });

  const [feesData, setFeesData] = useState({
    status: 'Loading...',
    amountDue: 'Loading...',
    totalAmount: 'Loading...',
    dueDate: 'Loading...'
  });

  // Fetch student photo separately if not present in dashboard API
  const fetchStudentPhoto = async (studentId, parentToken) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-profile?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const studentProfile = response.data.student;

      let profileImageUrl = null;
      if (studentProfile?.profileImage) {
        profileImageUrl = studentProfile.profileImage;
      } else if (studentProfile?.photo) {
        profileImageUrl = studentProfile.photo;
      }

      if (profileImageUrl) {
        setStudentData(prev => ({
          ...prev,
          profileImage: profileImageUrl
        }));
      }
    } catch (error) {
      console.error('Error fetching student photo:', error);
    }
  };

  const fetchAttendanceData = async (studentId, parentToken) => {
    try {
      const attendanceResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/attendance?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const attendanceData = attendanceResponse.data;
      const attendanceSummary = attendanceData.attendanceSummary || {};
      
      setAttendance({
        today: attendanceSummary.isPresentToday ? "Present" : "Absent",
        last7Days: `${attendanceSummary.presentDays || 0}/${attendanceSummary.totalDays || 0} Present`,
        totalAbsences: `${attendanceSummary.absentDays || 0} Days`,
        lastAbsenceDate: formatLastAbsence(attendanceSummary.lastAbsence)
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendance({
        today: 'Error',
        last7Days: 'Error',
        totalAbsences: 'Error',
        lastAbsenceDate: 'Error'
      });
    }
  };

  const formatLastAbsence = (lastAbsence) => {
    if (!lastAbsence || lastAbsence === "No recent absences") {
      return "Check records";
    }
    if (lastAbsence.includes('-') || lastAbsence.includes('/')) {
      try {
        const date = new Date(lastAbsence);
        return date.toLocaleDateString();
      } catch (e) {
        return "Check records";
      }
    }
    return lastAbsence;
  };

  useEffect(() => {
    const fetchParentDashboardData = async () => {
      try {
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;
        if (!studentId) throw new Error('Student ID not found in token');

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/dashboard?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${parentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const dashboardData = response.data;
        const studentInfo = dashboardData.studentInfo;

        const firstName = studentInfo.firstName || '';
        const lastName = studentInfo.lastName || '';

        // ✅ Prefer `profileImage` or `photo` from API
        let profileImageUrl = null;
        if (studentInfo.profileImage) {
          profileImageUrl = studentInfo.profileImage;
        } else if (studentInfo.photo) {
          profileImageUrl = studentInfo.photo;
        }

        setStudentData({
          firstName,
          lastName,
          studentId: studentInfo.studentId || studentId,
          roomNo: studentInfo.roomBedNumber || 'N/A',
          bedAllotment: studentInfo.roomBedNumber || 'N/A',
          profileImage: profileImageUrl,
          loading: false,
          error: null
        });

        // If no image in dashboard response, fetch from profile API
        if (!profileImageUrl) {
          await fetchStudentPhoto(studentId, parentToken);
        }

        await fetchAttendanceData(studentId, parentToken);

        const feesOverview = dashboardData.feesOverview || {};
        setFeesData({
          status: feesOverview.status || 'Not Available',
          amountDue: feesOverview.amountDue || 0,
          totalAmount: feesOverview.totalAmount || 0,
          dueDate: feesOverview.dueDate || 'N/A'
        });

        const wardenInfo = dashboardData.wardenInfo || {};
        setWardenData({
          wardens: wardenInfo.wardenName
            ? [{
                firstName: wardenInfo.wardenName.split(' ')[0] || '',
                lastName: wardenInfo.wardenName.split(' ').slice(1).join(' ') || ''
              }]
            : [],
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching parent dashboard data:', error);
        let errorMessage = 'Unknown error occurred';
        if (error.response) errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        else if (error.request) errorMessage = 'Network error - unable to reach server';
        else errorMessage = error.message;

        setStudentData(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));

        setAttendance({
          today: 'Error',
          last7Days: 'Error',
          totalAbsences: 'Error',
          lastAbsenceDate: 'Error'
        });

        setFeesData({
          status: 'Error',
          amountDue: 'Error',
          totalAmount: 'Error',
          dueDate: 'Error'
        });

        setWardenData({
          wardens: [],
          loading: false,
          error: errorMessage
        });
      }
    };

    fetchParentDashboardData();
  }, []);

  const displayName = studentData.loading 
    ? 'Loading...' 
    : studentData.error 
      ? 'Error loading data'
      : `${studentData.firstName} ${studentData.lastName}`.trim() || 'Unknown Student';

  const displayStudentId = studentData.studentId || 'N/A';

  const getWardenNames = () => {
    if (wardenData.loading) return 'Loading...';
    if (wardenData.error) return 'Error loading wardens';
    if (wardenData.wardens.length === 0) return 'No wardens assigned';
    return wardenData.wardens.map(warden => `${warden.firstName} ${warden.lastName}`.trim()).join(', ');
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Dashboard</h2>
      </div>
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">

          {/* Student Card */}
          <div className="bg-[#B8C5A8] rounded-xl p-4 sm:p-6 shadow-lg flex flex-col justify-center items-center min-h-[280px]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white mb-4 flex items-center justify-center overflow-hidden">
              {studentData.profileImage ? (
                <img 
                  src={studentData.profileImage} 
                  alt="Student Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-600" />
              )}
            </div>
            <h2 className="font-bold text-lg sm:text-2xl text-gray-800">{displayName}</h2>
            <p className="text-sm text-gray-700 font-semibold mb-4">Student ID: {displayStudentId}</p>
            <Link href="/dashboard/student">
              <button className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                View Details
              </button>
            </Link>
          </div>

          {/* Fees Card */}
          <div className="bg-white rounded-xl shadow-lg flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-4 py-3 font-bold text-black">Fees Overview</h3>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value={feesData.status} color={feesData.status === 'Paid' ? 'text-green-600' : 'text-red-600'} />
              <InfoRow label="Total Fees:" value={feesData.totalAmount !== 'Loading...' ? "₹7000" : feesData.totalAmount} />
              <InfoRow label="Amount Due:" value={feesData.amountDue !== 'Loading...' ? `₹${feesData.amountDue}` : feesData.amountDue} color={feesData.amountDue > 0 ? "text-red-600" : "text-green-600"} />
              <InfoRow label="Due Date:" value={feesData.dueDate !== 'N/A' && feesData.dueDate !== 'Loading...' ? new Date(feesData.dueDate).toLocaleDateString() : feesData.dueDate} color="text-gray-500" />
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-4 py-3 font-bold text-black">Attendance Summary</h3>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Today:" value={attendance.today} color={attendance.today === "Present" ? "text-green-600" : "text-red-600"} />
              <InfoRow label="Present Days:" value={attendance.last7Days} />
              <InfoRow label="Total absences:" value={attendance.totalAbsences} />
              <InfoRow label="Last absence:" value={attendance.lastAbsenceDate} color="text-gray-500" />
            </div>
          </div>

          {/* Hostel Details */}
          <div className="bg-white rounded-xl shadow-lg flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-4 py-3 font-bold text-black">Hostel Details</h3>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value="Allocated" color="text-green-600" />
              <InfoRow label="Room & Bed:" value={studentData.roomNo} />
              <InfoRow label="Hostel Warden:" value={getWardenNames()} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color = "text-black" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-black font-bold text-sm">{label}</span>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
    </div>
  );
}
