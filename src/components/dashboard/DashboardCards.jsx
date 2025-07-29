'use client';
import Link from 'next/link';

export default function DashboardCards() {
  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Dashboard Header */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Dashboard</h2>
      </div>

      {/* Cards Grid - Desktop unchanged, mobile responsive */}
      <div className="w-full lg:max-w-7xl lg:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          
          {/* Student Card - Desktop size preserved, mobile responsive */}
<div className="bg-[#B8C5A8] rounded-xl p-4 sm:p-6 shadow-lg w-full mx-auto max-w-md lg:ml-10 lg:h-[320px] lg:w-[470px] lg:max-w-none flex flex-col justify-left items-center min-h-[280px] sm:min-h-[300px]">
  {/* Avatar Section */}
  <div className="flex flex-col items-center justify-center text-center lg:flex-1">
    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center">
      {/* Empty white circle */}
    </div>
    
    {/* Student Info */}
    <h2 className="font-bold text-lg sm:text-2xl text-gray-800 mb-1 sm:mb-2">Nouman Khan</h2>
    <p className="text-xl sm:text-sm text-gray-700 font-semibold mb-4 sm:mb-6">Student ID: HFL-001</p>
    
    {/* View Details Button */}
    <Link href="/dashboard/student">
      <button className="bg-white text-gray-800 font-semibold px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors duration-200">
        View Details
      </button>
    </Link>
  </div>
</div>


          {/* Fees Card - Desktop unchanged, mobile responsive */}
<div className="bg-white rounded-xl shadow-lg w-full mx-auto max-w-sm lg:max-w-none lg:mr-0 lg:-ml-10 lg:min-h-[280px] min-h-[280px] lg:w-[640px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">
              Fees Overview
            </h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Total Fees:" value="₹50,000" />
              <InfoRow label="Paid:" value="₹30,000" color="text-green-600" />
              <InfoRow label="Due:" value="₹20,000" color="text-red-600" />
              <InfoRow label="Next Due date:" value="15th Oct 2025" color="text-gray-500" />
            </div>
          </div>

          {/* Attendance Card - Desktop unchanged, mobile responsive */}
          <div className="bg-white rounded-xl shadow-lg w-full mx-auto max-w-sm lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">
              Attendance Summary
            </h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Today:" value="Present" color="text-green-600" />
              <InfoRow label="Last 7 days:" value="6/7 Present" />
              <InfoRow label="Total absences:" value="5 Days" />
              <InfoRow label="Last absences:" value="15th Oct 2025" color="text-gray-500" />
            </div>
          </div>

          {/* Hostel Card - Desktop unchanged, mobile responsive */}
          <div className="bg-white rounded-xl shadow-lg w-full mx-auto max-w-sm lg:max-w-none lg:min-h-[280px] min-h-[280px] sm:min-h-[300px] flex flex-col">
            <h3 className="bg-[#9CAD8F] rounded-t-xl px-3 sm:px-4 py-2 sm:py-3 font-bold text-black text-xs sm:text-sm lg:text-base">
              Hostel Details
            </h3>
            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
              <InfoRow label="Status:" value="Allocated" color="text-green-600" />
              <InfoRow label="Room no:" value="B/201" />
              <InfoRow label="Bed no:" value="3" />
              <InfoRow label="Hostel Warden:" value="Chinmay Gawade" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color = "text-black" }) {
  return (
    <div className="flex justify-between items-center py-0.5 sm:py-1">
      <span className="text-black font-bold text-xs sm:text-sm lg:text-base">{label}</span>
      <span className={`font-bold text-xs sm:text-sm lg:text-base ${color}`}>{value}</span>
    </div>
  );
}
