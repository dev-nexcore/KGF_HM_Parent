"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const normalize = (path) => path?.toLowerCase().replace(/\/$/, "") ?? "";

  const isActive = (href) => {
    const currentPath = normalize(pathname);
    const linkPath = normalize(href);
    return currentPath === linkPath || currentPath.startsWith(linkPath + "/");
  };

  const getLinkClass = (href) => {
    return `
      flex items-center gap-3 py-4 px-4 rounded-l-3xl text-base font-semibold transition-all duration-200
      ${isActive(href)
        ? "bg-white text-black shadow-lg"
        : "text-[#1a312a] hover:text-black hover:bg-white/10"
      }
    `;
  };

  return (
    <div className="bg-[#BEC5AD]">
      <>
        {/* Hamburger button visible on small screens */}
        <button
          aria-label="Open sidebar"
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#A4B494] text-black shadow-md"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-60 bg-[#A4B494] py-8 pl-5 flex flex-col justify-between rounded-tr-4xl shadow
            transform transition-transform duration-300 ease-in-out
            z-40
            md:static md:translate-x-0 md:rounded-tr-4xl md:shadow
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >


          <div>
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                <img 
                  src="/logo.png" 
                  className="h-16 w-16 object-contain" 
                  alt="Logo" 
                />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {[
                { href: "/dashboard", icon: "/dashboard.png", label: "Dashboard" },
                { href: "/Attendance", icon: "/calender.png", label: "Attendance History" },
                { href: "/Leave", icon: "/leave.png", label: "Leave Management" },
                { href: "/Fees", icon: "/wallet.png", label: "Fees Paid" },
                { href: "/Notices", icon: "/notice.png", label: "Notices" },
                { href: "/Makepayment", icon: "/payment.png", label: "Make Payments" },
              ].map(({ href, icon, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={getLinkClass(href)}
                    style={
                      active
                        ? {
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            fontWeight: "700",
                            boxShadow:
                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }
                        : undefined
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <img src={icon} alt={label} className="w-5 h-5 flex-shrink-0" />
                    <span className="text-base font-semibold">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Logout Section */}
          <div className="mt-8">
            <hr className="border-t border-black my-4 mr-6" />
            <div className="flex justify-center">
              <a
                href="#"
                className="flex items-center gap-2 text-[#1a312a] pr-7 font-semibold text-base hover:text-black transition-colors"
              >
                <img src="/logout.svg" alt="Logout" className="w-5 h-5" />
                <span>Logout</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Overlay background when sidebar is open on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </>
    </div>
  );
}