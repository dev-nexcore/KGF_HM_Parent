import Navbar from '@/components/layout/navbar';
import Sidebar from '@/components/layout/sidebar';
import Notices from '@/components/Notices/Notices';

export default function Home() {
  return (
    <div className='min-h-screen flex flex-col md:flex-row '>
      <Sidebar/>
      <div className='flex-1 flex flex-col'>
        <Navbar/>
      <Notices/>
      </div>
      
    </div>
  );
}
