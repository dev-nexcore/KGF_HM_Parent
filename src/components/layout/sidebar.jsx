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
        {/* Hamburger button - better positioning to avoid overlap */}
        <button
          aria-label="Open sidebar"
          className="md:hidden fixed top-2 left-2 z-50 p-2 rounded-lg bg-[#9CAD8F] text-black shadow-lg hover:bg-[#8DA087] transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-full bg-[#A4B494] py-6 flex flex-col justify-between rounded-tr-3xl shadow-lg
            transform transition-transform duration-300 ease-in-out
            z-40
            w-48 sm:w-60 md:w-60
            md:static md:translate-x-0 md:rounded-tr-4xl md:shadow
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Close button for mobile */}
          <button
            aria-label="Close sidebar"
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white/20 text-black hover:bg-white/30 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          <div className="px-4">
            {/* Logo - smaller on mobile */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                <img 
                  src="/logo1.svg" 
                  className="h-12 w-12 md:h-16 md:w-16 object-contain" 
                  alt="Logo" 
                />
              </div>
            </div>
          </div>

          {/* Navigation Links - full width */}
          <div className="flex-1">
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
                  className={`
                    flex items-center gap-3 py-3 px-4 text-sm md:text-base font-semibold transition-all duration-200
                    ${active
                      ? "bg-white text-black shadow-lg"
                      : "text-[#1a312a] hover:text-black hover:bg-white/10"
                    }
                  `}
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
                  <img src={icon} alt={label} className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="text-sm md:text-base font-semibold">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Section - more compact */}
          <div className="mt-6 px-4">
            <hr className="border-t border-black my-3" />
            <div className="flex justify-center">
              <a
                href="#"
                className="flex items-center gap-2 text-[#1a312a] font-semibold text-sm md:text-base hover:text-black transition-colors"
              >
                <img src="/logout.svg" alt="Logout" className="w-4 h-4 md:w-5 md:h-5" />
                <span>Logout</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Overlay background when sidebar is open on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </>
    </div>
  );
}