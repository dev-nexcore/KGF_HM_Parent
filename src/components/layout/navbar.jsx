// components/layout/navbar.jsx
"use client";

import React from "react";

export default function Navbar({ children, title = "Welcome Back, Parent", subtitle = "-have a great day" }) {
  return (
    <section className="flex-1 bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 sm:px-6 md:px-8 py-2 sm:py-4 bg-[#BEC5AD] pl-12 sm:pl-14 md:pl-16 lg:pl-8">
        <div className="flex-1 ml-2 sm:ml-3 md:ml-4 pl-2">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
            {title}
          </h1>
          <p className="italic text-black text-bold text-xs sm:text-sm md:text-base -mt-1 sm:-mt-1.5 md:-mt-2">
            {subtitle}
          </p>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15 lg:w-16 lg:h-16 bg-white rounded-full border border-gray-300 flex-shrink-0" />
      </header>
      <main className="flex-1 p-1 sm:p-3 md:p-2 pt-1 sm:pt-2">
        {children}
      </main>
    </section>
  );
}
