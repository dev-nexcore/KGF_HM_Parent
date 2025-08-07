"use client";
import { useState, useEffect } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import axios from "axios";

export default function Documents() {
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    contactNumber: "",
    roomNo: "",
    bedAllotment: "",
    lastCheckInDate: "",
    profileImage: null,
    loading: true,
    error: null,
  });

  // ✅ helper to fetch photo from student-profile endpoint if not in dashboard
  const fetchStudentPhoto = async (studentId, parentToken) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-profile?studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const profile = res.data.student;
      let profileImageUrl = null;
      if (profile?.profileImage) {
        profileImageUrl = profile.profileImage;
      } else if (profile?.photo) {
        profileImageUrl = profile.photo;
      }

      if (profileImageUrl) {
        setStudentData(prev => ({
          ...prev,
          profileImage: profileImageUrl,
        }));
      }
    } catch (err) {
      console.error("Error fetching profile photo:", err);
    }
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const parentToken = localStorage.getItem("parentToken");
        if (!parentToken) throw new Error("Parent token not found");

        const tokenPayload = JSON.parse(atob(parentToken.split(".")[1]));
        const studentId = tokenPayload.studentId;
        if (!studentId) throw new Error("Student ID not found in token");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/dashboard?studentId=${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${parentToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const dashboardData = response.data;
        const studentInfo = dashboardData.studentInfo;
        console.log("Student Details from Dashboard API:", studentInfo);

        const firstName = studentInfo.firstName || "";
        const lastName = studentInfo.lastName || "";

        const formatDate = (dateString) => {
          if (!dateString) return "N/A";
          const date = new Date(dateString);
          return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };

        const parseRoomBed = (roomBedNumber) => {
          if (!roomBedNumber || roomBedNumber === "N/A") {
            return { roomNo: "N/A", bedAllotment: "N/A" };
          }
          if (roomBedNumber.includes("Room")) {
            const roomMatch = roomBedNumber.match(/Room\s+(\d+)/i);
            const roomNo = roomMatch ? roomMatch[1] : roomBedNumber;
            return { roomNo, bedAllotment: roomBedNumber };
          }
          return { roomNo: roomBedNumber, bedAllotment: roomBedNumber };
        };

        const { roomNo, bedAllotment } = parseRoomBed(studentInfo.roomBedNumber);

        // ✅ Prefer profileImage or photo from dashboard API
        let profileImageUrl = null;
        if (studentInfo.profileImage) {
          profileImageUrl = studentInfo.profileImage;
        } else if (studentInfo.photo) {
          profileImageUrl = studentInfo.photo;
        }

        setStudentData({
          firstName,
          lastName,
          studentId: studentInfo.studentId || studentId,
          email: studentInfo.email || "N/A",
          contactNumber: studentInfo.contactNumber || studentInfo.phone || "N/A",
          roomNo,
          bedAllotment,
          lastCheckInDate: formatDate(studentInfo.lastCheckInDate),
          profileImage: profileImageUrl,
          loading: false,
          error: null,
        });

        // ✅ If no profile image from dashboard, fetch from profile endpoint
        if (!profileImageUrl) {
          await fetchStudentPhoto(studentId, parentToken);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);

        let errorMessage = "Unknown error occurred";
        if (error.response) {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "Network error - unable to reach server";
        } else {
          errorMessage = error.message;
        }

        setStudentData((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    };

    fetchStudentData();
  }, []);

  if (studentData.loading) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
            Student Details
          </h2>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading student details...</div>
        </div>
      </div>
    );
  }

  if (studentData.error) {
    return (
      <div className="space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Fixed header to match Dashboard styling */}
        <div className="flex items-center ml-2 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
            Student Details
          </h2>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Error: {studentData.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center ml-2 mb-3 md:-mt-7">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-black-600 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      {/* Fixed header to match Dashboard styling */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
          Student Details
        </h2>
      </div>

      {/* Profile & Basic Info */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Profile Card - View Only for Parents */}
        <div className="bg-[#B8C5A8] w-full lg:w-1/3 p-4 sm:p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px]">
          {/* Profile Image Container - Read Only */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
            {studentData.profileImage ? (
              <img
                src={studentData.profileImage}
                alt="Student Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-600" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-center">
            {studentData.firstName} {studentData.lastName}
          </h3>
          <p className="text-xs sm:text-sm text-center">
            ID: {studentData.studentId}
          </p>

          {/* Info message for parents when no profile image */}
          {!studentData.profileImage && (
            <p className="text-xs text-center text-gray-600 mt-2 italic px-2">
              Profile photo can be uploaded from student panel
            </p>
          )}
        </div>

        {/* Basic Info Card */}
        <div className="bg-white w-full lg:w-2/3 rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#9CAD8F] px-4 py-2 sm:py-3 font-bold text-black text-sm sm:text-base">
            Basic Information
          </div>
          <div className="p-3 sm:p-4 text-xs sm:text-sm">
            {/* Mobile: Single column, Tablet+: Two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4">
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">First Name:</p>
                <p className="font-bold mb-2 sm:mb-0">
                  {studentData.firstName || "N/A"}
                </p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Last Name:</p>
                <p className="font-bold mb-2 sm:mb-0">
                  {studentData.lastName || "N/A"}
                </p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Email Address:</p>
                <p className="font-bold break-all sm:break-normal mb-2 sm:mb-0">
                  {studentData.email}
                </p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Contact Number:</p>
                <p className="font-bold mb-2 sm:mb-0">
                  {studentData.contactNumber}
                </p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Room Number:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.roomNo}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Bed Allotment:</p>
                <p className="font-bold mb-2 sm:mb-0">
                  {studentData.bedAllotment}
                </p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Status:</p>
                <p className="font-bold mb-2 sm:mb-0 text-green-600">
                  {studentData.roomNo !== 'N/A' ? 'Allocated' : 'Not Allocated'}
                </p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Last Check-in:</p>
                <p className="font-bold mb-2 sm:mb-0">
                  05-08-25 
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.1)]">
        <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
          Uploaded Documents
        </h3>

        {/* Desktop/Tablet Table View */}
        <div className="hidden sm:block border rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 bg-[#f9f9f9] p-3 font-semibold border-b text-sm">
            <p>Documents</p>
            <p className="text-right">Action</p>
          </div>
          {[
            "Birth Certificate.pdf",
            "Adhar Card.pdf",
            "Previous School LC.pdf",
            "Medical records.pdf",
          ].map((doc, index) => (
            <div
              key={index}
              className="grid grid-cols-2 font-bold items-center border-t px-3 py-3 text-sm"
            >
              <p>{doc}</p>
              <div className="flex justify-end">
                <button className="bg-[#9CAD8F] text-black px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {[
            "Birth Certificate.pdf",
            "Adhar Card.pdf",
            "Previous School LC.pdf",
            "Medical records.pdf",
          ].map((doc, index) => (
            <div key={index} className="border rounded-lg p-3 bg-[#f9f9f9]">
              <div className="flex flex-col space-y-2">
                <p className="font-bold text-sm break-all">{doc}</p>
                <button className="bg-[#9CAD8F] text-black px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-medium self-start">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}