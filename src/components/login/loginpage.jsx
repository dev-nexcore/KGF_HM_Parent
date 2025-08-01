"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {toast} from "react-hot-toast";

export default function ParentLogin() {
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const router = useRouter();

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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white font-inter overflow-hidden">
      {/* Left Panel - Reduced padding and content size */}
      <div className="w-full md:w-1/2 bg-[#A4B494] p-4 md:p-8 md:rounded-r-[5rem] flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black">Welcome Back!</h1>
        <Image 
          src="/logo1.svg" 
          alt="Logo" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-md" 
          width={160} 
          height={160} 
        />
        <p className="mt-4 text-sm md:text-base font-semibold text-black leading-tight">
          "Manage Your Hostel Smarter – Everything You Need in One Platform."
        </p>
      </div>

      {/* Right Panel - Optimized spacing */}
      <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex flex-col justify-center items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black text-center w-full">
          Parent Login
        </h2>

        <div className="flex flex-col items-center w-full max-w-md">
          {!isOtpSent ? (
            // Step 1: Student ID Input
            <>
              <label className="text-sm font-semibold text-black mb-2 w-full text-left">
                Student ID
              </label>
              <input
                type="text"
                placeholder="Enter Your Child's Student ID"
                className="w-full mb-6 px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />

              {/* Send OTP Button */}
              <div className="w-full flex justify-center">
                <button
                  onClick={handleSendOtp}
                  disabled={isOtpSending}
                  className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl shadow-md transition duration-200 cursor-pointer"
                >
                  {isOtpSending ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </>
          ) : (
            // Step 2: OTP Input
            <>
              <div className="w-full mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-green-700">
                  OTP sent to: <span className="font-semibold">{maskedEmail}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Valid for 5 minutes
                </p>
              </div>

              <label className="text-sm font-semibold text-black mb-2 w-full text-left">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className="w-full mb-4 px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494] text-center text-lg tracking-widest"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />

              {/* Resend OTP */}
              <div className="w-full flex justify-between items-center mb-6">
                <button
                  onClick={handleBackToStudentId}
                  className="text-sm text-gray-600 hover:underline"
                >
                  ← Change Student ID
                </button>
                {/* <button
                  onClick={handleResendOtp}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Resend OTP
                </button> */}
              </div>

              {/* Login Button */}
              <div className="w-full flex justify-center">
                <button
                  onClick={handleLogin}
                  className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] text-black font-bold py-3 rounded-xl shadow-md transition duration-200 cursor-pointer"
                >
                  Verify & Login
                </button>
              </div>
            </>
          )}

          {/* Forgot Password - Only show in first step */}
          {!isOtpSent && (
            <div className="w-full flex justify-end mt-4">
              {/* <a href="/ForgotPassword" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}