'use client'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import DashboardCards from '@/components/dashboard/DashboardCards'

export default function ParentDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header />
        <DashboardCards />
      </div>
    </div>
  )
}
