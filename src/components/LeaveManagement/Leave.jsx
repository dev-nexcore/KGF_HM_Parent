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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const ROWS_PER_PAGE = 10;
  
  const clearFilters = () => {
    setStatusFilter(null);
    setSearchQuery('');
    setDateFilter('');
  };

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
        type: leave.leaveType === 'Others' && leave.otherLeaveType ? `Others (${leave.otherLeaveType})` : leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
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
  const filteredData = leaveData.filter(entry => {
    let matchStatus = true;
    if (statusFilter) {
      matchStatus = entry.status === statusFilter;
    }
    
    let matchSearch = true;
    if (searchQuery) {
       matchSearch = (entry.type || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                     (entry.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    }

    let matchDate = true;
    if (dateFilter) {
      const filterD = new Date(dateFilter);
      const filterEnd = new Date(dateFilter);
      filterEnd.setHours(23, 59, 59, 999);
      
      const reqStart = entry.startDate ? new Date(entry.startDate) : new Date(0);
      const reqEnd = entry.endDate ? new Date(entry.endDate) : reqStart;
      
      matchDate = (filterD <= reqEnd) && (filterEnd >= reqStart);
    }
    
    return matchStatus && matchSearch && matchDate;
  });
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
        <div className="mb-3 grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
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

        {/* ── FILTER BAR ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Filter Leave Requests</h2>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Leave Type or Reason"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <div className="relative">
                <select
                  value={statusFilter || 'ALL'}
                  onChange={(e) => {
                    if (e.target.value === 'ALL') setStatusFilter(null);
                    else setStatusFilter(e.target.value);
                  }}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARENT_APPROVED">Parent Approved</option>
                  <option value="PARENT_REJECTED">Parent Rejected</option>
                  <option value="WARDEN_APPROVED">Warden Approved</option>
                  <option value="WARDEN_REJECTED">Warden Rejected</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer [color-scheme:light] [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>

            {/* Clear */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-transparent uppercase tracking-wider select-none">Action</label>
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-500 border border-red-200 hover:border-red-500 text-sm font-semibold rounded-lg px-4 py-2.5 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="flex-1 w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden flex flex-col" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Mobile View */}
          <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {paginatedData.map((row, i) => (
              <div
                key={row._id || i}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{row.type}</h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">Record #{startIndex + i + 1}</p>
                  </div>
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full ${statusColors[row.status]}`}>
                    {row.status}
                  </span>
                </div>
                
                <div className="px-4 py-3 bg-gray-50/50">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex-1">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">From Date</span>
                      <span className="font-medium text-gray-700">{row.from}</span>
                    </div>
                    <div className="px-3 text-gray-300">→</div>
                    <div className="flex-1 text-right">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">To Date</span>
                      <span className="font-medium text-gray-700">{row.to}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                  <button
                    onClick={() => handleView(row)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Details
                  </button>
                  {row.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleLeaveAction(row, 'approved')}
                        disabled={actionLoading[row._id]}
                        className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleLeaveAction(row, 'rejected')}
                        disabled={actionLoading[row._id]}
                        className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {paginatedData.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm font-medium">
                No leave records found.
              </div>
            )}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#4F8CCF] text-white px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                Leave Request Details
              </h3>
              <button 
                onClick={closeViewModal}
                className="text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-1.5 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto">
              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Leave Type
                  </label>
                  <p className="text-base font-medium text-gray-800 bg-gray-50/50 px-3 py-2 rounded border border-gray-100">
                    {viewLeave.type}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Current Status
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold capitalize ${
                        viewLeave.status.toLowerCase() === 'approved'
                          ? 'bg-green-500 text-white'
                          : viewLeave.status.toLowerCase() === 'rejected'
                          ? 'bg-red-500 text-white'
                          : viewLeave.status.toLowerCase() === 'parent_approved'
                          ? 'bg-purple-500 text-white'
                          : viewLeave.status.toLowerCase() === 'parent_rejected'
                          ? 'bg-pink-500 text-white'
                          : (viewLeave.status.toLowerCase() === 'warden_approved' || viewLeave.status.toLowerCase() === 'warden_rejected')
                          ? 'bg-indigo-500 text-white'
                          : 'bg-[#4F8DCF] text-white'
                    }`}>
                      {viewLeave.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Start Date
                  </label>
                  <p className="text-base font-medium text-gray-800 bg-gray-50/50 px-3 py-2 rounded border border-gray-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {viewLeave.from}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    End Date
                  </label>
                  <p className="text-base font-medium text-gray-800 bg-gray-50/50 px-3 py-2 rounded border border-gray-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {viewLeave.to}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Duration
                  </label>
                  <p className="text-base font-medium text-gray-800 bg-gray-50/50 px-3 py-2 rounded border border-gray-100">
                    {viewLeave.duration} day(s)
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Reason for Leave
                  </label>
                  <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100 text-gray-700 min-h-[80px] whitespace-pre-wrap">
                    {viewLeave.reason || <span className="text-gray-400 italic">No reason provided.</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
              <button 
                onClick={closeViewModal} 
                className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-5 py-2 rounded-lg font-semibold transition-colors"
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