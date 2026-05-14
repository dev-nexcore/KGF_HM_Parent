"use client";
import { useState, useEffect } from "react";
import { FaIdCard, FaCreditCard, FaUserGraduate, FaFileInvoice, FaEye, FaArrowLeft, FaUser, FaFileAlt } from "react-icons/fa";
import Link from 'next/link';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function StudentDocuments() {
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
    documents: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setStudentData(prev => ({ ...prev, loading: true }));
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

        const { studentInfo } = response.data;
        
        setStudentData({
          firstName: studentInfo.firstName || "N/A",
          lastName: studentInfo.lastName || "N/A",
          studentId: studentInfo.studentId || studentId,
          email: studentInfo.email || "N/A",
          contactNumber: studentInfo.contactNumber || "N/A",
          roomNo: studentInfo.roomBedDetails?.room || "Not Assigned",
          bedAllotment: studentInfo.roomBedDetails?.bedType || "N/A",
          lastCheckInDate: studentInfo.lastCheckInDate ? new Date(studentInfo.lastCheckInDate).toLocaleDateString('en-GB') : "N/A",
          profileImage: studentInfo.profileImage || studentInfo.photo,
          documents: studentInfo.documents,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error("Error fetching student details:", error);
        setStudentData(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || error.message,
        }));
      }
    };

    fetchStudentData();
  }, []);

  const handleViewDocument = (docId) => {
    const parentToken = localStorage.getItem('parentToken');
    if (!parentToken) {
      toast.error("Session expired. Please login again.");
      return;
    }
    const url = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-document/${docId}?token=${parentToken}`;
    window.open(url, '_blank');
  };

  if (studentData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const documentList = [
    { id: 'aadharCard', label: 'Aadhar Card', Icon: FaIdCard, filename: 'Aadhar Card.pdf' },
    { id: 'panCard', label: 'PAN Card', Icon: FaCreditCard, filename: 'PAN Card.pdf' },
    { id: 'studentIdCard', label: 'Student ID Card', Icon: FaUserGraduate, filename: 'Student ID Card.pdf' },
    { id: 'feesReceipt', label: 'Latest Fee Receipt', Icon: FaFileInvoice, filename: 'Fee Receipt.pdf' }
  ];

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6 bg-gray-50/30 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <div className="flex items-center ml-2 mb-3 md:-mt-4">
        <Link href="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
          <FaArrowLeft className="w-3 h-3 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Student Details</h2>
      </div>

      {/* Profile & Basic Info Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Side Card */}
        <div className="bg-[#A4B494] w-full lg:w-1/3 p-8 rounded-2xl shadow-lg shadow-[#A4B494]/20 flex flex-col items-center justify-center text-white">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full mb-6 flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-xl">
            {studentData.profileImage ? (
              <img src={studentData.profileImage} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="w-16 h-16 text-gray-300" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-1">{studentData.firstName} {studentData.lastName}</h3>
          <p className="text-sm opacity-90 font-medium mb-4">ID: {studentData.studentId}</p>
          <div className="text-center text-xs opacity-75 italic bg-black/10 px-4 py-2 rounded-full">
            Profile photo can be uploaded from student panel
          </div>
        </div>

        {/* Info Grid Card */}
        <div className="bg-white w-full lg:w-2/3 rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-[#9CAD8F] px-6 py-4 font-bold text-white text-lg">
            Basic Information
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'First Name', value: studentData.firstName },
                { label: 'Last Name', value: studentData.lastName },
                { label: 'Email Address', value: studentData.email },
                { label: 'Contact Number', value: studentData.contactNumber },
                { label: 'Room Number', value: studentData.roomNo },
                { label: 'Bed Allotment', value: studentData.bedAllotment },
                { label: 'Status', value: studentData.roomNo !== 'Not Assigned' ? 'Allocated' : 'Pending', isStatus: true },
                { label: 'Last Check-in', value: studentData.lastCheckInDate }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-gray-50 last:border-0 sm:block sm:border-0 sm:py-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{item.label}</span>
                  <span className={`font-bold text-sm sm:text-base ${item.isStatus ? (item.value === 'Allocated' ? 'text-green-600' : 'text-orange-500') : 'text-gray-800'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="font-bold mb-6 text-lg text-gray-800 flex items-center gap-2">
          <FaFileAlt className="w-5 h-5 text-[#9CAD8F]" />
          Uploaded Documents
        </h3>

        {/* Responsive Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documentList.map((doc, index) => {
                const isUploaded = studentData.documents?.[doc.id]?.path;
                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-blue-500 transition-all`}>
                          <doc.Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-gray-700">{doc.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {isUploaded ? 'UPLOADED' : 'NOT FOUND'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isUploaded ? (
                        <button 
                          onClick={() => handleViewDocument(doc.id)}
                          className="bg-[#9CAD8F] text-white px-5 py-2 rounded-lg hover:bg-[#8da087] transition-all text-xs font-bold shadow-md shadow-green-100 flex items-center gap-2 ml-auto"
                        >
                          <FaEye className="w-3 h-3" /> View
                        </button>
                      ) : (
                        <button disabled className="bg-gray-100 text-gray-300 px-5 py-2 rounded-lg text-xs font-bold cursor-not-allowed ml-auto border border-gray-200">
                          Unavailable
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}