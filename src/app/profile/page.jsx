'use client';
import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/sidebar'
import ProfilePage from "@/components/ProfilePage/ProfilePage";

export default function ParentDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Navbar />
        <ProfilePage />
      </div>
    </div>
  )
}

