'use client'
import Navbar from '@/components/layout/navbar'
import StudentDocuments from '@/components/dashboard/StudentDocuments'
import Sidebar from '@/components/layout/sidebar'

export default function StudentPage() {
  return (
    <div className="flex w-full min-h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 min-h-screen">
        <Navbar />
       
          <StudentDocuments />
      </div>
    </div>
  )
}
