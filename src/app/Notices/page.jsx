import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import Notices from '@/components/Notices/Notices';

export default function Home() {
  return (
    <div className="flex bg-[#F8FAF5] min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">
          <Notices />
        </main>
      </div>
    </div>
  )
}
