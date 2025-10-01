"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  // 🔧 NEW: Handle logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // Remove parent token from localStorage
    localStorage.removeItem('parentToken');
    
    // Close modal
    setShowLogoutModal(false);
    
    // Redirect to login page
    router.push('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
              { href: "/Dashboard", icon: "/dashboard.png", label: "Dashboard" },
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

          {/* 🔧 UPDATED: Logout Section with onClick handler */}
          <div className="mt-6 px-4">
            <hr className="border-t border-black my-3" />
            <div className="flex justify-center">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-[#1a312a] font-semibold text-sm md:text-base hover:text-black transition-colors cursor-pointer"
              >
                <img src="/parent/logout.svg" alt="Logout" className="w-4 h-4 md:w-5 md:h-5" />
                <span>Logout</span>
              </button>
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

        {/* 🆕 NEW: Glassmorphism with Better Readability */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(8px)' }}>
            <div 
              className="max-w-md w-full p-6 rounded-2xl border shadow-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.2) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}
            >
              {/* Glass reflection effect */}
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                    style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: '1px solid rgba(239, 68, 68, 1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">Confirm Logout</h3>
                </div>
                
                <p className="text-gray-800 mb-6 text-sm leading-relaxed font-medium">
                  Are you sure you want to logout? You will need to sign in again to access your account.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelLogout}
                    className="px-5 py-2.5 text-gray-800 font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px 0 rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmLogout}
                    className="px-5 py-2.5 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 1) 100%)',
                      border: '1px solid rgba(185, 28, 28, 0.8)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px 0 rgba(239, 68, 68, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 1) 0%, rgba(185, 28, 28, 1) 100%)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 1) 100%)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}