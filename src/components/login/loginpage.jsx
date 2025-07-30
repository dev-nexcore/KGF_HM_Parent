"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {toast} from "react-hot-toast";

export default function ParentLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/parentauth/login", {
        studentId,
        password,
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
      alert(error.response?.data?.message || "Login failed");
    }
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
          {/* User ID */}
          <label className="text-sm font-semibold text-black mb-2 w-full text-left">
            User ID
          </label>
          <input
            type="text"
            placeholder="Enter Your User ID"
            className="w-full mb-4 px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          {/* Password */}
          <label className="text-sm font-semibold text-black mb-2 w-full text-left">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter Your Password"
            className="w-full mb-3 px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password */}
          <div className="w-full flex justify-end mb-6">
            <a href="/ForgotPassword" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <div className="w-full flex justify-center">
            <button
              onClick={handleLogin}
              className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] text-black font-bold py-3 rounded-xl shadow-md transition duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}