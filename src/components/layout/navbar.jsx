// components/layout/navbar.jsx
"use client";

import React from "react";

export default function Navbar({ children, title = "Welcome Back, Parent", subtitle = "-have a great day" }) {
  return (
    <section className="flex-1 bg-white flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 bg-[#BEC5AD] pl-6 sm:pl-8 md:pl-10 lg:pl-6">
        <div className="flex-1 ml-2 sm:ml-3 md:ml-4 pl-6 -mt-3" >
          <h1 className="font-semibold leading-tight text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
            {title}
          </h1>
          <p className="italic text-black font-bold -mt-3.5 sm:-mt-2 md:-mt-2.5 text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
            {subtitle}
          </p>
        </div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white rounded-full border border-gray-300 flex-shrink-0" />
      </header>
      <main className="flex-1 p-1 sm:p-3 md:p-2 pt-1 sm:pt-2">
        {children}
      </main>
    </section>
  );
}
