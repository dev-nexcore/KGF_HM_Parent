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
    wardens: [], // Array to store all wardens
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

// Change the endpoint back to parent controller
const fetchAttendanceData = async (studentId, parentToken) => {
  try {
    // Change back to parentauth endpoint
    const attendanceResponse = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/attendance?studentId=${studentId}`, {
      headers: {
        Authorization: `Bearer ${parentToken}`,
        'Content-Type': 'application/json'
      }
    });

    const attendanceData = attendanceResponse.data;
    const attendanceSummary = attendanceData.attendanceSummary || {};
    
    console.log('Attendance API Response:', attendanceData); // Debug log
    console.log('Attendance Summary:', attendanceSummary); // Debug log
    
    setAttendance({
      // Use isPresentToday from the new controller response
      today: attendanceSummary.isPresentToday ? "Present" : "Absent",
      
      // Use the proper present/total days format
      last7Days: `${attendanceSummary.presentDays || 0}/${attendanceSummary.totalDays || 0} Present`,
      
      // Use absentDays directly
      totalAbsences: `${attendanceSummary.absentDays || 0} Days`,
      
      // Format the last absence date
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

// Helper function to format last absence date
const formatLastAbsence = (lastAbsence) => {
  if (!lastAbsence || lastAbsence === "No recent absences") {
    return "Check records"; // Match your UI expectation
  }
  
  // If it's a date string, format it
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

        // Use the PARENT dashboard endpoint instead of student endpoint
        const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/dashboard?studentId=${studentId}`, {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        });

        const dashboardData = response.data;
        const studentInfo = dashboardData.studentInfo;

        // Extract student name properly
         const firstName = studentInfo.firstName || '';
        const lastName = studentInfo.lastName || '';
        
        console.log('Student Info from API:', studentInfo); // Debug log
        setStudentData({
          firstName,
          lastName,
          studentId: studentInfo.studentId || studentId,
          roomNo: studentInfo.roomBedNumber || 'N/A', // Note: API returns roomBedNumber
          bedAllotment: studentInfo.roomBedNumber || 'N/A',
          profileImage: studentInfo.photo ? `${process.env.NEXT_PUBLIC_PROD_API_URL}/${studentInfo.photo}` : null,
          loading: false,
          error: null
        });

      // Fetch attendance data separately using the dedicated attendance endpoint
await fetchAttendanceData(studentId, parentToken);

        // Set fees data from dashboard response
        const feesOverview = dashboardData.feesOverview || {};
        setFeesData({
          status: feesOverview.status || 'Not Available',
          amountDue: feesOverview.amountDue || 0,
          totalAmount: feesOverview.totalAmount || 0,
          dueDate: feesOverview.dueDate || 'N/A'
        });

        // Set warden data from dashboard response
        const wardenInfo = dashboardData.wardenInfo || {};
        setWardenData({
          wardens: wardenInfo.wardenName ? [{ firstName: wardenInfo.wardenName.split(' ')[0] || '', lastName: wardenInfo.wardenName.split(' ').slice(1).join(' ') || '' }] : [],
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
    
    // Show warden names
    return wardenData.wardens.map(warden => `${warden.firstName} ${warden.lastName}`.trim()).join(', ');
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Dashboard</h2>
      </div>

      {/* Fixed container with proper spacing */}
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">

          {/* Student Card with Profile Photo */}
          <div className="bg-[#B8C5A8] rounded-xl p-4 sm:p-6 shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:h-[320px] flex flex-col justify-center items-center min-h-[280px] sm:min-h-[300px]">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Profile Photo Container - View Only */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center relative overflow-hidden">
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
              
              <h2 className="font-bold text-lg sm:text-2xl text-gray-800 mb-1 sm:mb-2">{displayName}</h2>
              <p className="text-xl sm:text-sm text-gray-700 font-semibold mb-4 sm:mb-6">Student ID: {displayStudentId}</p>
              <Link href="/dashboard/student">
                <button className="bg-white text-gray-800 font-semibold px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50" disabled={studentData.loading}>
                  View Details
                </button>
              </Link>
            </div>
          </div>

          {/* Fees Card - Now using real data */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">Fees Overview</h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value={feesData.status} color={feesData.status === 'Paid' ? 'text-green-600' : 'text-red-600'} />
              <InfoRow label="Total Fees:" value={feesData.totalAmount !== 'Loading...' ? "₹7000" : feesData.totalAmount} />
              <InfoRow label="Amount Due:" value={feesData.amountDue !== 'Loading...' ? `₹${feesData.amountDue}` : feesData.amountDue} color={feesData.amountDue > 0 ? "text-red-600" : "text-green-600"} />
              <InfoRow label="Due Date:" value={feesData.dueDate !== 'N/A' && feesData.dueDate !== 'Loading...' ? new Date(feesData.dueDate).toLocaleDateString() : feesData.dueDate} color="text-gray-500" />
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">Attendance Summary</h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Today:" value={attendance.today} color={attendance.today === "Present" ? "text-green-600" : "text-red-600"} />
              <InfoRow label="Present Days:" value={attendance.last7Days} />
              <InfoRow label="Total absences:" value={attendance.totalAbsences} />
              <InfoRow label="Last absence:" value={attendance.lastAbsenceDate} color="text-gray-500" />
            </div>
          </div>

          {/* Hostel Details Card */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">Hostel Details</h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value="Allocated" color="text-green-600" />
              <InfoRow label="Room & Bed:" value={studentData.roomNo} />
              <InfoRow label="Hostel Warden:" value={getWardenNames()} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

function InfoRow({ label, value, color = "text-black" }) {
  return (
    <div className="flex justify-between items-center py-0.5 sm:py-1">
      <span className="text-black font-bold text-xs sm:text-sm lg:text-base">{label}</span>
      <span className={`font-bold text-xs sm:text-sm lg:text-base ${color}`}>{value}</span>
    </div>
  );
}