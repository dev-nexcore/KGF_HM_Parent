'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Documents() {
  const [studentData, setStudentData] = useState({
    
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    contactNumber: '',
    roomNo: '',
    bedAllotment: '',
    roommateName: '',
    lastCheckInDate: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get token from localStorage
        const parentToken = localStorage.getItem('parentToken');
        
        if (!parentToken) {
          throw new Error('Parent token not found');
        }

        // Decode the JWT token to get studentId
        const tokenPayload = JSON.parse(atob(parentToken.split('.')[1]));
        const studentId = tokenPayload.studentId;

        if (!studentId) {
          throw new Error('Student ID not found in token');
        }

        // Fetch student data from your API
        const response = await axios.get(`http://localhost:5000/api/studentauth/profile/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        });

        const student = response.data;
        console.log('Student Details API Response:', student);

        // Parse the name parts
       const studentName = student.studentName || student.name || student.firstName + ' ' + student.lastName || '';
        
        // Parse firstName and lastName from studentName
        const nameParts = studentName ? studentName.split(' ') : ['', ''];
        const firstName = nameParts[0] || student.firstName || '';
        const lastName = nameParts.slice(1).join(' ') || student.lastName || '';
        // Format last check-in date
        const formatDate = (dateString) => {
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        };

        setStudentData({
          firstName,
        
          lastName,
          studentId: student.studentId || studentId,
          email: student.email || 'N/A',
          contactNumber: student.contactNumber || 'N/A',
          roomNo: student.roomNo || 'N/A',
          bedAllotment: student.bedAllotment || 'N/A',
          roommateName: student.roommateName || 'No roommate',
          lastCheckInDate: formatDate(student.lastCheckInDate),
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching student details:', error);
        
        let errorMessage = 'Unknown error occurred';
        if (error.response) {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'Network error - unable to reach server';
        } else {
          errorMessage = error.message;
        }
        
        setStudentData(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));
      }
    };

    fetchStudentData();
  }, []);

  if (studentData.loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading student details...</div>
        </div>
      </div>
    );
  }

  if (studentData.error) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Error: {studentData.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold border-l-4 border-red-600 pl-2">
          Student Details
        </h2>
      </div>

      {/* Profile & Basic Info */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Profile Card */}
        <div className="bg-[#d6dccc] w-full lg:w-1/3 p-4 sm:p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px]">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-bold text-center">{studentData.firstName}{' '}{studentData.lastName}</h3>
          <p className="text-xs sm:text-sm text-center">ID: {studentData.studentId}</p>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white w-full lg:w-2/3 rounded-xl shadow-md overflow-hidden">
          <div className="bg-[#9CAD8F] px-4 py-2 sm:py-3 font-bold text-white text-sm sm:text-base">
            Basic Information
          </div>
          <div className="p-3 sm:p-4 text-xs sm:text-sm">
            {/* Mobile: Single column, Tablet+: Two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4">
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">First Name:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.firstName || 'N/A'}</p>
              </div>
              {/* <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Middle Name:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.middleName || 'N/A'}</p>
              </div> */}
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Last Name:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.lastName || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Email Address:</p>
                <p className="font-bold break-all sm:break-normal mb-2 sm:mb-0">{studentData.email}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Contact Number:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.contactNumber}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Room Number:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.roomNo}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Bed Number:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.bedAllotment}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Roommate:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.roommateName}</p>
              </div>
              <div className="flex flex-col sm:contents">
                <p className="text-gray-500">Last Check-in:</p>
                <p className="font-bold mb-2 sm:mb-0">{studentData.lastCheckInDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl">
        <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Uploaded Documents</h3>
        
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
            "Medical records.pdf"
          ].map((doc, index) => (
            <div key={index} className="grid grid-cols-2 font-bold items-center border-t px-3 py-3 text-sm">
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
            "Medical records.pdf"
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