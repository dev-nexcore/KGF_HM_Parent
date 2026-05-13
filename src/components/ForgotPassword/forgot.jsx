"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-[#7A8B5E]/10 p-10 border border-[#7A8B5E]/5 space-y-10">
        
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 bg-[#7A8B5E]/10 text-[#7A8B5E] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-[#1A1F16] tracking-tight">Recovery</h2>
          <p className="text-[#6B7280] text-sm font-medium leading-relaxed">Enter your registered email to receive a password reset link.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#7A8B5E] uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7A8B5E] transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#7A8B5E] focus:outline-none font-bold text-[#1A1F16] transition-all bg-gray-50/50 hover:bg-white"
              />
            </div>
          </div>

          <button className="w-full py-5 rounded-2xl bg-[#7A8B5E] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
            Send Reset Link <ArrowRight size={18} />
          </button>

          <Link href="/" className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-[#7A8B5E] transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-center">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}