import React, { useState, useEffect } from "react";
import axios from "axios";

const statusColors = {
  APPROVED: "bg-green-500 text-white",
  REJECTED: "bg-red-500 text-white",
  PENDING: "bg-yellow-400 text-white",
};

export default function LeaveManagementTable() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
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

        // Fetch leave data using axios
        const response = await axios.get(
          `http://localhost:5000/api/parentauth/leave-management`,
          {
            params: { studentId },
            headers: {
              Authorization: `Bearer ${parentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const leaveHistory = response.data.leaveHistory;
        
        // Process and format the leave data
        const formattedData = processLeaveData(leaveHistory);
        setLeaveData(formattedData);

      } catch (error) {
        console.error('Error fetching leave data:', error);
        let errorMessage = 'Failed to load leave data';
        
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

    fetchLeaveData();
  }, []);

  // Function to process raw leave data into display format
  const processLeaveData = (leaveHistory) => {
    return leaveHistory.map(leave => {
      // Format dates from ISO to DD-MM-YYYY
      const startDate = new Date(leave.startDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
      
      const endDate = new Date(leave.endDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });

      return {
        _id: leave._id,
        type: leave.leaveType,
        from: startDate,
        to: endDate,
        reason: leave.reason,
        status: leave.status.toUpperCase(), // Ensure uppercase for color mapping
        duration: leave.duration
      };
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header - Outside the main container */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
  <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
</div>
        
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading leave data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header - Outside the main container */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
  <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
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
  if (leaveData.length === 0) {
    return (
     <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header - Outside the main container */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
  <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
</div>
        
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-600 text-lg font-semibold mb-2">No Leave Records Found</div>
            <p className="text-gray-500">No leave applications found for this student.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
   <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header - Outside the main container */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
  <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
</div>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold">Approved Leaves</div>
          <div className="text-2xl font-bold text-green-600">
            {leaveData.filter(entry => entry.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-semibold">Rejected Leaves</div>
          <div className="text-2xl font-bold text-red-600">
            {leaveData.filter(entry => entry.status === 'REJECTED').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800 font-semibold">Pending Leaves</div>
          <div className="text-2xl font-bold text-yellow-600">
            {leaveData.filter(entry => entry.status === 'PENDING').length}
          </div>
        </div>
      </div>

      {/* Main White Container with dynamic height */}
      <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
          
          {/* Mobile View - All text made bold */}
          <div className="md:hidden w-full max-w-sm">
            {/* Mobile Headers - Increased text size */}
            <div className="p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
              <div className="grid grid-cols-4 gap-3 text-base font-bold text-gray-800">
                <div className="text-center">Type</div>
                <div className="text-center">From</div>
                <div className="text-center">To</div>
                <div className="text-center">Status</div>
              </div>
            </div>

            {/* Mobile Data Cards - Status box width increased */}
            <div className="space-y-3 mb-0">
              {leaveData.map((row, i) => (
                <div
                  key={row._id || i}
                  className={`bg-white border border-gray-200 p-5 rounded ${i === leaveData.length - 1 ? 'mb-0' : ''}`}
                >
                  <div className="grid grid-cols-4 gap-3 text-sm items-center">
                    <div className="text-center font-bold text-gray-800 py-1">{row.type}</div>
                    <div className="text-center font-bold text-gray-600 py-1">{row.from}</div>
                    <div className="text-center font-bold text-gray-600 py-1">{row.to}</div>
                    <div className="flex justify-center items-center py-1">
                      <span
                        className={`flex items-center justify-center w-[80px] h-[32px] text-xs font-semibold rounded-sm ${statusColors[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                  {/* Reason shown below in mobile - made bold */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <span className="text-xs font-bold text-gray-500">Reason: </span>
                      <span className="text-sm font-bold text-gray-700">{row.reason}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table - Header text size increased */}
          <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ backgroundColor: '#D9D9D9' }}>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Leave Type
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      From Date
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      To Date
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Reason
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaveData.map((row, i) => (
                    <tr
                      key={row._id || i}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.type}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.from}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.to}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.reason}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="flex justify-center items-center">
                          <span
                            className={`flex items-center justify-center w-[90px] md:w-[100px] h-[36px] md:h-[40px] font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status]}`}
                          >
                            {row.status}
                          </span>
                        </div>
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