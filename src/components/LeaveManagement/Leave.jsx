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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const ROWS_PER_PAGE = 10;

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

  // View modal handlers
  const handleView = (leave) => {
    setViewLeave(leave);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewLeave(null);
  };

  // Filter + Pagination logic
  const filteredData = statusFilter
    ? leaveData.filter(entry => entry.status === statusFilter)
    : leaveData;
  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ROWS_PER_PAGE);

  const handleFilterClick = (status) => {
    setStatusFilter(prev => prev === status ? null : status);
    setCurrentPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
        </div>
        
        <div className="flex-1 w-full bg-white rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center">
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
      <div className="h-[calc(100vh-64px)] flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
        </div>
        
        <div className="flex-1 w-full bg-white rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center">
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
      <div className="h-[calc(100vh-64px)] flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Leave Management</h2>
        </div>
        
        <div className="flex-1 w-full bg-white rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center">
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
      <div className="h-[calc(100vh-64px)] flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden">
        <div className="flex items-center ml-2 mb-3 flex-shrink-0">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Leave Management</h2>
        </div>

        {/* Summary Statistics - Clickable */}
        <div className="mb-3 grid grid-cols-4 gap-3 flex-shrink-0">
          <div
            onClick={() => { setStatusFilter(null); setCurrentPage(1); }}
            className={`bg-blue-50 border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === null ? 'border-blue-500 ring-2 ring-blue-300 shadow-md' : 'border-blue-200'
            }`}
          >
            <span className="text-blue-800 font-semibold text-sm">All</span>
            <span className="text-2xl font-bold text-blue-600">
              {leaveData.length}
            </span>
          </div>
          <div
            onClick={() => handleFilterClick('APPROVED')}
            className={`bg-green-50 border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'APPROVED' ? 'border-green-500 ring-2 ring-green-300 shadow-md' : 'border-green-200'
            }`}
          >
            <span className="text-green-800 font-semibold text-sm">Approved</span>
            <span className="text-2xl font-bold text-green-600">
              {leaveData.filter(entry => entry.status === 'APPROVED').length}
            </span>
          </div>
          <div
            onClick={() => handleFilterClick('REJECTED')}
            className={`bg-red-50 border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'REJECTED' ? 'border-red-500 ring-2 ring-red-300 shadow-md' : 'border-red-200'
            }`}
          >
            <span className="text-red-800 font-semibold text-sm">Rejected</span>
            <span className="text-2xl font-bold text-red-600">
              {leaveData.filter(entry => entry.status === 'REJECTED').length}
            </span>
          </div>
          <div
            onClick={() => handleFilterClick('PENDING')}
            className={`bg-yellow-50 border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-300 shadow-md' : 'border-yellow-200'
            }`}
          >
            <span className="text-yellow-800 font-semibold text-sm">Pending</span>
            <span className="text-2xl font-bold text-yellow-600">
              {leaveData.filter(entry => entry.status === 'PENDING').length}
            </span>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="flex-1 w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Mobile View */}
          <div className="md:hidden flex-1 overflow-y-auto p-4">
            {/* Mobile Header */}
            <div className="p-3 mb-3 rounded-lg sticky top-0 z-10" style={{ backgroundColor: '#D9D9D9' }}>
              <div className="grid grid-cols-5 gap-2 text-xs font-bold text-gray-800">
                <div className="text-center">Sr</div>
                <div className="text-center">Type</div>
                <div className="text-center">From</div>
                <div className="text-center">To</div>
                <div className="text-center">Action</div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3">
              {paginatedData.map((row, i) => (
                <div
                  key={row._id || i}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-3">
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="text-center text-sm font-bold text-gray-800">
                        {startIndex + i + 1}
                      </div>
                      <div className="text-center text-xs font-semibold text-gray-700">
                        {row.type}
                      </div>
                      <div className="text-center text-xs text-gray-600">
                        {row.from}
                      </div>
                      <div className="text-center text-xs text-gray-600">
                        {row.to}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleView(row)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors w-full"
                        >
                          View
                        </button>
                        {row.status === 'PENDING' && (
                          <div className="flex gap-1 w-full">
                            <button
                              onClick={() => handleLeaveAction(row, 'approved')}
                              disabled={actionLoading[row._id]}
                              className="flex-1 px-1 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleLeaveAction(row, 'rejected')}
                              disabled={actionLoading[row._id]}
                              className="flex-1 px-1 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Status badge below */}
                    <div className="mt-2 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-sm ${statusColors[row.status]}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr style={{ backgroundColor: '#D9D9D9' }}>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-sm md:text-base">
                      Sr No
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-sm md:text-base">
                      Leave Type
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-sm md:text-base">
                      From Date
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-sm md:text-base">
                      To Date
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-sm md:text-base">
                      Status
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-sm md:text-base">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, i) => (
                    <tr
                      key={row._id || i}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <td className="py-3 md:py-4 px-4 md:px-6 font-semibold text-gray-700 text-center text-xs md:text-sm">
                        {startIndex + i + 1}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-semibold text-gray-700 text-center text-xs md:text-sm">
                        {row.type}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-semibold text-gray-700 text-center text-xs md:text-sm">
                        {row.from}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-semibold text-gray-700 text-center text-xs md:text-sm">
                        {row.to}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="flex justify-center items-center">
                          <span
                            className={`flex items-center justify-center w-[80px] md:w-[90px] h-[32px] md:h-[36px] font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status]}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="flex justify-center items-center gap-2">
                          {/* View Icon Button */}
                          <button
                            onClick={() => handleView(row)}
                            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Approve / Reject icon buttons for PENDING */}
                          {row.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleLeaveAction(row, 'approved')}
                                disabled={actionLoading[row._id]}
                                className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleLeaveAction(row, 'rejected')}
                                disabled={actionLoading[row._id]}
                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} - {Math.min(startIndex + ROWS_PER_PAGE, filteredData.length)} of {filteredData.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && viewLeave && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Leave Details
              </h3>
              <button
                onClick={closeViewModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Leave Type */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Leave Type</span>
                <span className="text-sm font-bold text-gray-800">{viewLeave.type}</span>
              </div>

              {/* From Date */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">From Date</span>
                <span className="text-sm font-bold text-gray-800">{viewLeave.from}</span>
              </div>

              {/* To Date */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">To Date</span>
                <span className="text-sm font-bold text-gray-800">{viewLeave.to}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Duration</span>
                <span className="text-sm font-bold text-gray-800">{viewLeave.duration} day(s)</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-sm ${statusColors[viewLeave.status]}`}>
                  {viewLeave.status}
                </span>
              </div>

              {/* Reason */}
              <div className="py-3">
                <span className="text-sm font-medium text-gray-500 block mb-2">Reason</span>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 overflow-hidden">
                  <p className="text-sm font-medium text-gray-700 leading-relaxed break-all" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                    {viewLeave.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Approve/Reject) */}
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