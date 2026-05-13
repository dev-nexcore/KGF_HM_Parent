"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Bell, Calendar, Mail, Eye, ChevronRight, X, AlertCircle } from 'lucide-react';

const statusStyles = {
  Unread: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Read: "bg-gray-50 text-gray-400 border-gray-100",
};

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [displayedNotices, setDisplayedNotices] = useState(10);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;

        const response = await api.get(`/notices`, {
          params: { studentId }
        });

        const noticesData = response.data.notices || [];
        setNotices(processNoticesData(noticesData));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const processNoticesData = (noticesData) => {
    return noticesData.map(notice => ({
      _id: notice._id,
      date: new Date(notice.issueDate).toLocaleDateString('en-GB'),
      subject: notice.title,
      description: notice.message,
      status: notice.readStatus || 'Unread',
      template: notice.template,
      recipientType: notice.recipientType
    }));
  };

  const handleNoticeClick = async (notice) => {
    setSelectedNotice(notice);
    setIsPopupOpen(true);
    if (notice.status === 'Unread') {
      try {
        const parentToken = localStorage.getItem('parentToken');
        await axios.patch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/notices/${notice._id}/read`, {}, {
          headers: { Authorization: `Bearer ${parentToken}` }
        });
        setNotices(prev => prev.map(n => n._id === notice._id ? { ...n, status: 'Read' } : n));
      } catch (err) { console.error(err); }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7A8B5E] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#7A8B5E] rounded-full"></div>
          <h2 className="text-2xl font-black text-[#1A1F16]">Institutional Notices</h2>
        </div>
        <div className="flex gap-4">
          <StatBadge label="Total" count={notices.length} color="bg-white" textColor="text-[#7A8B5E]" />
          <StatBadge label="Unread" count={notices.filter(n => n.status === 'Unread').length} color="bg-[#7A8B5E]" textColor="text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notices.slice(0, displayedNotices).map((notice, i) => (
          <div 
            key={notice._id || i}
            onClick={() => handleNoticeClick(notice)}
            className="group bg-white p-6 rounded-[32px] border border-[#7A8B5E]/5 shadow-sm hover:shadow-md hover:border-[#7A8B5E]/20 transition-all cursor-pointer flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notice.status === 'Unread' ? 'bg-[#7A8B5E]/10 text-[#7A8B5E]' : 'bg-gray-50 text-gray-400'}`}>
              <Mail size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={12} /> {notice.date}
                </span>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusStyles[notice.status]}`}>
                  {notice.status}
                </span>
              </div>
              <h3 className="text-base font-black text-[#1A1F16] truncate">{notice.subject}</h3>
              <p className="text-sm text-[#6B7280] font-medium line-clamp-1">{notice.description}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-[#7A8B5E] group-hover:border-[#7A8B5E]/20 transition-all">
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>

      {displayedNotices < notices.length && (
        <button 
          onClick={() => setDisplayedNotices(prev => prev + 10)}
          className="w-full py-4 rounded-2xl bg-white border border-[#7A8B5E]/10 text-xs font-black uppercase tracking-[0.2em] text-[#7A8B5E] hover:bg-[#F8FAF5] transition-all"
        >
          Load More Notices
        </button>
      )}

      {/* ── Popup Modal ── */}
      {isPopupOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1F16]/40 backdrop-blur-sm" onClick={() => setIsPopupOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 sm:p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#7A8B5E]">
                    <Bell size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Official Notice</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1F16] leading-tight">{selectedNotice.subject}</h3>
                </div>
                <button onClick={() => setIsPopupOpen(false)} className="p-2 rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-[#7A8B5E]/5">
                <div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="text-sm font-black text-[#1A1F16]">{selectedNotice.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[selectedNotice.status]}`}>
                    {selectedNotice.status}
                  </span>
                </div>
              </div>

              <div className="bg-[#F8FAF5] rounded-3xl p-8">
                <p className="text-[#1A1F16] font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.description}
                </p>
              </div>

              <button 
                onClick={() => setIsPopupOpen(false)}
                className="w-full py-4 rounded-2xl bg-[#7A8B5E] text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-[#7A8B5E]/20"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, count, color, textColor }) {
  return (
    <div className={`${color} ${textColor} px-4 py-2 rounded-xl border border-[#7A8B5E]/10 shadow-sm flex items-center gap-3`}>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black">{count}</span>
    </div>
  );
}