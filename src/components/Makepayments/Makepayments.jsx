"use client";

import React from "react";
import { CreditCard, Calendar, ArrowRight, ShieldCheck, IndianRupee } from "lucide-react";

const fees = [
  {
    type: "Tuition Fee",
    dueDate: "02-05-2025",
    amount: "₹ 30,000",
    status: "Pending",
  },
  {
    type: "Library Fee",
    dueDate: "03-05-2025",
    amount: "₹ 15,000",
    status: "Pending",
  },
  {
    type: "Annual Sports fee",
    dueDate: "05-05-2025",
    amount: "₹ 5,000",
    status: "Pending",
  },
];

export default function MakePaymentsPage({ onPayNowClick }) {
  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#7A8B5E] rounded-full"></div>
          <h2 className="text-2xl font-black text-[#1A1F16]">Outstanding Payments</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={14} /> Secure Checkout Enabled
        </div>
      </div>

      {/* ── Pending Fees Table ── */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#7A8B5E]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAF5]/50 border-b border-[#7A8B5E]/5">
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Fee Type</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Due Date</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7A8B5E]/5">
              {fees.map((fee, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAF5]/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#7A8B5E]/5 flex items-center justify-center text-[#7A8B5E]">
                        <CreditCard size={18} />
                      </div>
                      <span className="text-sm font-black text-[#1A1F16]">{fee.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6B7280] uppercase">
                      <Calendar size={12} /> {fee.dueDate}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-[#1A1F16]">
                    <div className="flex items-center gap-1">
                      <IndianRupee size={14} className="text-[#6B7280]" />
                      {fee.amount.replace('₹ ', '')}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={onPayNowClick}
                      className="px-6 py-2.5 rounded-xl bg-[#7A8B5E] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] transition-all ml-auto"
                    >
                      Pay Now <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payment Note ── */}
      <div className="bg-[#7A8B5E]/5 rounded-3xl p-6 flex items-start gap-4 border border-[#7A8B5E]/10">
        <AlertCircle size={20} className="text-[#7A8B5E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-black text-[#1A1F16] uppercase tracking-widest">Important Note</p>
          <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
            Please ensure you have sufficient balance before proceeding. Payments are processed through our secure gateway and may take up to 24 hours to reflect in the records.
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}