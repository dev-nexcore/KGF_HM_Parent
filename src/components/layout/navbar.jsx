// components/layout/navbar.jsx
"use client";

import React from "react";

export default function Navbar({ children, title = "Welcome Back, Parent", subtitle = "-have a great day" }) {
  return (
    <section className="flex-1 bg-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-[#BEC5AD]  md:px-8 pl-16 md:pl-8">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-black">{title}</h1>
          <p className="italic text-black text-sm -mt-1">{subtitle}</p>
        </div>
        <div className="w-15 h-15 bg-white rounded-full border border-gray-300 flex-shrink-0" />
      </header>
      <main className="flex-1 p-6 md:p-6 pt-4">
        {children}
      </main>
    </section>
  );
}
