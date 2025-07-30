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

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;
        if (!studentId) throw new Error('Student ID not found in token');

        const response = await axios.get(`http://localhost:5000/api/studentauth/profile/${studentId}`, {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        });

        const student = response.data;
        const studentName = student.studentName || student.name || student.firstName + ' ' + student.lastName || '';
        const nameParts = studentName ? studentName.split(' ') : ['', ''];
        const firstName = nameParts[0] || student.firstName || '';
        const lastName = nameParts.slice(1).join(' ') || student.lastName || '';

        setStudentData({
          firstName,
          lastName,
          studentId: student.studentId || studentId,
          roomNo: student.roomNo || 'N/A',
          bedAllotment: student.bedAllotment || 'N/A',
          wardernName: student.wardernName || 'N/A',
          profileImage: student.profileImage ? `http://localhost:5000/${student.profileImage}` : null,
          loading: false,
          error: null
        });

        fetchAttendance(student.studentId || studentId);
      } catch (error) {
        console.error('Error fetching student data:', error);
        let errorMessage = 'Unknown error occurred';
        if (error.response) errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        else if (error.request) errorMessage = 'Network error - unable to reach server';
        else errorMessage = error.message;

        setStudentData(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      }
    };

    const fetchAttendance = async (studentId) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/studentauth/attendance-log/${studentId}`);
        const attendanceLog = response.data.attendanceLog;

        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        let todayPresent = false;
        let recentPresence = 0;
        let lastAbsence = null;

        const now = new Date();

        for (let i = 0; i < attendanceLog.length; i++) {
          const log = attendanceLog[i];
          const checkInDate = new Date(log.checkInDate);
          const localDateStr = checkInDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

          const daysAgo = Math.floor((now - new Date(localDateStr)) / (1000 * 60 * 60 * 24));

          if (localDateStr === todayStr) todayPresent = true;
          if (daysAgo < 7) recentPresence += 1;

          if (!log.checkOutDate) lastAbsence = localDateStr;
        }

        const totalAbsences = attendanceLog.filter(log => !log.checkOutDate).length;

        setAttendance({
          today: todayPresent ? "Present" : "Absent",
          last7Days: `${recentPresence}/7 Present`,
          totalAbsences: `${totalAbsences} Days`,
          lastAbsenceDate: lastAbsence || "None"
        });
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setAttendance({
          today: 'Error',
          last7Days: 'Error',
          totalAbsences: 'Error',
          lastAbsenceDate: 'Error'
        });
      }
    };
   const fetchWardenData = async () => {
      try {
        setWardenData(prev => ({ ...prev, loading: true }));
        
        // Use the public endpoint that doesn't require authentication
        const response = await axios.get('http://localhost:5000/api/wardenauth/all', {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setWardenData({
            wardens: response.data.wardens,
            loading: false,
            error: null
          });
        } else {
          throw new Error(response.data.message || 'Failed to fetch wardens');
        }

      } catch (error) {
        console.error('Error fetching warden data:', error);
        let errorMessage = 'Unknown error occurred';
        if (error.response) errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        else if (error.request) errorMessage = 'Network error - unable to reach server';
        else errorMessage = error.message;

        setWardenData({
          wardens: [],
          loading: false,
          error: errorMessage
        });
      }
    };

    fetchStudentData();
    fetchWardenData();
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
    if (wardenData.wardens.length === 0) return 'No wardens found';
    
    // If you want to show all wardens, join their names
    return wardenData.wardens.map(warden => `${warden.firstName} ${warden.lastName}`).join(', ');
    
    // If you want to show just the first warden
    // const firstWarden = wardenData.wardens[0];
    // return `${firstWarden.firstName} ${firstWarden.lastName}`;
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

          {/* Fees Card - Removed conflicting positioning */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">Fees Overview</h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Total Fees:" value="₹50,000" />
              <InfoRow label="Paid:" value="₹30,000" color="text-green-600" />
              <InfoRow label="Due:" value="₹20,000" color="text-red-600" />
              <InfoRow label="Next Due date:" value="15th Oct 2025" color="text-gray-500" />
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">Attendance Summary</h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Today:" value={attendance.today} color={attendance.today === "Present" ? "text-green-600" : "text-red-600"} />
              <InfoRow label="Last 7 days:" value={attendance.last7Days} />
              <InfoRow label="Total absences:" value={attendance.totalAbsences} />
              <InfoRow label="Last absence:" value={attendance.lastAbsenceDate} color="text-gray-500" />
            </div>
          </div>

          {/* Hostel Details Card */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">Hostel Details</h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value="Allocated" color="text-green-600" />
              <InfoRow label="Room no:" value={studentData.roomNo} />
              <InfoRow label="Bed no:" value={studentData.bedAllotment} />
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