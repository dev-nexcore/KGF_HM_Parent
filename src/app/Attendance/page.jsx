'use client';
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/Sidebar";
import AttendanceTable from "@/components/Attendance/AttendanceTable";

export default function AttendancePage() {
  return (
    <div className="min-h-screen flex font-sans text-black">
      <Sidebar />
      
      {/* Main content area with navbar and table vertically stacked */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6 ">
          <AttendanceTable />
        </main>
      </div>
    </div>
  );
}
