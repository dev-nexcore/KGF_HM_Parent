"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { CreditCard, Calendar, CheckCircle, AlertCircle, IndianRupee, Download, Filter, ArrowUpRight, History } from "lucide-react";

const statusStyles = {
  Paid: "bg-green-50 text-green-600 border-green-100",
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Completed: "bg-green-50 text-green-600 border-green-100",
};

export default function FeesSection() {
  const [feesData, setFeesData] = useState(null);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const parentToken = localStorage.getItem('parentToken');
        if (!parentToken) throw new Error('Parent token not found');

        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/fees`,
          {
            params: { studentId },
            headers: { Authorization: `Bearer ${parentToken}` }
          }
        );

        setFeesData(response.data.feesOverview);
        setFilteredHistory(response.data.feesOverview.paymentHistory || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!feesData?.paymentHistory) return;
    let result = feesData.paymentHistory;

    if (searchTerm) {
      result = result.filter(p => 
        p.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.amount.toString().includes(searchTerm) ||
        p.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (methodFilter !== "all") {
      result = result.filter(p => p.method.toUpperCase() === methodFilter.toUpperCase());
    }

    setFilteredHistory(result);
  }, [searchTerm, methodFilter, feesData]);

  const exportReceipts = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Description,Method,Amount,Status\n"
      + filteredHistory.map(p => `${new Date(p.date).toLocaleDateString('en-GB')},Hostel Fee Installment,${p.method},${p.amount},${p.status}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Fee_Receipts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className="text-2xl font-black text-[#1A1F16]">Financial Overview</h2>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={exportReceipts}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 text-xs font-black uppercase tracking-widest text-[#7A8B5E] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            <Download size={14} /> Receipts
          </button>
          <Link 
            href="/Makepayment"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#7A8B5E] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] transition-all"
          >
            <IndianRupee size={14} /> Pay Dues
          </Link>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Fees" value={`₹${feesData?.totalAmount || 0}`} icon={<CreditCard size={24}/>} color="text-[#7A8B5E]" bgColor="bg-[#7A8B5E]/5" />
        <StatCard label="Amount Due" value={`₹${feesData?.amountDue || 0}`} icon={<AlertCircle size={24}/>} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard label="Last Paid" value={feesData?.paymentHistory?.[0]?.date ? new Date(feesData.paymentHistory[0].date).toLocaleDateString('en-GB') : 'N/A'} icon={<CheckCircle size={24}/>} color="text-green-600" bgColor="bg-green-50" />
      </div>

      {/* ── Payment History Table ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <h3 className="text-sm font-black text-[#6B7280] uppercase tracking-[0.2em] flex items-center gap-2">
            <History size={16} /> Transaction History
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7A8B5E]" size={14} />
              <input 
                type="text"
                placeholder="Search amount, status..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 focus:border-[#7A8B5E] outline-none text-[10px] font-bold transition-all uppercase tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2.5 rounded-xl bg-white border border-[#7A8B5E]/10 text-[10px] font-black uppercase tracking-widest text-[#7A8B5E] outline-none"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">Methods</option>
              <option value="ONLINE">Online</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-[#7A8B5E]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAF5]/50 border-b border-[#7A8B5E]/5">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Description</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Method</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7A8B5E]/5">
                {filteredHistory.map((payment, i) => (
                  <tr key={i} className="hover:bg-[#F8FAF5]/30 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#7A8B5E]">
                          <Calendar size={18} />
                        </div>
                        <span className="text-sm font-black text-[#1A1F16]">
                          {payment.date ? new Date(payment.date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-[#6B7280]">Hostel Fee Installment</td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-[#1A1F16] uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-[#1A1F16]">₹{payment.amount}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusStyles[payment.status] || statusStyles.Paid}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#7A8B5E] hover:bg-[#7A8B5E] hover:text-white transition-all ml-auto">
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!filteredHistory || filteredHistory.length === 0) && (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-[#6B7280] font-bold italic">
                      No transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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