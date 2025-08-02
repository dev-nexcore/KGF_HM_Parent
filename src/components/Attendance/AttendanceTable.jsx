import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  Present: "bg-green-500 text-white",
  "Day Trip": "bg-blue-500 text-white",
  "Extended Away": "bg-orange-500 text-white",
  "Currently Away": "bg-red-500 text-white",
};

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    presentDays: 0,
    absentDays: 0,
    outings: 0
  });
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
        const result = processAttendanceData(attendanceLog);
        setAttendanceData(result.entries);
        setSummaryStats(result.summary);

      } catch (error) {
        console.error('Error fetching attendance data:', error);
        let errorMessage = 'Failed to load attendance data';
        
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = 'Network error - unable to reach server';
        } else {
          errorMessage = error.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // 🔧 CORRECTED: Count unique calendar days, not check-ins
  const processAttendanceData = (attendanceLog) => {
    const processedData = [];
    
    if (!attendanceLog || attendanceLog.length === 0) {
      return {
        entries: [],
        summary: { presentDays: 0, absentDays: 0, outings: 0 }
      };
    }
    
    // Sort by date (oldest first for processing)
    const sortedLog = [...attendanceLog].sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
    
    // Track unique days and outings
    const uniquePresentDays = new Set();
    let absentDays = 0;
    let outings = 0;
    
    const today = new Date();
    
    // Process each entry
    for (let i = 0; i < sortedLog.length; i++) {
      const currentEntry = sortedLog[i];
      const nextEntry = sortedLog[i + 1];
      
      const checkInDate = new Date(currentEntry.checkInDate);
      const checkOutDate = currentEntry.checkOutDate ? new Date(currentEntry.checkOutDate) : null;
      
      // Add this day to unique present days set
      const dayKey = checkInDate.toDateString(); // "Mon Aug 02 2025"
      uniquePresentDays.add(dayKey);
      
      // Format for display
      const dateStr = checkInDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
      
      const checkInTime = checkInDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      
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
      
      if (checkOutDate) {
        outings++; // Count every checkout as an outing
        
        if (nextEntry) {
          // Calculate hours between checkout and next checkin
          const nextCheckIn = new Date(nextEntry.checkInDate);
          const hoursAway = (nextCheckIn - checkOutDate) / (1000 * 60 * 60);
          
          if (hoursAway >= 24) {
            status = 'Extended Away';
            // Calculate days absent (between checkout and next checkin)
            const daysAway = Math.floor(hoursAway / 24);
            absentDays += daysAway;
          } else {
            status = 'Day Trip'; // Went out but came back same day
          }
        } else {
          // Last entry with checkout - check if they're still away
          const hoursAway = (today - checkOutDate) / (1000 * 60 * 60);
          if (hoursAway >= 24) {
            status = 'Currently Away';
            const daysAway = Math.floor(hoursAway / 24);
            absentDays += daysAway;
          } else {
            status = 'Day Trip'; // Recent checkout, not yet 24 hours
          }
        }
      } else {
        // No checkout - student is still in hostel
        status = 'Present';
      }
      
      // Add entry to display data
      processedData.push({
        date: dateStr,
        in: checkInTime,
        out: checkOutTime,
        status: status
      });
    }
    
    // Sort for display (newest first)
    processedData.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('/'));
      const dateB = new Date(b.date.split('/').reverse().join('/'));
      return dateB - dateA;
    });
    
    return {
      entries: processedData,
      summary: {
        presentDays: uniquePresentDays.size, // 🔧 FIXED: Count unique days, not check-ins
        absentDays: absentDays,
        outings: outings
      }
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
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
      {/* Header */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Attendance History</h2>
      </div>

      {/* Enhanced Summary Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold">Present Days</div>
          <div className="text-2xl font-bold text-green-600">
            {summaryStats.presentDays}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Unique calendar days
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-semibold">Days Away</div>
          <div className="text-2xl font-bold text-red-600">
            {summaryStats.absentDays}
          </div>
          <div className="text-xs text-red-600 mt-1">
            24+ hours away
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-800 font-semibold">Total Outings</div>
          <div className="text-2xl font-bold text-blue-600">
            {summaryStats.outings}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Times checked out
          </div>
        </div>
      </div>

      {/* Main White Container */}
      <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
          
          {/* Mobile View */}
          <div className="md:hidden w-full max-w-xs sm:max-w-sm">
            <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                <div className="text-center">Date</div>
                <div className="text-center">Check-in</div>
                <div className="text-center">Check-out</div>
                <div className="text-center">Status</div>
              </div>
            </div>

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
                        className={`inline-flex items-center justify-center px-1 sm:px-2 py-1 text-xs font-semibold rounded-sm ${statusColors[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
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
                          className={`inline-flex items-center justify-center min-w-[90px] md:min-w-[110px] lg:min-w-[120px] px-3 md:px-4 py-1 md:py-2 font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status]}`}
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