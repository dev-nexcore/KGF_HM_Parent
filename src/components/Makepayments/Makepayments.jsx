'use client';

import React from 'react';

const fees = [
  {
    type: "Tuition Fee", // Fixed spelling
    dueDate: "02-05-2025",
    amount: "₹ 30,000",
    status: "Pending",
  },
  {
    type: "Library Fee",
    dueDate: "03-05-2025",
    amount: "₹ 15,000",
    status: "Pending",
  },
  {
    type: "Annual Sports fee",
    dueDate: "05-05-2025",
    amount: "₹ 5,000",
    status: "Pending",
  },
];

export default function MakePaymentsPage() {
  return (
    <div className="min-h-screen bg-white text-sm font-medium px-4 md:px-8 lg:px-12 py-0">
      <div className="max-w-7xl mx-auto w-full">
        {/* Heading */}
        <h1 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-3 text-black">
          Make Payments
        </h1>

        {/* Box with inner shadows */}
        <div className="bg-white rounded-2xl border border-gray-300 px-3 sm:px-6 py-6 relative overflow-hidden">
          {/* Top inner shadow */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/10 to-transparent z-10 rounded-t-2xl" />
          
          {/* Left inner shadow */}
          <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent z-10 rounded-l-2xl" />
          
          {/* Right inner shadow */}
          <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-black/5 to-transparent z-10 rounded-r-2xl" />

          {/* Responsive Table View for all screen sizes */}
          <div className="relative z-20">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[20%] md:w-1/5" />
                <col className="w-[20%] md:w-1/5" />
                <col className="w-[20%] md:w-1/5" />
                <col className="w-[20%] md:w-1/5" />
                <col className="w-[20%] md:w-1/5" />
              </colgroup>
              <thead className="bg-[#D9D9D9] text-gray-800">
                <tr>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-left text-xs sm:text-sm">Fee Type</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Due Date</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Amount</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Status</th>
                  <th className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 font-semibold text-center text-xs sm:text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="text-black font-semibold">
                {fees.map((fee, idx) => (
                  <tr key={idx} className="bg-white hover:bg-gray-50 transition border-b border-gray-100">
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-left text-xs sm:text-sm">
                      <div className="break-words">{fee.type}</div>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center text-xs sm:text-sm">
                      <div className="break-words">{fee.dueDate}</div>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center text-xs sm:text-sm">
                      <div className="break-words">{fee.amount}</div>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center">
                      <span className="bg-[#ffa726] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs lg:text-sm font-semibold">
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-2 px-1 sm:py-3 sm:px-2 lg:py-4 lg:px-6 text-center">
                      <a href="/payment">
                        <button className="bg-[#33cc33] hover:bg-[#28a428] text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs lg:text-sm shadow">
                          Pay Now
                        </button>
                      </a>
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
