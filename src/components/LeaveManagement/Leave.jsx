import React, { useState, useEffect } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";

const statusColors = {
  APPROVED: "bg-green-500 text-white",
  REJECTED: "bg-red-500 text-white", 
  PENDING: "bg-yellow-400 text-white",
};

export default function LeaveManagementTable() {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [parentComment, setParentComment] = useState('');

  useEffect(() => {
    // Check if user came from email link and handle auto-login
  const handleEmailRedirect = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromEmail = urlParams.get('fromEmail');
  
  if (fromEmail === 'true') {
    const parentToken = localStorage.getItem('parentToken');
    if (!parentToken) {
      // No token found, redirect to login with return URL
      window.location.href = `/`;
      return false;
    }
    // Token exists, user will automatically see the page
  }
  return true;
};

    if (!handleEmailRedirect()) {
      return; // Exit if redirecting to login
    }

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
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/leave-management`,
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
        status: leave.status.toUpperCase(),
        duration: leave.duration
      };
    });
  };

  // Handle leave approval/rejection
  const handleLeaveAction = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setParentComment('');
    setShowModal(true);
  };

  const confirmLeaveAction = async () => {
    if (!selectedLeave) return;

    setActionLoading(prev => ({ ...prev, [selectedLeave._id]: true }));

    try {
      const parentToken = localStorage.getItem('parentToken');
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/leave-status`,
        {
          leaveId: selectedLeave._id,
          status: modalAction,
          parentComment: parentComment.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the leave data in state
      setLeaveData(prevData => 
        prevData.map(leave => 
          leave._id === selectedLeave._id 
            ? { ...leave, status: modalAction.toUpperCase() }
            : leave
        )
      );

      // Show success message
      toast.success(`Leave request ${modalAction} successfully!`);
      
      setShowModal(false);
      setSelectedLeave(null);
      setParentComment('');

    } catch (error) {
      console.error(`Error ${modalAction} leave:`, error);
      toast.error(error.response?.data?.message || `Failed to ${modalAction} leave request`);
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedLeave._id]: false }));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLeave(null);
    setParentComment('');
  };

  // Action buttons component
const ProfessionalActionButtons = ({ leave }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  if (leave.status !== 'PENDING') {
    return (
      <div className="flex justify-center items-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          leave.status === 'APPROVED' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            leave.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'
          }`}></div>
          {leave.status === 'APPROVED' ? 'Approved' : 'Declined'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        Review
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-1 right-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={() => {
              handleLeaveAction(leave, 'approved');
              setShowDropdown(false);
            }}
            disabled={actionLoading[leave._id]}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            onClick={() => {
              handleLeaveAction(leave, 'rejected');
              setShowDropdown(false);
            }}
            disabled={actionLoading[leave._id]}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline
          </button>
        </div>
      )}
    </div>
  );
};

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
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
    <>
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
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

        {/* Main Table Container */}
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
            
            {/* Improved Mobile View with Better Spacing */}
            <div className="md:hidden w-full">
              {/* Mobile Header - More Spacious */}
              <div className="p-4 mb-4 rounded-lg" style={{ backgroundColor: '#D9D9D9' }}>
                <div className="grid grid-cols-4 gap-4 text-sm font-bold text-gray-800">
                  <div className="text-center">Type</div>
                  <div className="text-center">From</div>
                  <div className="text-center">To</div>
                  <div className="text-center">Action</div>
                </div>
              </div>

              {/* Mobile Cards with Better Spacing */}
              <div className="space-y-4">
                {leaveData.map((row, i) => (
                  <div
                    key={row._id || i}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Top Section - Type, Dates, Action */}
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-800 leading-tight">
                            {row.type}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-600 leading-tight break-words">
                            {row.from}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-600 leading-tight break-words">
                            {row.to}
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <div className="scale-90">
                            <ProfessionalActionButtons leave={row} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Section - Reason and Status */}
                    <div className="px-4 pb-4">
                      <div className="border-t border-gray-100 pt-3 space-y-3">
                        {/* Reason */}
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs font-semibold text-gray-500 mb-1">Reason:</div>
                          <div className="text-sm font-medium text-gray-700 leading-relaxed">
                            {row.reason}
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="text-center">
                          <span
                            className={`inline-block px-4 py-2 text-xs font-semibold rounded-md ${statusColors[row.status]}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table - Unchanged */}
            <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
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
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Action
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
                        <td className="py-3 md:py-4 px-4 md:px-6">
                          <ProfessionalActionButtons leave={row} />
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

      {/* Confirmation Modal */}
      {showModal && (
<div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out">

          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              {modalAction === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to <strong>{modalAction === 'approved' ? 'approve' : 'reject'}</strong> this leave request?
              </p>
              
              <div className="bg-gray-50 p-3 rounded mb-4">
                <p><strong>Leave Type:</strong> {selectedLeave?.type}</p>
                <p><strong>Duration:</strong> {selectedLeave?.from} to {selectedLeave?.to}</p>
                <p><strong>Reason:</strong> {selectedLeave?.reason}</p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional):
              </label>
              <textarea
                value={parentComment}
                onChange={(e) => setParentComment(e.target.value)}
                placeholder={`Add a comment about your ${modalAction === 'approved' ? 'approval' : 'rejection'}...`}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeaveAction}
                disabled={actionLoading[selectedLeave?._id]}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalAction === 'approved' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading[selectedLeave?._id] 
                  ? 'Processing...' 
                  : modalAction === 'approved' ? 'Approve' : 'Reject'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}