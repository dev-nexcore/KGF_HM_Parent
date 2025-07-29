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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-sm font-medium px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-xl font-bold text-black mb-4 border-l-4 border-red-600 pl-3">
            Notices
          </h1>
          
          <div className="bg-white rounded-xl border border-gray-300 p-8 shadow-md flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading notices...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white text-sm font-medium px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-xl font-bold text-black mb-4 border-l-4 border-red-600 pl-3">
            Notices
          </h1>
          
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
      </div>
    );
  }

  // No data state
  if (notices.length === 0) {
    return (
      <div className="min-h-screen bg-white text-sm font-medium px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-xl font-bold text-black mb-4 border-l-4 border-red-600 pl-3">
            Notices
          </h1>
          
          <div className="bg-white rounded-xl border border-gray-300 p-8 shadow-md flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-gray-600 text-lg font-semibold mb-2">No Notices Found</div>
              <p className="text-gray-500">No notices available at the moment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-sm font-medium px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto w-full">

        {/* Heading */}
        <h1 className="text-xl font-bold text-black mb-4 border-l-4 border-red-600 pl-3">
          Notices
        </h1>

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
        <div className="bg-white rounded-xl border border-gray-300 p-3 sm:p-5 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 shadow-inner shadow-black/20 rounded-t-xl z-0" />

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
                {notices.map((notice, idx) => (
                  <tr 
                    key={notice._id || idx} 
                    className="bg-white hover:bg-gray-50 transition border-b border-gray-100 cursor-pointer"
                    onClick={() => notice.status === 'Unread' && markAsRead(notice._id)}
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
      </div>
    </div>
  );
}