// src/components/layout/navbar.jsx
"use client";

import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "../ProfileContext";

export default function Navbar({ children, subtitle = "-have a great day" }) {
  const { parentFullName, profileImage, loading } = useProfile();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <section className="flex-1 bg-white flex flex-col">
      <header className="relative z-[99] flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-[#BEC5AD]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 md:w-0 flex-shrink-0 md:hidden"></div>
          <div className="flex flex-col min-w-0">
            <div className="font-semibold leading-tight text-base sm:text-lg md:text-xl lg:text-2xl text-black">
              Welcome Back, {parentFullName}
            </div>
            <p className="italic text-black text-xs sm:text-sm md:text-base mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        
        {/* Profile Image/Icon - Clickable */}
        <button
          onClick={handleProfileClick}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 flex-shrink-0 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 overflow-hidden group cursor-pointer"
          aria-label="View Profile"
        >
          {!loading && profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-200"
            />
          ) : (
            <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#A4B494] transition-colors duration-200" />
          )}
        </button>
      </header>
      <main className="flex-1 p-1 sm:p-3 md:p-2 pt-20 sm:pt-20">
        {children}
      </main>
    </section>
  );
}