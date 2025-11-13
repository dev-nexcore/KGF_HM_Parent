"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {toast, Toaster} from "react-hot-toast";
import { useProfile } from "../ProfileContext";

export default function ParentLogin() {
  const [studentId, setStudentId] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { refreshProfile } = useProfile();


  // Mount animation (removed test toast)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate Student ID format - only called when button is clicked
  const validateStudentId = (id) => {
    const trimmedId = id?.trim() || "";
    
    if (!trimmedId) {
      toast.error("Please enter Student ID", {
        id: 'student-id-error', // Prevent duplicate toasts
        duration: 3000,
      });
      return false;
    }
    
    if (trimmedId.length < 3) {
      toast.error("Student ID must be at least 3 characters long", {
        id: 'student-id-error',
        duration: 4000,
      });
      return false;
    }
    
    if (trimmedId.length > 20) {
      toast.error("Student ID cannot exceed 20 characters", {
        id: 'student-id-error',
        duration: 4000,
      });
      return false;
    }
    
    // Check for valid characters (alphanumeric and common special characters)
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(trimmedId)) {
      toast.error("Student ID can only contain letters, numbers, hyphens, and underscores", {
        id: 'student-id-error',
        duration: 5000,
      });
      return false;
    }
    
    return true;
  };

  // Validate OTP format - only called when button is clicked
  const validateOtp = (otpValue) => {
    if (!otpValue || !otpValue.trim()) {
      toast.error("Please enter OTP", {
        id: 'otp-error',
        duration: 3000,
      });
      return false;
    }
    
    if (otpValue.length !== 6) {
      toast.error("OTP must be exactly 6 digits", {
        id: 'otp-error',
        duration: 4000,
      });
      return false;
    }
    
    if (!/^\d{6}$/.test(otpValue)) {
      toast.error("OTP must contain only numbers", {
        id: 'otp-error',
        duration: 4000,
      });
      return false;
    }
    
    return true;
  };

  const handleSendOtp = async () => {
    // Dismiss any existing toasts first
    toast.dismiss();
    
    // Validate student ID before sending OTP
    if (!validateStudentId(studentId)) {
      return;
    }

    setIsOtpSending(true);
    
    // Show sending toast
    toast.loading("Sending OTP to your registered email and mobile number...", {
      id: 'sending-otp',
      
    });
    
    try {
      // Check if API URL is configured
      if (!process.env.NEXT_PUBLIC_PROD_API_URL) {
        toast.dismiss('sending-otp');
        toast.error("API configuration error. Please contact support.", {
          duration: 6000,
        });
        setIsOtpSending(false);
        return;
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/send-login-otp`, {
        studentId: studentId.trim(),
      }, {
        timeout: 10000, // 10 second timeout
      });

      // Validate response structure
      if (!response.data || !response.data.email) {
        toast.dismiss('sending-otp');
        toast.error("Invalid response from server. Please try again.", {
          duration: 5000,
        });
        setIsOtpSending(false);
        return;
      }

      toast.dismiss('sending-otp');
      setMaskedEmail(response.data.email);
      setIsOtpSent(true);
      toast.success("OTP sent successfully", {
        duration: 4000,
      });
      
    } catch (error) {
      console.error("Send OTP Error:", error);
      toast.dismiss('sending-otp');
      
      // Handle different types of errors with single toast
      if (axios.isCancel(error)) {
        toast.error("Request was cancelled");
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your internet connection and try again.", { 
          duration: 6000 
        });
      } else if (error.code === 'ERR_NETWORK') {
        toast.error("Network error. Please check your internet connection.", { 
          duration: 6000 
        });
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            toast.error(message || "Invalid Student ID format. Please check and try again.", {
              duration: 5000,
            });
            break;
          case 404:
            toast.error(message || "Student ID not found in our records. Please verify the Student ID.", {
              duration: 6000,
            });
            break;
          case 422:
            toast.error(message || "Invalid Student ID format. Please check and try again.", {
              duration: 5000,
            });
            break;
          case 429:
            toast.error("Too many requests. Please wait a moment before trying again.", {
              duration: 8000,
            });
            break;
          case 500:
            toast.error("Server error. Please try again later or contact support.", {
              duration: 6000,
            });
            break;
          case 503:
            toast.error("Service temporarily unavailable. Please try again later.", {
              duration: 6000,
            });
            break;
          default:
            toast.error(message || `Server error (${status}). Please try again.`, {
              duration: 5000,
            });
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please check your internet connection.", {
          duration: 6000,
        });
      } else {
        // Something else happened
        toast.error("An unexpected error occurred. Please try again.", {
          duration: 5000,
        });
      }
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleLogin = async () => {
    // Dismiss any existing toasts first
    toast.dismiss();
    
    // Validate both fields
    if (!validateStudentId(studentId)) {
      return;
    }
    
    if (!validateOtp(otp)) {
      return;
    }

    setIsLoading(true);
    
    toast.loading("Verifying OTP...", {
      id: 'verifying-otp',
    });
    
    try {
      // Check if API URL is configured
      if (!process.env.NEXT_PUBLIC_PROD_API_URL) {
        toast.dismiss('verifying-otp');
        toast.error("API configuration error. Please contact support.", {
          duration: 6000,
        });
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/login`, {
        studentId: studentId.trim(),
        otp: otp.trim(),
      }, {
        timeout: 10000, // 10 second timeout
      });

      // Validate response structure
      if (!response.data || !response.data.token || !response.data.parent) {
        toast.dismiss('verifying-otp');
        toast.error("Invalid login response. Please try again.", {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      const { token, parent } = response.data;

      // Validate token and parent data
      if (!token || typeof token !== 'string') {
        toast.dismiss('verifying-otp');
        toast.error("Invalid authentication token received.", {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      if (!parent || typeof parent !== 'object') {
        toast.dismiss('verifying-otp');
        toast.error("Invalid parent information received.", {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      // Store in localStorage with error handling
      try {
        localStorage.setItem("parentToken", token);
        localStorage.setItem("parentInfo", JSON.stringify(parent));
      } catch (storageError) {
        console.error("Storage Error:", storageError);
        toast.dismiss('verifying-otp');
        toast.error("Failed to save login information. Please ensure cookies are enabled.", {
          duration: 6000,
        });
        setIsLoading(false);
        return;
      }

      refreshProfile();

      toast.dismiss('verifying-otp');
      toast.success("Login successful! Redirecting...", {
        duration: 2000,
      });

      // Navigate with error handling
      setTimeout(() => {
        try {
          router.push("/dashboard");
        } catch (navigationError) {
          console.error("Navigation Error:", navigationError);
          toast.error("Login successful but failed to redirect. Please refresh the page.", {
            duration: 6000,
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error("Login Error:", error);
      toast.dismiss('verifying-otp');
      
      // Handle different types of errors
      if (axios.isCancel(error)) {
        toast.error("Request was cancelled");
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your internet connection and try again.", {
          duration: 6000,
        });
      } else if (error.code === 'ERR_NETWORK') {
        toast.error("Network error. Please check your internet connection.", {
          duration: 6000,
        });
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            toast.error(message || "Invalid Student ID or OTP format. Please check your input.", {
              duration: 5000,
            });
            break;
          case 401:
            toast.error(message || "Invalid or expired OTP. Please request a new OTP.", {
              duration: 6000,
            });
            // Reset to OTP input state
            setOtp("");
            break;
          case 404:
            toast.error(message || "Student ID not found. Please check and try again.", {
              duration: 6000,
            });
            break;
          case 422:
            toast.error(message || "Invalid OTP. Please check the 6-digit code and try again.", {
              duration: 5000,
            });
            setOtp("");
            break;
          case 429:
            toast.error("Too many login attempts. Please wait before trying again.", {
              duration: 8000,
            });
            break;
          case 500:
            toast.error("Server error. Please try again later or contact support.", {
              duration: 6000,
            });
            break;
          case 503:
            toast.error("Service temporarily unavailable. Please try again later.", {
              duration: 6000,
            });
            break;
          default:
            toast.error(message || `Server error (${status}). Please try again.`, {
              duration: 5000,
            });
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please check your internet connection.", {
          duration: 6000,
        });
      } else {
        // Something else happened
        toast.error("An unexpected error occurred during login. Please try again.", {
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!validateStudentId(studentId)) {
      return;
    }
    
    setOtp("");
    toast.loading("Resending OTP...", { duration: 1000 });
    
    // Add a small delay to prevent spam
    setTimeout(() => {
      handleSendOtp();
    }, 1000);
  };

  const handleBackToStudentId = () => {
    setIsOtpSent(false);
    setOtp("");
    setMaskedEmail("");
    toast.dismiss(); // Clear any existing toasts
  };

  // Simplified input change handlers - no validation toasts while typing
  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    
    // Allow only valid characters as user types (silent filtering)
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Limit length silently
    if (sanitizedValue.length <= 20) {
      setStudentId(sanitizedValue);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    
    // Only allow numeric input (silent filtering)
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 6 digits silently
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

  // Handle Enter key press with error handling
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      try {
        if (!isOtpSent) {
          handleSendOtp();
        } else {
          handleLogin();
        }
      } catch (error) {
        console.error("Key press handler error:", error);
        toast.error("An error occurred. Please try clicking the button instead.");
      }
    }
  };

  // Add error boundary for the component
  useEffect(() => {
    const handleError = (error) => {
      console.error("Global error:", error);
      toast.error("An unexpected error occurred. Please refresh the page.");
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      {/* Toast Container - Add this at the top */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '500px',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: '#fff',
            },
          },
        }}
      />
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Top Section */}
        <div className={`bg-[#A4B494] px-4 py-8 flex flex-col items-center justify-center text-center transition-all duration-1000 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <h1 className={`text-2xl font-extrabold mb-4 text-black transition-all duration-700 delay-300 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            Welcome Back!
          </h1>
          
          <div className={`transition-all duration-700 delay-500 ease-out transform ${
            mounted ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
          }`}>
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-white shadow-lg">
              <Image 
                src="/logo2.png"
                alt="KOKAN Global Foundation Logo" 
                className="w-full h-full object-cover"
                width={512}
                height={512} 
                priority={true}
                quality={100}
                style={{
                  imageRendering: 'auto',
                  textRendering: 'geometricPrecision'
                }}
                onError={() => {
                  toast.error("Failed to load logo image");
                }}
              />
            </div>
          </div>
          
          <p className={`mt-4 text-xs font-bold text-black leading-tight transition-all duration-700 delay-700 ease-out px-2 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            "Manage Your Hostel Smarter – Everything You Need in One Platform."
          </p>
        </div>

        {/* Bottom Section - Login Form */}
        <div className={`bg-white px-4 py-4 pb-6 transition-all duration-1000 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <h2 className={`text-xl font-bold mb-12 text-black text-center transition-all duration-700 delay-200 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}>
            Parent Login
          </h2>

          <div className={`transition-all duration-700 delay-400 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            {!isOtpSent ? (
              // Step 1: Student ID Input
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black block">
                    Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Your Child's Student ID"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A4B494] focus:border-transparent transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg placeholder:text-gray-400"
                    value={studentId}
                    onChange={handleStudentIdChange}
                    onKeyDown={handleKeyPress}
                    maxLength={20}
                    disabled={isOtpSending}
                  />
                </div>

                {/* Send OTP Button */}
                <div className="pt-4 pb-2">
                  <button
                    onClick={handleSendOtp}
                    disabled={isOtpSending || !studentId.trim()}
                    className="w-full bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-95 disabled:scale-100"
                  >
                    {isOtpSending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending OTP...</span>
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: OTP Input
              <div className={`space-y-4 ${isOtpSent ? 'animate-fadeInUp' : ''}`}>
                

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-black block">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A4B494] focus:border-transparent text-center text-lg tracking-widest transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                    value={otp}
                    onChange={handleOtpChange}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={handleBackToStudentId}
                    disabled={isLoading}
                    className="text-xs text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200 flex items-center space-x-1 disabled:text-gray-400 disabled:hover:no-underline"
                  >
                    <span>←</span>
                    <span>Change Student ID</span>
                  </button>
                  
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading || isOtpSending}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 disabled:text-gray-400 disabled:hover:no-underline"
                  >
                    Resend OTP
                  </button>
                </div>

                {/* Verify & Login Button */}
                <div className="pt-4 pb-2">
                  <button
                    onClick={handleLogin}
                    disabled={isLoading || !otp.trim() || otp.length !== 6}
                    className="w-full bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 text-sm rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-95 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-row md:h-screen">
        {/* Left Panel - Enhanced with animations */}
        <div className={`w-1/2 bg-[#A4B494] p-8 rounded-r-[5rem] flex flex-col items-center justify-center text-center transition-all duration-1000 ease-out ${
          mounted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}>
          <h1 className={`text-4xl font-extrabold mb-12 -mt-4 text-black transition-all duration-700 delay-300 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            Welcome Back!
          </h1>
          
          <div className={`transition-all duration-700 delay-500 ease-out transform ${
            mounted ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
          }`}>
            <div className="w-72 h-72 rounded-xl overflow-hidden bg-white shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out">
              <Image 
                src="/logo2.png"
                alt="KOKAN Global Foundation Logo" 
                className="w-full h-full object-cover"
                width={512}
                height={512} 
                priority={true}
                quality={100}
                style={{
                  imageRendering: 'auto',
                  textRendering: 'geometricPrecision'
                }}
                onError={() => {
                  toast.error("Failed to load logo image");
                }}
              />
            </div>
          </div>
          
          <p className={`mt-10 text-xl font-bold text-black leading-tight transition-all duration-700 delay-700 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            "Manage Your Hostel Smarter – Everything You Need in&nbsp;
            <br />
            One Platform."
          </p>
        </div>

        {/* Right Panel - Enhanced with slide-in animation */}
        <div className={`w-1/2 bg-white p-12 flex flex-col justify-center items-center transition-all duration-1000 ease-out ${
          mounted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <h2 className={`text-4xl font-bold mb-10 text-black text-center transition-all duration-700 delay-200 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}>
            Parent Login
          </h2>

          <div className={`flex flex-col w-full max-w-md transition-all duration-700 delay-400 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            {!isOtpSent ? (
              // Step 1: Student ID Input with fade-in animation
              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <label className="text-xl font-semibold text-black w-full text-left block transition-colors duration-200">
                    Student ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Your Child's Student ID"
                    className="w-full px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494] focus:border-transparent transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg placeholder:text-gray-500"
                    value={studentId}
                    onChange={handleStudentIdChange}
                    onKeyDown={handleKeyPress}
                    maxLength={20}
                    disabled={isOtpSending}
                  />
                </div>

                {/* Send OTP Button with enhanced hover effects */}
                <div className="w-full flex justify-center">
                  <button
                    onClick={handleSendOtp}
                    disabled={isOtpSending || !studentId.trim()}
                    className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:hover:shadow-md"
                  >
                    {isOtpSending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending OTP...</span>
                      </div>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: OTP Input with slide-in animation
              <div className={`w-full space-y-4 transition-all duration-500 ease-in-out ${
                isOtpSent ? 'animate-fadeInUp' : ''
              }`}>
                

                <div className="space-y-2">
                  <label className="text-xl font-semibold text-black w-full text-left block">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className="w-full px-4 py-3 rounded-[1rem] border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#A4B494] focus:border-transparent text-center text-lg tracking-widest transition-all duration-300 ease-in-out transform focus:scale-[1.02] hover:shadow-lg"
                    value={otp}
                    onChange={handleOtpChange}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>

                {/* Navigation buttons */}
                <div className="w-full flex justify-between items-center">
                  <button
                    onClick={handleBackToStudentId}
                    disabled={isLoading}
                    className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200 flex items-center space-x-1 transform hover:translate-x-1 disabled:text-gray-400 disabled:hover:no-underline disabled:transform-none"
                  >
                    <span>←</span>
                    <span>Change Student ID</span>
                  </button>
                  
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading || isOtpSending}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 disabled:text-gray-400 disabled:hover:no-underline"
                  >
                    Resend OTP
                  </button>
                </div>

                {/* Login Button */}
                <div className="w-full flex justify-center pt-2">
                  <button
                    onClick={handleLogin}
                    disabled={isLoading || !otp.trim() || otp.length !== 6}
                    className="w-2/3 bg-[#BEC5AD] hover:bg-[#a9b29d] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        /* Pulse animation for loading states */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}