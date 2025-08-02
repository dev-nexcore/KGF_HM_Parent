'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const statusStyles = {
  Unread: "bg-green-500 text-white",
  Read: "bg-orange-400 text-white",
};

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [displayedNotices, setDisplayedNotices] = useState(10);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        
        // Get parent token
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) {
          throw new Error('Parent token not found');
        }

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;
        if (!studentId) {
          throw new Error('Student ID not found in token');
        }

        // Fetch notices using axios
        const response = await axios.get(
          `http://localhost:5000/api/parentauth/notices`,
          {
            params: { studentId },
            headers: {
              Authorization: `Bearer ${parentToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const noticesData = response.data.notices || [];
        
        // Process and format the notices data
        const formattedData = processNoticesData(noticesData);
        setNotices(formattedData);
        setDisplayedNotices(10); // Reset to show first 10 notices

      } catch (error) {
        console.error('Error fetching notices:', error);
        let errorMessage = 'Failed to load notices';
        
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

    fetchNotices();
  }, []);

  // Function to process raw notices data into display format
  const processNoticesData = (noticesData) => {
    return noticesData.map(notice => {
      // Format date from ISO to DD-MM-YYYY
      const issueDate = new Date(notice.issueDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });

      return {
        _id: notice._id,
        date: issueDate,
        subject: notice.title,
        description: notice.message,
        status: notice.readStatus || 'Unread', // Default to Unread if no readStatus
        template: notice.template,
        recipientType: notice.recipientType
      };
    });
  };

  // Function to mark notice as read
  const markAsRead = async (noticeId) => {
    try {
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) return;

      await axios.patch(
        `http://localhost:5000/api/parentauth/notices/${noticeId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setNotices(prevNotices => 
        prevNotices.map(notice => 
          notice._id === noticeId ? { ...notice, status: 'Read' } : notice
        )
      );
    } catch (error) {
      console.error('Error marking notice as read:', error);
    }
  };

  // Function to handle notice click - opens popup and marks as read
  const handleNoticeClick = async (notice) => {
    setSelectedNotice(notice);
    setIsPopupOpen(true);
    
    // Mark as read if it's unread
    if (notice.status === 'Unread') {
      await markAsRead(notice._id);
    }
  };

  // Function to close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedNotice(null);
  };

  // Function to show more notices
  const showMoreNotices = () => {
    setDisplayedNotices(prev => prev + 10);
  };

  // Get notices to display (limited by displayedNotices)
  const noticesToDisplay = notices.slice(0, displayedNotices);
  const hasMoreNotices = displayedNotices < notices.length;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Notices</h2>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-300 p-8 shadow-md flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading notices...</p>
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
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Notices</h2>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-300 p-8 shadow-md flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Notices</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (notices.length === 0) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Notices</h2>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-300 p-8 shadow-md flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-600 text-lg font-semibold mb-2">No Notices Found</div>
            <p className="text-gray-500">No notices available at the moment.</p>
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
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Notices</h2>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold">Unread Notices</div>
          <div className="text-2xl font-bold text-green-600">
            {notices.filter(notice => notice.status === 'Unread').length}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-orange-800 font-semibold">Read Notices</div>
          <div className="text-2xl font-bold text-orange-600">
            {notices.filter(notice => notice.status === 'Read').length}
          </div>
        </div>
      </div>

      {/* Outer box with shadow */}
      <div className="bg-white rounded-xl border border-gray-300 p-3 shadow-inner shadow-black/30 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 rounded-t-xl z-0" />

        {/* Fixed-width table for all screen sizes */}
        <div className="relative z-10">
          <table className="w-full text-center border-collapse table-fixed">
            <colgroup>
              <col className="w-[20%] md:w-[15%]" />
              <col className="w-[25%] md:w-[25%]" />
              <col className="w-[40%] md:w-[45%]" />
              <col className="w-[15%] md:w-[15%]" />
            </colgroup>
            <thead className="bg-[#D9D9D9] text-gray-700">
              <tr>
                <th className="py-2 px-1 sm:py-3 sm:px-4 text-center text-xs sm:text-sm">Date</th>
                <th className="py-2 px-1 sm:py-3 sm:px-4 text-center text-xs sm:text-sm">Subject</th>
                <th className="py-2 px-1 sm:py-3 sm:px-4 text-center text-xs sm:text-sm">Description</th>
                <th className="py-2 px-1 sm:py-3 sm:px-4 text-center text-xs sm:text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {noticesToDisplay.map((notice, idx) => (
                <tr 
                  key={notice._id || idx} 
                  className="bg-white hover:bg-gray-50 transition border-b border-white cursor-pointer"
                  onClick={() => handleNoticeClick(notice)}
                >
                  <td className="py-3 px-1 sm:py-4 sm:px-4 font-semibold text-xs sm:text-sm">
                    <div className="break-words">
                      {notice.date}
                    </div>
                  </td>
                  <td className="py-3 px-1 sm:py-4 sm:px-4 font-semibold text-xs sm:text-sm">
                    <div className="break-words line-clamp-2">
                      {notice.subject}
                    </div>
                  </td>
                  <td className="py-3 px-1 sm:py-4 sm:px-4 font-semibold text-xs sm:text-sm">
                    <div className="break-words line-clamp-3 text-left sm:text-center">
                      {notice.description}
                    </div>
                  </td>
                  <td className="py-3 px-1 sm:py-4 sm:px-4">
                    <span
                      className={`inline-block px-1 sm:px-2 py-1 rounded text-xs font-semibold ${statusStyles[notice.status]}`}
                    >
                      {notice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More Button */}
      {hasMoreNotices && (
        <div className="flex justify-center mt-6">
          <button
            onClick={showMoreNotices}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Show More ({notices.length - displayedNotices} remaining)
          </button>
        </div>
      )}

      {/* Notice Popup Modal */}
      {isPopupOpen && selectedNotice && (
<div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out">


          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Notice Details</h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Date and Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-800">{selectedNotice.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[selectedNotice.status]}`}
                >
                  {selectedNotice.status}
                </span>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Subject</p>
                <h4 className="text-lg font-semibold text-gray-800 leading-tight">
                  {selectedNotice.subject}
                </h4>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedNotice.description}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {(selectedNotice.template || selectedNotice.recipientType) && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">Additional Information</p>
                  <div className="space-y-2">
                    {selectedNotice.template && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Template:</span> {selectedNotice.template}
                      </p>
                    )}
                    {selectedNotice.recipientType && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Recipient Type:</span> {selectedNotice.recipientType}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={closePopup}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}