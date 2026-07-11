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
    imageError: false,
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
    totalLeaves: 'Loading...',
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
        profileImageUrl = studentProfile.profileImage.startsWith('http') 
          ? studentProfile.profileImage 
          : `${process.env.NEXT_PUBLIC_PROD_API_URL}/${studentProfile.profileImage}`;
      } else if (studentProfile?.photo) {
        profileImageUrl = studentProfile.photo.startsWith('http')
          ? studentProfile.photo
          : `${process.env.NEXT_PUBLIC_PROD_API_URL}/${studentProfile.photo}`;
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
      // Fetch logs, profile, and leaves concurrently
      const [logsRes, profileRes, leavesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/studentauth/attendance-log/${studentId}`, { headers: { Authorization: `Bearer ${parentToken}` } }).catch(() => ({ data: { attendanceLog: [] } })),
        axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-profile?studentId=${studentId}`, { headers: { Authorization: `Bearer ${parentToken}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/leave-management`, { params: { studentId }, headers: { Authorization: `Bearer ${parentToken}` } }).catch(() => ({ data: { leaveHistory: [] } }))
      ]);

      const logs = logsRes.data?.attendanceLog || [];
      const student = profileRes.data?.student || {};
      const leaves = leavesRes.data?.leaveHistory || [];

      let admissionDate = student.admissionDate || student.createdAt;
      if (admissionDate) {
        admissionDate = new Date(admissionDate);
        admissionDate.setHours(0, 0, 0, 0);
      } else {
        // fallback
        admissionDate = new Date();
        admissionDate.setHours(0, 0, 0, 0);
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let totalValidDays = 0;
      let lastAbsence = null;
      let isPresentToday = false;

      let earliestDate = admissionDate;
      if (logs.length > 0) {
        const oldestLogTime = Math.min(...logs.map(l => new Date(l.checkInDate).getTime()));
        if (oldestLogTime < earliestDate.getTime()) {
          earliestDate = new Date(oldestLogTime);
          earliestDate.setHours(0, 0, 0, 0);
        }
      }

      for (let d = new Date(earliestDate); d <= now; d.setDate(d.getDate() + 1)) {
        const iterDate = new Date(d);
        iterDate.setHours(0, 0, 0, 0);
        const dateStr = iterDate.toDateString();

        const marked = logs.some(log => new Date(log.checkInDate).toDateString() === dateStr);
        const onLeave = leaves.some(leave => {
          if (leave.status !== 'approved' && leave.status !== 'warden_approved') return false;
          const start = new Date(leave.startDate); start.setHours(0,0,0,0);
          const end = new Date(leave.endDate); end.setHours(23,59,59,999);
          return iterDate >= start && iterDate <= end;
        });

        if (marked) {
          presentCount++;
          totalValidDays++;
          if (dateStr === now.toDateString()) {
            isPresentToday = true;
          }
        } else if (onLeave) {
          leaveCount++;
          totalValidDays++;
        } else if (!onLeave && iterDate < now) {
          absentCount++;
          totalValidDays++;
          lastAbsence = iterDate;
        } else if (!onLeave && iterDate.getTime() === now.getTime()) {
           totalValidDays++;
        }
      }

      let lastAbsenceStr = "No recent absences";
      if (lastAbsence) {
        lastAbsenceStr = lastAbsence.toLocaleDateString('en-GB', {
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });
      }

      setAttendance({
        today: isPresentToday ? "Present" : "Absent",
        last7Days: `${presentCount}/${totalValidDays} Present`,
        totalAbsences: `${absentCount} Days`,
        totalLeaves: `${leaveCount} Days`,
        lastAbsenceDate: lastAbsenceStr
      });

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendance({
        today: 'Error',
        last7Days: 'Error',
        totalAbsences: 'Error',
        totalLeaves: 'Error',
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
        console.log("dashboard data", response.data);
        const studentInfo = dashboardData.studentInfo;

        const firstName = studentInfo.firstName || '';
        const lastName = studentInfo.lastName || '';

        // ✅ Prefer `profileImage` or `photo` from API
        let profileImageUrl = null;
        if (studentInfo.profileImage) {
          profileImageUrl = studentInfo.profileImage.startsWith('http') 
            ? studentInfo.profileImage 
            : `${process.env.NEXT_PUBLIC_PROD_API_URL}/${studentInfo.profileImage}`;
        } else if (studentInfo.photo) {
          profileImageUrl = studentInfo.photo.startsWith('http')
            ? studentInfo.photo
            : `${process.env.NEXT_PUBLIC_PROD_API_URL}/${studentInfo.photo}`;
        }

        setStudentData({
          firstName,
          lastName,
          studentId: studentInfo.studentId || studentId,
          roomNo: response.data.studentInfo.roomBedDetails.room || 'N/A',
          bedAllotment: response.data.studentInfo.roomBedDetails.bedType || 'N/A',
          profileImage: profileImageUrl,
          loading: false,
          error: null
        });

        // If no image in dashboard response, fetch from profile API
        if (!profileImageUrl) {
          await fetchStudentPhoto(studentId, parentToken);
        }

        await fetchAttendanceData(studentId, parentToken);

        const feesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/fees?studentId=${studentId}`,
          {
            headers: { Authorization: `Bearer ${parentToken}` }
          }
        );

        const allInvoices = feesResponse.data.feesOverview?.allInvoices || [];
        
        let amountDue = 0;
        let totalAmount = 0;
        let lastPaidDate = null;

        allInvoices.forEach(inv => {
          totalAmount += (inv.amount || 0);
          const s = inv.status ? inv.status.toLowerCase() : '';
          if (s === 'pending' || s === 'overdue' || s === 'unpaid') {
            amountDue += (inv.amount || 0);
          } else if (s === 'paid') {
            const dateStr = inv.paidDate || inv.paymentDate || inv.createdAt;
            if (dateStr) {
              if (!lastPaidDate || new Date(dateStr) > new Date(lastPaidDate)) {
                lastPaidDate = dateStr;
              }
            }
          }
        });

        setFeesData({
          status: amountDue > 0 ? 'Pending' : (totalAmount > 0 ? 'Paid' : 'No Dues'),
          amountDue: amountDue,
          totalAmount: totalAmount,
          dueDate: 'N/A',
          paidDate: lastPaidDate || 'N/A'
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
    <div className="bg-[#ffffff] px-6 sm:px-8 lg:px-2.5 py-2 min-h-screen font-sans w-full">
      <div className="max-w-7xl mx-auto w-full">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6 mt-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black border-l-4 border-[#4F8CCF] pl-2">
            Dashboard
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">

          {/* Student Card */}
          <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-center text-center">
            <div className="bg-[#AAB491] w-full px-6 py-3">
              <h2 className="text-lg font-semibold text-black">Student Details</h2>
            </div>
            <div className="p-8 flex flex-col items-center flex-1 w-full">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50 mb-4">
                {studentData.profileImage && !studentData.imageError ? (
                  <img
                    src={studentData.profileImage}
                    alt="Student Profile"
                    className="w-full h-full object-cover"
                    onError={() => setStudentData(prev => ({ ...prev, imageError: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{displayName}</h2>
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600 uppercase mb-6">
                ID: {displayStudentId}
              </div>
              <Link href="/dashboard/student" className="mt-auto w-full">
                <button className="w-full bg-[#4F8DCF] hover:bg-[#3e72a8] text-white px-4 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm">
                  View Details
                </button>
              </Link>
            </div>
          </div>

          {/* Fees Card */}
          <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
            <div className="bg-[#AAB491] w-full px-6 py-3">
              <h3 className="text-lg font-semibold text-black">Fees Overview</h3>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value={feesData.status} color={feesData.status === 'Paid' ? 'text-green-600' : 'text-red-600'} />
              <InfoRow label="Total Fees:" value={feesData.totalAmount !== 'Loading...' ? `₹${feesData.totalAmount}` : feesData.totalAmount} />
              <InfoRow label="Amount Due:" value={feesData.amountDue !== 'Loading...' ? `₹${feesData.amountDue}` : feesData.amountDue} color={feesData.amountDue > 0 ? "text-red-600" : "text-green-600"} />
              <InfoRow
                label="Paid on:"
                value={feesData.paidDate !== 'Loading...' && feesData.paidDate !== 'N/A' ? new Date(feesData.paidDate).toLocaleDateString() : feesData.paidDate}
              />

              {/* <InfoRow label="Paid on:" value={feesData.dueDate !== "N/A" && feesData.dueDate !== 'Loading...' ? new Date(feesData.dueDate).toLocaleDateString() : feesData.dueDate} color="text-gray-500" /> */}


            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
            <div className="bg-[#AAB491] w-full px-6 py-3">
              <h3 className="text-lg font-semibold text-black">Attendance Summary</h3>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
              <InfoRow label="Today:" value={attendance.today} color={attendance.today === "Present" ? "text-green-600" : "text-red-600"} />
              <InfoRow label="Present Days:" value={attendance.last7Days} />
              <InfoRow label="Total absences:" value={attendance.totalAbsences} />
              <InfoRow label="Total leaves:" value={attendance.totalLeaves} />
              <InfoRow label="Last absence:" value={attendance.lastAbsenceDate} color="text-gray-500" />
            </div>
          </div>

          {/* Hostel Details */}
          <div className="bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
            <div className="bg-[#AAB491] w-full px-6 py-3">
              <h3 className="text-lg font-semibold text-black">Hostel Details</h3>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value="Allocated" color="text-green-600" />
              <InfoRow label="Room:" value={studentData.roomNo} />
              <InfoRow label="Bed:" value={studentData.bedAllotment} />
              {/* <InfoRow label="Hostel Warden:" value={getWardenNames()} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color = "text-gray-800" }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
      <span className="text-gray-600 font-semibold text-sm">{label}</span>
      <span className={`font-bold text-sm ${color}`}>{value}</span>
    </div>
  );
}
