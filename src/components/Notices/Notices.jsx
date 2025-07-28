'use client';

import React from 'react';

const notices = [
  {
    date: "02-05-2025",
    subject: "Parents-Teacher Meeting",
    description: "Annual parents meeting scheduled for 25th July",
    status: "Unread",
  },
  {
    date: "03-05-2025",
    subject: "Winter Break Schedule",
    description: "School will be closed from 20th December to 5th January for winter break",
    status: "Unread",
  },
  {
    date: "04-05-2025",
    subject: "Sports Day Announcement",
    description: "Annual sports day will be held on 10th January",
    status: "Read",
  },
];

const statusStyles = {
  Unread: "bg-green-500 text-white",
  Read: "bg-orange-400 text-white",
};

export default function NoticesPage() {
  return (
    <div className="min-h-screen bg-white text-sm font-medium px-4 md:px-8 py-6">
      <div className="max-w-6xl mx-auto w-full">

        {/* Heading */}
        <h1 className="text-xl font-bold text-black mb-4 border-l-4 border-red-600 pl-3">
          Notices
        </h1>

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
                  <tr key={idx} className="bg-white hover:bg-gray-50 transition border-b border-gray-100">
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
