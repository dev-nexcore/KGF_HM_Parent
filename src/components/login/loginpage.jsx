"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {toast} from "react-hot-toast";

export default function ParentLogin() {
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendOtp = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter Student ID");
      return;
    }

    setIsOtpSending(true);
    try {
      const response = await axios.post("http://localhost:5000/api/parentauth/send-login-otp", {
        studentId,
      });

      setMaskedEmail(response.data.email);
      setIsOtpSent(true);
      toast.success("OTP sent to your registered email!");
    } catch (error) {
      console.error("Send OTP Error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleLogin = async () => {
    if (!studentId.trim() || !otp.trim()) {
      toast.error("Please enter both Student ID and OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/parentauth/login", {
        studentId,
        otp,
      });

      const { token, parent } = response.data;

      localStorage.setItem("parentToken", token);
      localStorage.setItem("parentInfo", JSON.stringify(parent));

      toast.success("Login successful!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    handleSendOtp();
  };

  const handleBackToStudentId = () => {
    setIsOtpSent(false);
    setOtp("");
    setMaskedEmail("");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isOtpSent) {
        handleSendOtp();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white font-inter overflow-hidden">
      {/* Left Panel - Enhanced with animations */}
      <div className={`w-full md:w-1/2 bg-[#A4B494] p-4 md:p-8 md:rounded-r-[5rem] flex flex-col items-center justify-center text-center transition-all duration-1000 ease-out ${
        mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <h1 className={`text-2xl md:text-4xl font-bold md:mb-12 md:-mt-4 mb-5 text-black transition-all duration-700 delay-300 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          Welcome Back!
        </h1>
        
    <div className={`transition-all duration-700 delay-500 ease-out transform ${
  mounted ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
}`}>
  <div className="w-40 h-40 md:w-56 md:h-56 rounded-xl overflow-hidden bg-white shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out">
    <Image 
      src="/logo2.png"
      alt="KOKAN Global Foundation Logo" 
      className="w-full h-full object-cover"
      width={512}
      height={512} 
      priority={true}
      quality={100}
      style={{
        imageRendering: 'auto',
        textRendering: 'geometricPrecision'
      }}
    />
  </div>
</div>
        
        <p className={`mt-10 text-sm md:text-xl font-bold text-black leading-tight transition-all duration-700 delay-700 ease-out ${
  mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
}`}>
  "Manage Your Hostel Smarter – Everything You Need in&nbsp;
  <br className="hidden md:block" />
  One Platform."
</p>
      </div>

      {/* Right Panel - Enhanced with slide-in animation */}
      <div className={`w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center items-center transition-all duration-1000 ease-out ${
        mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-black text-center w-full transition-all duration-700 delay-200 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}>
          Parent Login
        </h2>

        <div className={`flex flex-col items-center w-full max-w-md transition-all duration-700 delay-400 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          {!isOtpSent ? (
            // Step 1: Student ID Input with fade-in animation
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black w-full text-left block transition-colors duration-200">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Your Child's Student ID"
                  className="w-full px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494] focus:border-transparent transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Send OTP Button with enhanced hover effects */}
              <div className="w-full flex justify-center">
                <button
                  onClick={handleSendOtp}
                  disabled={isOtpSending}
                  className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:hover:shadow-md"
                >
                  {isOtpSending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending OTP...</span>
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Step 2: OTP Input with slide-in animation
            <div className={`w-full space-y-4 transition-all duration-500 ease-in-out ${
              isOtpSent ? 'animate-fadeInUp' : ''
            }`}>
              <div className="w-full p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center shadow-sm transition-all duration-300 hover:shadow-md">
                <p className="text-sm text-green-700">
                  OTP sent to: <span className="font-semibold">{maskedEmail}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Valid for 5 minutes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-black w-full text-left block">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494] focus:border-transparent text-center text-lg tracking-widest transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleKeyPress}
                />
              </div>

              {/* Navigation buttons */}
              <div className="w-full flex justify-between items-center">
                <button
                  onClick={handleBackToStudentId}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200 flex items-center space-x-1 transform hover:translate-x-1"
                >
                  <span>←</span>
                  <span>Change Student ID</span>
                </button>
              </div>

              {/* Login Button */}
              <div className="w-full flex justify-center pt-2">
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify & Login"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        /* Pulse animation for loading states */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}