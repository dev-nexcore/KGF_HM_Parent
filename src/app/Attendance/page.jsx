'use client';
import AttendancePage from "@/components/Attendance/AttendanceTable";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

export default function AttendanceTable(){
   return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <Navbar />
          <AttendancePage />
        </div>
      </div>
    )
  }
