import React from "react";

const leaveData = [
  { type: "Sick Leave", from: "02-05-2025", to: "02-05-2025", reason: "Fever", status: "APPROVED" },
  { type: "Casual Leave", from: "03-05-2025", to: "03-05-2025", reason: "Family Event", status: "APPROVED" },
  { type: "Emergency Leave", from: "04-05-2025", to: "04-05-2025", reason: "Circumstances", status: "APPROVED" },
  { type: "Casual Leave", from: "05-05-2025", to: "05-05-2025", reason: "Personal Work", status: "REJECTED" },
  { type: "Sick Leave", from: "06-05-2025", to: "06-05-2025", reason: "Fever", status: "APPROVED" },
  { type: "Casual Leave", from: "07-05-2025", to: "07-05-2025", reason: "Family Event", status: "PENDING" },
  { type: "Sick Leave", from: "08-05-2025", to: "08-05-2025", reason: "Circumstances", status: "APPROVED" },
  { type: "Casual Leave", from: "09-05-2025", to: "09-05-2025", reason: "Personal Work", status: "REJECTED" },
  { type: "Sick Leave", from: "10-05-2025", to: "10-05-2025", reason: "Personal Work", status: "APPROVED" },
];

const statusColors = {
  APPROVED: "bg-green-500 text-white",
  REJECTED: "bg-red-500 text-white",
  PENDING: "bg-yellow-400 text-white",
};

export default function LeaveManagementTable() {
  return (
    <div className="min-h-screen bg-white py-2 sm:py-3 px-3 sm:px-4 lg:px-6 xl:px-8">
      {/* Header - Outside the main container */}
      <div className="flex items-center w-full mb-3 sm:mb-4">
        <span className="h-6 w-1 bg-red-600 rounded mr-3" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Leave Management
        </h2>
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
                  key={i}
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
                      key={i}
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
