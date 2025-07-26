'use client';
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import FeesSection from "@/components/FeesPaid/Fees";
export default function FeesPage() {
  return (
    <div className="min-h-screen flex font-sans text-black">
      <Sidebar />
      
      {/* Main content area with navbar and table vertically stacked */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="flex-1 p-6">
          <FeesSection />
        </main>
      </div>
    </div>
  );
}
