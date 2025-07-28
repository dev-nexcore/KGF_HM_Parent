'use client';
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import LeaveManagementTable from "@/components/LeaveManagement/Leave";

export default function LeavePage() {
  return (
    <div className="min-h-screen flex font-sans text-black">
      <Sidebar />
      
      {/* Main content area with navbar and table vertically stacked */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6">
          <LeaveManagementTable />
        </main>
      </div>
    </div>
  );
}
