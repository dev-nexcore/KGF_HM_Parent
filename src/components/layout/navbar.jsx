"use client";

import React, { useEffect, useState } from "react";

export default function Navbar({ children, subtitle = "-have a great day" }) {
  const [parentFullName, setParentFullName] = useState("Parent");

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
}, []);


  return (
    <section className="flex-1 bg-white flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-[#BEC5AD] pl-6 sm:pl-8 md:pl-10 lg:pl-6">
        <div className="flex-1 ml-2 sm:ml-3 md:ml-4 pl-8 -mt-3 pt-3">
          <div className="font-semibold leading-tight text-[170%]">
            Welcome Back, {parentFullName}
          </div>
          <p className="italic text-black pt-4 -mt-3.5 sm:-mt-2 md:-mt-2.5 text-[13px] sm:text-[10px] md:text-s lg:text-sm">
            {subtitle}
          </p>
        </div>
        <div className="w-12 h-12 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white rounded-full border border-gray-300 flex-shrink-0" />
      </header>
      <main className="flex-1 p-1 sm:p-3 md:p-2 pt-1 sm:pt-2">
        {children}
      </main>
    </section>
  );
}
