'use client';
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import FeesSection from "@/components/FeesPaid/Fees";
export default function FeesPage() {
  return (
    <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen">
              <Navbar />
              <FeesSection />
            </div>
          </div>
        )
      }
    