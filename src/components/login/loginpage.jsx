"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Lock, Mail, User, ArrowRight, ShieldCheck, Phone } from 'lucide-react';

export default function ParentLogin() {
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!studentId.trim()) return toast.error("Please enter Student ID");
    setIsOtpSending(true);
    const loadingToast = toast.loading("Sending secure OTP...");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/send-login-otp`, {
        studentId: studentId.trim(),
      });
      setIsOtpSent(true);
      toast.success("OTP sent to your registered email & phone", { id: loadingToast });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP", { id: loadingToast });
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP");
    setIsLoading(true);
    const loadingToast = toast.loading("Verifying identity...");
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/login`, {
        studentId: studentId.trim(),
        otp: otp.trim(),
      });
      const { token, parent } = response.data;
      localStorage.setItem("parentToken", token);
      localStorage.setItem("parentInfo", JSON.stringify(parent));
      toast.success("Welcome to KGF Parent Portal", { id: loadingToast });
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center p-4 font-sans selection:bg-[#7A8B5E]/20">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-5xl bg-white rounded-[48px] shadow-2xl shadow-[#7A8B5E]/10 overflow-hidden flex flex-col md:flex-row border border-[#7A8B5E]/5">
        
        {/* ── Left Branding Panel ── */}
        <div className="md:w-1/2 bg-[#7A8B5E] p-12 lg:p-16 flex flex-col justify-between items-center text-center text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10 space-y-8 flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded-3xl p-4 shadow-2xl transform hover:rotate-6 transition-transform duration-500">
              <Image 
                src="/parent/logo2.png"
                alt="Logo" 
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter leading-none">PARENT<br/><span className="text-[#D9E4C5]">PORTAL</span></h1>
              <p className="text-[#D9E4C5] font-medium text-sm tracking-widest uppercase">KOKAN GLOBAL FOUNDATION</p>
            </div>
          </div>

          <div className="relative z-10 w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
            <p className="text-sm font-bold italic opacity-90">"Stay connected with your child's academic journey through our secure digital command center."</p>
          </div>
        </div>

        {/* ── Right Login Panel ── */}
        <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#1A1F16] tracking-tight">Secure Access</h2>
              <p className="text-[#6B7280] text-sm font-medium">Verify your identity to enter the portal.</p>
            </div>

            <div className="space-y-6">
              {!isOtpSent ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#7A8B5E] uppercase tracking-[0.2em] ml-1">Student ID</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7A8B5E] transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. KGF12345"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#7A8B5E] focus:outline-none font-bold text-[#1A1F16] transition-all bg-gray-50/50 hover:bg-white"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSendOtp}
                    disabled={isOtpSending || !studentId}
                    className="w-full py-5 rounded-2xl bg-[#7A8B5E] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
                  >
                    {isOtpSending ? "Sending..." : <>Request Access <ArrowRight size={18} /></>}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[10px] font-black text-[#7A8B5E] uppercase tracking-[0.2em] ml-1">Verification Code</label>
                      <button onClick={() => setIsOtpSent(false)} className="text-[10px] font-black text-gray-400 hover:text-[#7A8B5E] uppercase tracking-widest transition-colors">Change ID</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7A8B5E] transition-colors" size={18} />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#7A8B5E] focus:outline-none font-black text-[#1A1F16] tracking-[0.5em] text-center transition-all bg-gray-50/50 hover:bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleLogin}
                      disabled={isLoading || otp.length !== 6}
                      className="w-full py-5 rounded-2xl bg-[#7A8B5E] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#7A8B5E]/20 hover:bg-[#5A6E3A] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isLoading ? "Verifying..." : <>Enter Portal <ShieldCheck size={18} /></>}
                    </button>
                    <p className="text-center text-[10px] font-black text-[#6B7280] uppercase tracking-widest">
                      Didn't get the code? <button onClick={handleSendOtp} className="text-[#7A8B5E] hover:underline">Resend</button>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-emerald-600 justify-center">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
