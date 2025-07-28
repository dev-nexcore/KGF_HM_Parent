'use client'
import Navbar from '@/components/layout/navbar'
import StudentDocuments from '@/components/dashboard/StudentDocuments'
import Sidebar from '@/components/layout/Sidebar'

export default function StudentPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1  min-h-screen">
        <Navbar />
       
          <StudentDocuments />
      </div>
    </div>
  )
}
