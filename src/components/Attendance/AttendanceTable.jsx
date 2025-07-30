import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  Present: "bg-green-500 text-white",
  Absent: "bg-red-500 text-white",
  Late: "bg-orange-400 text-white",
};

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Get student ID from parent token
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) {
          throw new Error('Parent token not found');
        }

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;
        if (!studentId) {
          throw new Error('Student ID not found in token');
        }

        // Fetch attendance log using axios
        const response = await axios.get(
          `http://localhost:5000/api/studentauth/attendance-log/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${parentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const attendanceLog = response.data.attendanceLog;
        
        // Process and format the attendance data
        const formattedData = processAttendanceData(attendanceLog);
        setAttendanceData(formattedData);

      } catch (error) {
        console.error('Error fetching attendance data:', error);
        let errorMessage = 'Failed to load attendance data';
        
        if (error.response) {
          // Server responded with error status
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = 'Network error - unable to reach server';
        } else {
          // Something else happened
          errorMessage = error.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Function to process raw attendance data into display format
  const processAttendanceData = (attendanceLog) => {
    const processedData = [];
    
    // Sort by date (newest first for display, but we'll also need oldest first for absence calculation)
    const sortedLogNewest = attendanceLog.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
    const sortedLogOldest = [...attendanceLog].sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
    
    // Create a map of dates that have check-ins for quick lookup
    const checkInDates = new Set();
    sortedLogOldest.forEach(entry => {
      const checkInDate = new Date(entry.checkInDate);
      const dateKey = checkInDate.toDateString();
      checkInDates.add(dateKey);
    });
    
    // Find absent days by checking gaps between checkout and next checkin
    const absentDays = [];
    sortedLogOldest.forEach((entry, index) => {
      if (entry.checkOutDate) {
        const checkOutDate = new Date(entry.checkOutDate);
        const nextDayDate = new Date(checkOutDate);
        nextDayDate.setDate(nextDayDate.getDate() + 1);
        
        // Check if there's a check-in on the next day
        const nextDayKey = nextDayDate.toDateString();
        if (!checkInDates.has(nextDayKey)) {
          // Student was absent the next day
          absentDays.push({
            date: nextDayDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              timeZone: 'Asia/Kolkata'
            }),
            in: '-',
            out: '-',
            status: 'Absent'
          });
        }
      }
    });
    
    // Process actual attendance entries
    sortedLogNewest.forEach((entry) => {
      const checkInDate = new Date(entry.checkInDate);
      const checkOutDate = entry.checkOutDate ? new Date(entry.checkOutDate) : null;
      
      // Format date
      const dateStr = checkInDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
      
      // Format check-in time
      const checkInTime = checkInDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      
      // Format check-out time
      const checkOutTime = checkOutDate 
        ? checkOutDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
          })
        : '-';
      
      // Determine status
      let status = 'Present';
      if (!checkOutDate) {
        // No checkout means they're still in or didn't complete the day properly
        status = 'Present'; // Changed logic - no checkout doesn't mean absent
      } else {
        // Check if late (assuming 9:00 AM is standard time)
        const standardTime = new Date(checkInDate);
        standardTime.setHours(9, 0, 0, 0);
        
        if (checkInDate > standardTime) {
          status = 'Late';
        }
      }
      
      processedData.push({
        date: dateStr,
        in: checkInTime,
        out: checkOutTime,
        status: status
      });
    });
    
    // 🔥 NEW LOGIC: Add ongoing present days for students who haven't checked out
    const lastEntry = sortedLogNewest[0]; // Most recent entry
    if (lastEntry && !lastEntry.checkOutDate) {
      // Student is still checked in, add present days from last check-in to today
      const lastCheckIn = new Date(lastEntry.checkInDate);
      const today = new Date();
      
      // Start from the day after last check-in
      const currentDate = new Date(lastCheckIn);
      currentDate.setDate(currentDate.getDate() + 1);
      
      while (currentDate <= today) {
        const dateStr = currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        });
        
        // Check if this date already exists in our data
        const existingEntry = processedData.find(entry => entry.date === dateStr);
        if (!existingEntry) {
          processedData.push({
            date: dateStr,
            in: 'Continuous',
            out: '-',
            status: 'Present'
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Add absent days to the processed data and sort again
    const allData = [...processedData, ...absentDays];
    
    // Sort all data by date (newest first)
    allData.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('/'));
      const dateB = new Date(b.date.split('/').reverse().join('/'));
      return dateB - dateA;
    });
    
    return allData;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Attendance History</h2>
        </div>
        
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Attendance History</h2>
        </div>
        
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Data</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (attendanceData.length === 0) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Attendance History</h2>
        </div>
        
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-600 text-lg font-semibold mb-2">No Attendance Records Found</div>
            <p className="text-gray-500">No attendance data available for this student.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Fixed header to match Dashboard styling */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Attendance History</h2>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold">Present Days</div>
          <div className="text-2xl font-bold text-green-600">
            {attendanceData.filter(entry => entry.status === 'Present').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-semibold">Absent Days</div>
          <div className="text-2xl font-bold text-red-600">
            {attendanceData.filter(entry => entry.status === 'Absent').length}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-orange-800 font-semibold">Late Days</div>
          <div className="text-2xl font-bold text-orange-600">
            {attendanceData.filter(entry => entry.status === 'Late').length}
          </div>
        </div>
      </div>

      {/* Main White Container with dynamic height */}
      <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
          
          {/* Mobile View - Responsive width and text sizes */}
          <div className="md:hidden w-full max-w-xs sm:max-w-sm">
            {/* Mobile Headers - Responsive text size */}
            <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                <div className="text-center">Date</div>
                <div className="text-center">Check-in</div>
                <div className="text-center">Check-out</div>
                <div className="text-center">Status</div>
              </div>
            </div>

            {/* Mobile Data Cards - Responsive padding and text sizes */}
            <div className="space-y-2 sm:space-y-3 mb-0">
              {attendanceData.map((row, i) => (
                <div
                  key={i}
                  className={`bg-white border border-gray-200 p-3 sm:p-5 rounded ${i === attendanceData.length - 1 ? 'mb-0' : ''}`}
                >
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="text-center font-bold text-gray-800 py-1">{row.date}</div>
                    <div className="text-center font-bold text-gray-600 py-1">{row.in}</div>
                    <div className="text-center font-bold text-gray-600 py-1">{row.out}</div>
                    <div className="text-center py-1">
                      <span
                        className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-sm ${statusColors[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table - Status boxes with slight curve */}
          <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ backgroundColor: '#D9D9D9' }}>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Date
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Check-in Time
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Check-out Time
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.date}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.in}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.out}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[70px] md:min-w-[80px] lg:min-w-[90px] px-3 md:px-4 py-1 md:py-2 font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}