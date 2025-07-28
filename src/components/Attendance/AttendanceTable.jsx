import React from "react";

// Attendance data
const attendanceData = [
  { date: "02-05-2025", in: "08:30 AM", out: "03:30 PM", status: "Present" },
  { date: "03-05-2025", in: "08:30 AM", out: "03:30 PM", status: "Present" },
  { date: "04-05-2025", in: "08:30 AM", out: "03:30 PM", status: "Present" },
  { date: "05-05-2025", in: "-",      out: "-",      status: "Absent"  },
  { date: "06-05-2025", in: "08:30 AM", out: "03:30 PM", status: "Present" },
  { date: "07-05-2025", in: "12:30 AM", out: "05:30 PM", status: "Late"    },
  { date: "08-05-2025", in: "08:30 AM", out: "03:30 PM", status: "Present" },
  { date: "09-05-2025", in: "-",      out: "-",      status: "Absent"  },
  { date: "10-05-2025", in: "08:30 AM", out: "03:30 PM", status: "Present" },
];

const statusColors = {
  Present:  "bg-green-500 text-white",
  Absent:   "bg-red-500   text-white",
  Late:     "bg-orange-400 text-white",
};

export default function AttendancePage() {
  return (
    <div className="min-h-screen bg-white py-2 sm:py-3 px-3 sm:px-4 lg:px-6 xl:px-8">
      {/* Header - Outside the main container */}
      <div className="flex items-center w-full mb-3 sm:mb-4">
        <span className="h-6 w-1 bg-red-600 rounded mr-3" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Attendance History
        </h2>
      </div>

      {/* Main White Container with dynamic height */}
      <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="w-full flex flex-col items-center p-4 md:p-5 pb-4">
          
          {/* Mobile View - Responsive width and text sizes */}
          <div className="md:hidden w-full max-w-xs sm:max-w-sm">
            {/* Mobile Headers - Responsive text size */}
            <div className="p-3 sm:p-5 mb-3 rounded" style={{ backgroundColor: '#D9D9D9' }}>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-sm sm:text-base font-bold text-gray-800">
                <div className="text-center">Date</div>
                <div className="text-center">Check-in</div>
                <div className="text-center">Check-out</div>
                <div className="text-center">Status</div>
              </div>
            </div>

            {/* Mobile Data Cards - Responsive padding and text sizes */}
            <div className="space-y-2 sm:space-y-3 mb-0">
              {attendanceData.map((row, i) => (
                <div
                  key={i}
                  className={`bg-white border border-gray-200 p-3 sm:p-5 rounded ${i === attendanceData.length - 1 ? 'mb-0' : ''}`}
                >
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="text-center font-bold text-gray-800 py-1">{row.date}</div>
                    <div className="text-center font-bold text-gray-600 py-1">{row.in}</div>
                    <div className="text-center font-bold text-gray-600 py-1">{row.out}</div>
                    <div className="text-center py-1">
                      <span
                        className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-sm ${statusColors[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table - Status boxes with slight curve */}
          <div className="hidden md:block w-full max-w-none lg:max-w-6xl xl:max-w-7xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ backgroundColor: '#D9D9D9' }}>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Date
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Check-in Time
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Check-out Time
                    </th>
                    <th className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-800 text-center text-base md:text-lg">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.date}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.in}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 text-center text-sm md:text-base">
                        {row.out}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[70px] md:min-w-[80px] lg:min-w-[90px] px-3 md:px-4 py-1 md:py-2 font-semibold text-xs md:text-sm rounded-sm ${statusColors[row.status]}`}
                        >
                          {row.status}
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
    </div>
  );
}
