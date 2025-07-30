import React from "react";

const feesData = [
  {
    type: "Tuition Fee",
    amount: "₹ 30,000",
    due: "02-05-2025",
    paid: "02-05-2025",
    status: "Paid",
  },
  {
    type: "Library Fee",
    amount: "₹ 15,000",
    due: "03-05-2025",
    paid: "03-05-2025",
    status: "Paid",
  },
  {
    type: "Exam Fee",
    amount: "₹ 10,000",
    due: "04-05-2025",
    paid: "04-05-2025",
    status: "Paid",
  },
  {
    type: "Sports Fee",
    amount: "₹ 5,000",
    due: "05-05-2025",
    paid: "05-05-2025",
    status: "Pending",
  },
];

const transactionData = [
  {
    id: "TXN0012345",
    date: "02-05-2025",
    amount: "₹ 30,000",
    method: "Online",
    status: "Completed",
  },
  {
    id: "TXN0012345",
    date: "03-05-2025",
    amount: "₹ 15,000",
    method: "Online",
    status: "Completed",
  },
  {
    id: "TXN0012345",
    date: "04-05-2025",
    amount: "₹ 10,000",
    method: "Cash",
    status: "Completed",
  },
];

const statusColors = {
  Paid: "bg-green-500 text-white",
  Pending: "bg-yellow-400 text-white",
  Completed: "bg-green-500 text-white",
};

export default function FeesSection() {
  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      
      {/* Fees Paid Section */}
      <div className="mb-6 sm:mb-8">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Fees Paid</h2>
        </div>

        {/* Main White Container with dynamic height */}
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
            
            {/* Mobile View */}
            <div className="md:hidden w-full max-w-xs sm:max-w-sm">
              {/* Mobile Headers - Responsive */}
              <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                  <div className="text-center">Type</div>
                  <div className="text-center">Amount</div>
                  <div className="text-center">Due Date</div>
                  <div className="text-center">Status</div>
                </div>
              </div>

              {/* Mobile Data Cards - Responsive */}
              <div className="space-y-2 sm:space-y-3 mb-0">
                {feesData.map((row, i) => (
                  <div
                    key={i}
                    className={`bg-white border border-gray-200 p-3 sm:p-5 rounded ${i === feesData.length - 1 ? 'mb-0' : ''}`}
                  >
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm items-center">
                      <div className="text-center font-bold text-gray-800 py-1">{row.type}</div>
                      <div className="text-center font-bold text-gray-600 py-1">{row.amount}</div>
                      <div className="text-center font-bold text-gray-600 py-1">{row.due}</div>
                      <div className="flex justify-center items-center py-1">
                        <span
                          className={`flex items-center justify-center w-[60px] sm:w-[70px] h-[28px] sm:h-[32px] text-xs font-semibold rounded-sm ${statusColors[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                    {/* Payment Date shown below in mobile */}
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <span className="text-xs font-bold text-gray-500">Payment Date: </span>
                        <span className="text-xs sm:text-sm font-bold text-gray-700">{row.paid}</span>
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
                        Fee Type
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Amount
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Due Date
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Payment Date
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feesData.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.type}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.amount}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.due}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.paid}
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

      {/* Transaction History Section */}
      <div>
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Transaction History</h2>
        </div>

        {/* Main White Container with dynamic height */}
        <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
            
            {/* Mobile View - Transaction status box size increased */}
            <div className="md:hidden w-full max-w-xs sm:max-w-sm">
              {/* Mobile Headers - Responsive text size */}
              <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                  <div className="text-center">ID</div>
                  <div className="text-center">Date</div>
                  <div className="text-center">Amount</div>
                  <div className="text-center">Status</div>
                </div>
              </div>

              {/* Mobile Data Cards - Status box size increased */}
              <div className="space-y-2 sm:space-y-3 mb-0">
                {transactionData.map((row, i) => (
                  <div
                    key={i}
                    className={`bg-white border border-gray-200 p-3 sm:p-5 rounded ${i === transactionData.length - 1 ? 'mb-0' : ''}`}
                  >
                    <div className="grid grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm items-center">
                      <div className="text-center font-bold text-gray-800 py-1 break-all">{row.id}</div>
                      <div className="text-center font-bold text-gray-600 py-1">{row.date}</div>
                      <div className="text-center font-bold text-gray-600 py-1">{row.amount}</div>
                      <div className="flex justify-center items-center py-1">
                        <span
                          className={`flex items-center justify-center w-[80px] sm:w-[85px] h-[30px] sm:h-[34px] text-xs font-semibold rounded-sm ${statusColors[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                    {/* Method shown below in mobile */}
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <span className="text-xs font-bold text-gray-500">Method: </span>
                        <span className="text-xs sm:text-sm font-bold text-gray-700">{row.method}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table - Transaction status box size increased */}
            <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ backgroundColor: '#D9D9D9' }}>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Transaction ID
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Date
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Amount
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Method
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.id}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.date}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.amount}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                          {row.method}
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6">
                          <div className="flex justify-center items-center">
                            <span
                              className={`flex items-center justify-center w-[95px] md:w-[105px] h-[38px] md:h-[42px] font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status]}`}
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
    </div>
  );
}