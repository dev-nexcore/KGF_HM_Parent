"use client";

import React, { useState, useEffect } from "react";
import { 
  FaUser, FaCamera, FaEdit, FaSave, FaTimes, 
  FaPhone, FaEnvelope, FaCalendarAlt, FaUserCheck,
  FaIdCard, FaCreditCard, FaUserGraduate, FaFileInvoice, 
  FaEye, FaFileAlt, FaShieldAlt
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedData, setEditedData] = useState({});

  const updateLocalStorageAndNotify = (key, value) => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
    window.dispatchEvent(new Event('localStorageUpdate'));
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const parentToken = localStorage.getItem('parentToken');
      if (!parentToken) throw new Error('No authentication token found');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/profile`,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProfileData(response.data.profile);
      setEditedData({
        firstName: response.data.profile.parentInfo.firstName,
        lastName: response.data.profile.parentInfo.lastName,
        contactNumber: response.data.profile.parentInfo.contactNumber
      });

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
      if (err.response?.status === 401) {
        localStorage.removeItem('parentToken');
        localStorage.removeItem('parentInfo');
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const parentToken = localStorage.getItem('parentToken');
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfileData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          profileImage: response.data.profileImage
        }
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        updateLocalStorageAndNotify('parentProfileImage', e.target.result);
      };
      reader.readAsDataURL(file);

      toast.success('Profile image updated successfully!');

    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const parentToken = localStorage.getItem('parentToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/profile`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProfileData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          ...editedData
        }
      }));

      const parentInfo = JSON.parse(localStorage.getItem('parentInfo') || '{}');
      const updatedParentInfo = {
        ...parentInfo,
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        contactNumber: editedData.contactNumber
      };
      updateLocalStorageAndNotify('parentInfo', JSON.stringify(updatedParentInfo));
      setIsEditing(false);
      toast.success('Profile updated successfully!');

    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleRemoveImage = async () => {
    try {
      const parentToken = localStorage.getItem('parentToken');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/profile/image`,
        { headers: { Authorization: `Bearer ${parentToken}` } }
      );

      setProfileData(prev => ({
        ...prev,
        parentInfo: { ...prev.parentInfo, profileImage: null }
      }));

      updateLocalStorageAndNotify('parentProfileImage', null);
      toast.success('Profile image removed successfully!');

    } catch (err) {
      console.error('Error removing image:', err);
      toast.error(err.response?.data?.message || 'Failed to remove image');
    }
  };

  const getProfileImageSrc = () => {
    if (profileData?.parentInfo?.profileImage) {
      return `${process.env.NEXT_PUBLIC_PROD_API_URL}/${profileData.parentInfo.profileImage}`;
    }
    return localStorage.getItem('parentProfileImage') || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A4B494] mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Profile</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchProfileData} className="px-4 py-2 bg-[#A4B494] text-white rounded-lg hover:bg-[#8DA087] transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { parentInfo, studentInfo } = profileData;

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-[#4F8DCF] mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Profile</h2>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="bg-gradient-to-r from-[#A4B494] to-[#BEC5AD] p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                {getProfileImageSrc() ? (
                  <img src={getProfileImageSrc()} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaUser className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer">
                  <FaCamera className="w-8 h-8 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
              )}
              {getProfileImageSrc() && (
                <button onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors">
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-center md:text-left text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{parentInfo.firstName} {parentInfo.lastName}</h2>
              <p className="text-lg opacity-90 mb-1">Parent</p>
              <p className="text-sm opacity-75">Student ID: {parentInfo.studentId}</p>
              <p className="text-sm opacity-75">Member since {new Date(parentInfo.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="md:ml-auto">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-white text-[#A4B494] px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <FaEdit className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <FaSave className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditedData({ firstName: parentInfo.firstName, lastName: parentInfo.lastName, contactNumber: parentInfo.contactNumber }); }} className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-700 transition-colors">
                    <FaTimes className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Parent Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaUserCheck className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">First Name</label>
                    {isEditing ? (
                      <input type="text" value={editedData.firstName} onChange={(e) => setEditedData(prev => ({ ...prev, firstName: e.target.value }))} className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]" />
                    ) : ( <div className="text-lg text-gray-800">{parentInfo.firstName}</div> )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUserCheck className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Last Name</label>
                    {isEditing ? (
                      <input type="text" value={editedData.lastName} onChange={(e) => setEditedData(prev => ({ ...prev, lastName: e.target.value }))} className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]" />
                    ) : ( <div className="text-lg text-gray-800">{parentInfo.lastName}</div> )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Email Address</label>
                    <div className="text-lg text-gray-800">{parentInfo.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Contact Number</label>
                    {isEditing ? (
                      <input type="tel" value={editedData.contactNumber} onChange={(e) => setEditedData(prev => ({ ...prev, contactNumber: e.target.value }))} className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]" />
                    ) : ( <div className="text-lg text-gray-800">{parentInfo.contactNumber}</div> )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">Student Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaUserGraduate className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Student Name</label>
                    <div className="text-lg text-gray-800">{studentInfo.firstName} {studentInfo.lastName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Student Email</label>
                    <div className="text-lg text-gray-800">{studentInfo.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Student Contact</label>
                    <div className="text-lg text-gray-800">{studentInfo.contactNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Admission Date</label>
                    <div className="text-lg text-gray-800">{studentInfo.admissionDate ? new Date(studentInfo.admissionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not available'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-5 h-5 text-[#A4B494]" /> Account Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-semibold text-xs">Status</div>
                <div className="text-lg font-bold text-green-600">Active</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 font-semibold text-xs">Last Updated</div>
                <div className="text-sm font-bold text-blue-600">{new Date(parentInfo.updatedAt).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-purple-800 font-semibold text-xs">Student ID</div>
                <div className="text-lg font-bold text-purple-600">{parentInfo.studentId}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileAlt className="w-5 h-5 text-[#A4B494]" /> Student Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'aadharCard', label: 'Aadhar Card', Icon: FaIdCard, color: 'bg-blue-100 text-blue-600' },
                { id: 'panCard', label: 'PAN Card', Icon: FaCreditCard, color: 'bg-orange-100 text-orange-600' },
                { id: 'studentIdCard', label: 'Student ID Card', Icon: FaUserGraduate, color: 'bg-purple-100 text-purple-600' },
                { id: 'feesReceipt', label: 'Fee Receipt', Icon: FaFileInvoice, color: 'bg-green-100 text-green-600' }
              ].map((doc) => {
                const isUploaded = studentInfo.documents && studentInfo.documents[doc.id] && studentInfo.documents[doc.id].path;
                return (
                  <div key={doc.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-between bg-white shadow-sm hover:shadow-md transition-all group">
                    <div className={`p-4 rounded-2xl ${doc.color} mb-3 group-hover:scale-110 transition-transform`}>
                      <doc.Icon className="w-8 h-8" />
                    </div>
                    <div className="text-center mb-4">
                      <p className="font-bold text-gray-800 text-sm">{doc.label}</p>
                      <p className={`text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block ${isUploaded ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {isUploaded ? 'Verified & Uploaded' : 'Not Uploaded'}
                      </p>
                    </div>
                    {isUploaded ? (
                      <button
                        onClick={() => {
                          const parentToken = localStorage.getItem('parentToken');
                          window.open(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/student-document/${doc.id}?token=${parentToken}`, '_blank');
                        }}
                        className="w-full py-2.5 bg-[#4F8DCF] text-white rounded-xl text-xs font-bold hover:bg-[#3d72a8] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                      >
                        <FaEye className="w-3.5 h-3.5" /> View Document
                      </button>
                    ) : (
                      <button disabled className="w-full py-2.5 bg-gray-50 text-gray-300 rounded-xl text-xs font-bold cursor-not-allowed border border-gray-100">
                        No File Found
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}