"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, ArrowRight, Filter, ChevronDown, Check, X } from "lucide-react";

const statusStyles = {
  APPROVED: "bg-green-50 text-green-600 border-green-100",
  REJECTED: "bg-red-50 text-red-600 border-red-100",
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
};

export default function LeaveManagementTable() {
  const [leaveData, setLeaveData] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [parentComment, setParentComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchLeaveData();
  }, []);

  useEffect(() => {
    let result = leaveData;
    if (searchTerm) {
      result = result.filter(l => 
        l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(l => l.status === statusFilter);
    }
    setFilteredLeaves(result);
  }, [searchTerm, statusFilter, leaveData]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) throw new Error('Parent token not found');

      const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
      const studentId = tokenPayload.studentId;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/leave-management`,
        {
          params: { studentId },
          headers: { Authorization: `Bearer ${parentToken}` }
        }
      );

      const formattedData = response.data.leaveHistory.map(leave => ({
        _id: leave._id,
        type: leave.leaveType,
        from: new Date(leave.startDate).toLocaleDateString('en-GB'),
        to: new Date(leave.endDate).toLocaleDateString('en-GB'),
        reason: leave.reason,
        status: leave.status.toUpperCase(),
        duration: leave.duration
      }));
      setLeaveData(formattedData);
      setFilteredLeaves(formattedData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setParentComment('');
    setShowModal(true);
  };

  const confirmLeaveAction = async () => {
    if (!selectedLeave) return;
    setActionLoading(prev => ({ ...prev, [selectedLeave._id]: true }));

    try {
      const parentToken = localStorage.getItem('parentToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/leave-status`,
        {
          leaveId: selectedLeave._id,
          status: modalAction,
          parentComment: parentComment.trim()
        },
        { headers: { Authorization: `Bearer ${parentToken}` } }
      );

      setLeaveData(prev => prev.map(l => l._id === selectedLeave._id ? { ...l, status: modalAction.toUpperCase() } : l));
      toast.success(`Leave ${modalAction} successfully!`);
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${modalAction} leave`);
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedLeave._id]: false }));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7A8B5E] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#7A8B5E] rounded-full"></div>
          <h2 className="text-2xl font-black text-[#1A1F16]">Leave Authorizations</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7A8B5E]" size={14} />
            <input 
              type="text"
              placeholder="Search reason..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 focus:border-[#7A8B5E] outline-none text-xs font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 text-xs font-black uppercase tracking-widest text-[#7A8B5E] outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Approved" value={leaveData.filter(l => l.status === 'APPROVED').length} icon={<CheckCircle size={24}/>} color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Pending" value={leaveData.filter(l => l.status === 'PENDING').length} icon={<AlertCircle size={24}/>} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard label="Declined" value={leaveData.filter(l => l.status === 'REJECTED').length} icon={<XCircle size={24}/>} color="text-red-600" bgColor="bg-red-50" />
      </div>

      {/* ── List ── */}
      <div className="space-y-4">
        {filteredLeaves.map((leave, i) => (
          <div key={i} className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-[#7A8B5E]/10 flex flex-col lg:flex-row gap-8 items-start lg:items-center transition-all hover:shadow-md">
            
            <div className="flex items-center gap-6 flex-1">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 ${leave.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : leave.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {leave.status === 'PENDING' ? <Clock size={28} /> : leave.status === 'APPROVED' ? <CheckCircle size={28} /> : <XCircle size={28} />}
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-[#1A1F16]">{leave.type}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 text-[#1A1F16]"><Calendar size={12}/> {leave.from}</span>
                  <ArrowRight size={12} />
                  <span className="flex items-center gap-1.5 text-[#1A1F16]"><Calendar size={12}/> {leave.to}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 lg:max-w-xs bg-gray-50 rounded-2xl p-4 border border-[#7A8B5E]/5">
              <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">Reason for Leave</p>
              <p className="text-sm font-bold text-[#1A1F16] line-clamp-2">{leave.reason}</p>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="flex flex-col items-end gap-1 flex-1 lg:flex-none">
                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Current Status</p>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[leave.status]}`}>
                  {leave.status}
                </span>
              </div>
              
              {leave.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleLeaveAction(leave, 'approved')}
                    className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-600/20 hover:scale-105 transition-all"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => handleLeaveAction(leave, 'rejected')}
                    className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1A1F16]/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl space-y-8">
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-[30px] flex items-center justify-center mb-6 ${modalAction === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {modalAction === 'approved' ? <CheckCircle size={40} /> : <XCircle size={40} />}
              </div>
              <h3 className="text-2xl font-black text-[#1A1F16] uppercase tracking-tight">
                {modalAction === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </h3>
              <p className="text-[#6B7280] font-medium mt-2">You are about to {modalAction} this leave request.</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} /> Add Remarks (Optional)
              </label>
              <textarea 
                className="w-full h-32 p-4 rounded-3xl bg-[#F8FAF5] border border-[#7A8B5E]/10 focus:border-[#7A8B5E] outline-none font-bold text-[#1A1F16] transition-all resize-none"
                placeholder="Type your message here..."
                value={parentComment}
                onChange={(e) => setParentComment(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 rounded-2xl bg-gray-50 text-[#6B7280] font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={confirmLeaveAction}
                disabled={actionLoading[selectedLeave?._id]}
                className={`flex-1 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all ${modalAction === 'approved' ? 'bg-green-600 shadow-green-600/20 hover:bg-green-700' : 'bg-red-500 shadow-red-500/20 hover:bg-red-600'}`}
              >
                {actionLoading[selectedLeave?._id] ? 'Processing...' : `Confirm ${modalAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#7A8B5E]/5 shadow-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black ${color} mt-1`}>{value}</p>
      </div>
    </div>
  );
}