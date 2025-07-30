'use client';
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import AttendanceTable from "@/components/Attendance/AttendanceTable";

export default function AttendancePage() {
   return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <Navbar />
          <AttendanceTable />
        </div>
      </div>
    )
  }
