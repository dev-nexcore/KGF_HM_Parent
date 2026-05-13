'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  CreditCard, 
  Calendar, 
  Home, 
  Bell, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import api from '@/lib/api';

export default function DashboardCards() {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    roomNo: '',
    bedAllotment: '',
    profileImage: null,
  });
  
  const [attendance, setAttendance] = useState({
    today: '...',
    percentage: 0,
    presentDays: 0,
    totalDays: 0,
    absentDays: 0,
    lastAbsence: 'N/A'
  });

  const [feesData, setFeesData] = useState({
    status: '...',
    amountDue: 0,
    totalAmount: 0,
    paidDate: 'N/A'
  });

  const [wardenInfo, setWardenInfo] = useState({
    name: 'Loading...',
    contact: 'N/A'
  });

  const [notices, setNotices] = useState([]);
  const [latestLeave, setLatestLeave] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;

        const response = await api.get(`/dashboard?studentId=${studentId}`);

        const data = response.data;
        const student = data.studentInfo;
        const att = data.attendanceSummary;
        const fees = data.feesOverview;

        setStudentData({
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          roomNo: student.roomBedDetails.room,
          bedAllotment: student.roomBedDetails.bedType,
          profileImage: student.profileImage || student.photo,
        });

        setAttendance({
          today: att.isPresentToday ? "Present" : "Absent",
          percentage: att.attendancePercentage,
          presentDays: att.presentDays,
          totalDays: att.totalDays,
          absentDays: att.absentDays,
          lastAbsence: att.lastAbsence
        });

        setFeesData({
          status: fees.status,
          amountDue: fees.amountDue,
          totalAmount: fees.totalAmount,
          paidDate: fees.paidDate
        });

        setWardenInfo({
          name: data.wardenInfo.wardenName,
          contact: data.wardenInfo.contactNumber
        });

        setNotices(data.latestNotices || []);
        setLatestLeave(data.latestLeave || null);
        setLoading(false);

      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#7A8B5E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#7A8B5E] font-medium animate-pulse">Loading parent portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* ── Welcome Section ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#7A8B5E]/10">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-[#E8EDDF] flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
              {studentData.profileImage ? (
                <img src={studentData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[#7A8B5E]" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1F16] leading-tight">
              Hello, <span className="text-[#7A8B5E]">{studentData.firstName}</span>!
            </h1>
            <p className="text-[#6B7280] font-medium text-sm sm:text-base flex items-center gap-2 mt-1">
              <ShieldCheck size={16} className="text-[#7A8B5E]" /> 
              Student ID: <span className="text-[#1A1F16] font-bold">{studentData.studentId}</span>
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Current Attendance</p>
            <p className="text-2xl font-black text-[#1A1F16]">{attendance.percentage}%</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-[#E8EDDF] border-t-[#7A8B5E] flex items-center justify-center text-[10px] font-black text-[#7A8B5E]">
             LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ── Main Dashboard Content (Left/Center) ── */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard 
              icon={<Calendar className="text-blue-600" size={24} />} 
              label="Today's Attendance" 
              value={attendance.today} 
              color={attendance.today === "Present" ? "text-green-600" : "text-red-500"} 
              bgColor="bg-blue-50"
            />
            <StatCard 
              icon={<CreditCard className="text-amber-600" size={24} />} 
              label="Amount Due" 
              value={`₹${feesData.amountDue}`} 
              color={feesData.amountDue > 0 ? "text-amber-600" : "text-green-600"} 
              bgColor="bg-amber-50"
            />
            <StatCard 
              icon={<Bell className="text-purple-600" size={24} />} 
              label="Active Notices" 
              value={notices.length} 
              color="text-purple-600" 
              bgColor="bg-purple-50"
            />
          </div>

          {/* Quick Actions */}
          <section>
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <ActionItem icon={<FileText />} label="Apply Leave" href="/Leave" color="#7A8B5E" />
              <ActionItem icon={<CreditCard />} label="Pay Fees" href="/Makepayment" color="#C5A059" />
              <ActionItem icon={<MessageSquare />} label="Complaints" href="/dashboard/complaints" color="#4F8DCF" />
              <ActionItem icon={<User />} label="Profile" href="/profile" color="#6B7280" />
            </div>
          </section>

          {/* Recent Notices */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <SectionHeader title="Latest Announcements" />
              <Link href="/Notices" className="text-xs font-bold text-[#7A8B5E] hover:underline flex items-center gap-1 uppercase tracking-widest">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-4">
              {notices.length > 0 ? notices.map((notice, i) => (
                <div key={i} className="bg-white p-5 rounded-[24px] border border-[#7A8B5E]/5 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8EDDF] flex items-center justify-center shrink-0">
                    <Bell size={20} className="text-[#7A8B5E]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1A1F16] text-sm sm:text-base line-clamp-1">{notice.title}</h4>
                    <p className="text-xs text-[#6B7280] font-medium mt-1 line-clamp-2">{notice.message}</p>
                    <p className="text-[10px] text-[#9CAD8F] font-bold uppercase tracking-widest mt-3 flex items-center gap-1">
                      <Clock size={10} /> {new Date(notice.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-8 rounded-[32px] text-center text-[#6B7280] font-medium border-2 border-dashed border-[#7A8B5E]/10">
                  No active notices at the moment.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Sidebar Content (Right) ── */}
        <div className="space-y-8">
          
          {/* Hostel & Warden Card */}
          <div className="bg-[#7A8B5E] rounded-[32px] p-8 text-white shadow-xl shadow-[#7A8B5E]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Home size={24} /> Accommodation
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <span className="text-white/70 text-sm font-bold uppercase tracking-wider">Room No</span>
                <span className="text-xl font-black">{studentData.roomNo}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-4">
                <span className="text-white/70 text-sm font-bold uppercase tracking-wider">Bed Type</span>
                <span className="text-lg font-black">{studentData.bedAllotment}</span>
              </div>
              <div className="pt-2">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Hostel Warden</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black">{wardenInfo.name}</span>
                  <a href={`tel:${wardenInfo.contact}`} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <PhoneCall size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Leave Status */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#7A8B5E]/10">
            <h3 className="text-lg font-black text-[#1A1F16] mb-6 flex items-center gap-3">
              <Clock size={20} className="text-[#7A8B5E]" /> Recent Leave
            </h3>
            {latestLeave ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${latestLeave.status === 'approved' ? 'bg-green-50 text-green-600' : latestLeave.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {latestLeave.status === 'approved' ? <CheckCircle size={24} /> : latestLeave.status === 'pending' ? <Clock size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1A1F16]">{latestLeave.type}</p>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">{new Date(latestLeave.startDate).toLocaleDateString()} - {new Date(latestLeave.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-[#6B7280]">Status</span>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${latestLeave.status === 'approved' ? 'bg-green-100 text-green-700' : latestLeave.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {latestLeave.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[#6B7280] text-sm font-medium">No recent leave requests.</p>
            )}
          </div>

          {/* Emergency Support */}
          <div className="bg-[#1A1F16] rounded-[32px] p-6 text-white text-center">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2">Need Assistance?</p>
            <h4 className="text-lg font-black mb-4">24/7 Hostel Support</h4>
            <a href="tel:+911234567890" className="inline-flex items-center gap-2 bg-[#7A8B5E] text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-[#5A6E3A] transition-colors shadow-lg shadow-[#7A8B5E]/20">
              <PhoneCall size={16} /> Contact Admin
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#7A8B5E]/5 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 rounded-[20px] ${bgColor} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{label}</p>
        <p className={`text-xl sm:text-2xl font-black ${color} leading-none mt-1`}>{value}</p>
      </div>
    </div>
  );
}

function ActionItem({ icon, label, href, color }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 p-4 rounded-[24px] bg-white border border-[#7A8B5E]/5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <span className="text-xs font-black text-[#1A1F16] uppercase tracking-widest">{label}</span>
    </Link>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-6 bg-[#7A8B5E] rounded-full"></div>
      <h3 className="text-xl font-black text-[#1A1F16]">{title}</h3>
    </div>
  );
}

