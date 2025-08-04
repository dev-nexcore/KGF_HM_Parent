'use client';
import Link from 'next/link';
import React from 'react';

const fees = [
  {
    type: "Tuition Fee",
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

export default function MakePaymentsPage({ onPayNowClick }) { // Added onPayNowClick prop
  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Fixed header to match Dashboard styling */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Make Payments</h2>
      </div>

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
                    <button 
                      onClick={onPayNowClick} // Use the prop instead of Link
                      className="bg-[#33cc33] hover:bg-[#28a428] text-white font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-xs lg:text-sm shadow"
                    >
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}