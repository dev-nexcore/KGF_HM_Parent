'use client'

import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/layout/Sidebar'
import DashboardCards from '@/components/dashboard/DashboardCards'

export default function ParentDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Navbar />
        <DashboardCards />
      </div>
    </div>
  )
}
