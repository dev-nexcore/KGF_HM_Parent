'use client'
import Header from '@/components/layout/Header'
import StudentDocuments from '@/components/dashboard/StudentDocuments'
import Sidebar from '@/components/layout/Sidebar'

export default function StudentPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1  min-h-screen">
        <Header />
       
          <StudentDocuments />
      </div>
    </div>
  )
}
