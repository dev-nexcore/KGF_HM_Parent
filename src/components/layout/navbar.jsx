"use client";

import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ children, subtitle = "-have a great day" }) {
  const [parentFullName, setParentFullName] = useState("Parent");
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const parentInfo = localStorage.getItem("parentInfo");
    if (parentInfo) {
      try {
        const parsed = JSON.parse(parentInfo);
        const firstName = parsed.firstName || parsed.firstname || "";
        const lastName = parsed.lastName || parsed.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        setParentFullName(fullName || "Parent");
      } catch (error) {
        console.error("Failed to parse parent info from localStorage", error);
      }
    }

    // Load profile image from localStorage
    const storedImage = localStorage.getItem("parentProfileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <section className="flex-1 bg-white flex flex-col">
      <header className="flex items-center justify-between px-3 sm:px-5 md:px-6 py-2 sm:py-3 md:py-4 bg-[#BEC5AD]">
        {/* Add space for hamburger menu on mobile */}
        <div className="w-11 md:w-0 flex-shrink-0"></div>
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="font-semibold leading-tight text-sm sm:text-lg md:text-xl lg:text-2xl text-black">
            Welcome Back, {parentFullName}
          </div>
          <p className="italic text-black text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
            {subtitle}
          </p>
        </div>
        
        {/* Profile Image/Icon - Clickable */}
        <button
          onClick={handleProfileClick}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full border border-gray-300 flex-shrink-0 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 overflow-hidden group cursor-pointer"
          aria-label="View Profile"
        >
          {profileImage ? (
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
      <main className="flex-1 p-1 sm:p-3 md:p-2 pt-1 sm:pt-2">
        {children}
      </main>
    </section>
  );
}