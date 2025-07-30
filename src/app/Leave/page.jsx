'use client';
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import LeaveManagementTable from "@/components/LeaveManagement/Leave";

export default function LeavePage() {
  return (
    <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen">
              <Navbar />
              <LeaveManagementTable />
            </div>
          </div>
        )
      }
    
