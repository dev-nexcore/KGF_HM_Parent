"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Edit2, Save, X, Phone, Mail, Calendar, UserCheck } from "lucide-react";
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
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('localStorageUpdate'));
};

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const parentToken = localStorage.getItem('parentToken');
      
      if (!parentToken) {
        throw new Error('No authentication token found');
      }

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
        // Token expired, redirect to login
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
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

      // Update profile data with new image
      setProfileData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          profileImage: response.data.profileImage
        }
      }));

      // Store image in localStorage for immediate use
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
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/parentauth/profile`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update profile data
      setProfileData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          ...editedData
        }
      }));

      // Update localStorage
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
        {
          headers: {
            Authorization: `Bearer ${parentToken}`
          }
        }
      );

      // Update profile data
      setProfileData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          profileImage: null
        }
      }));

      // Remove from localStorage
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
    // Check localStorage for uploaded image
    const localImage = localStorage.getItem('parentProfileImage');
    return localImage || null;
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
          <button 
            onClick={fetchProfileData} 
            className="px-4 py-2 bg-[#A4B494] text-white rounded-lg hover:bg-[#8DA087] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { parentInfo, studentInfo } = profileData;

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header - Matching fees page layout */}
      <div className="flex items-center ml-2 mb-4 sm:mb-6">
        <div className="w-1 h-6 sm:h-7 bg-red-500 mr-2 sm:mr-3"></div>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Profile</h2>
      </div>

      {/* Main Profile Card - Matching fees page container */}
      <div className="w-full bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden" style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        {/* Profile Header Section */}
        <div className="bg-gradient-to-r from-[#A4B494] to-[#BEC5AD] p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Profile Image */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden">
                {getProfileImageSrc() ? (
                  <img 
                    src={getProfileImageSrc()} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Image Upload Overlay */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              
              {/* Upload Progress */}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
              )}

              {/* Remove Image Button */}
              {getProfileImageSrc() && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {parentInfo.firstName} {parentInfo.lastName}
              </h2>
              <p className="text-lg opacity-90 mb-1">Parent</p>
              <p className="text-sm opacity-75">Student ID: {parentInfo.studentId}</p>
              <p className="text-sm opacity-75">
                Member since {new Date(parentInfo.createdAt).toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Edit Button */}
            <div className="md:ml-auto">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-[#A4B494] px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedData({
                        firstName: parentInfo.firstName,
                        lastName: parentInfo.lastName,
                        contactNumber: parentInfo.contactNumber
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Parent Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                Parent Information
              </h3>
              
              <div className="space-y-4">
                {/* First Name */}
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.firstName}
                        onChange={(e) => setEditedData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]"
                      />
                    ) : (
                      <div className="text-lg text-gray-800">{parentInfo.firstName}</div>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.lastName}
                        onChange={(e) => setEditedData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]"
                      />
                    ) : (
                      <div className="text-lg text-gray-800">{parentInfo.lastName}</div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Email Address</label>
                    <div className="text-lg text-gray-800">{parentInfo.email}</div>
                    <p className="text-xs text-gray-400">Email cannot be changed</p>
                  </div>
                </div>

                {/* Contact Number */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Contact Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData.contactNumber}
                        onChange={(e) => setEditedData(prev => ({ ...prev, contactNumber: e.target.value }))}
                        className="block w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A4B494]"
                      />
                    ) : (
                      <div className="text-lg text-gray-800">{parentInfo.contactNumber}</div>
                    )}
                  </div>
                </div>

                {/* Account Created */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Account Created</label>
                    <div className="text-lg text-gray-800">
                      {new Date(parentInfo.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                Student Information
              </h3>
              
              <div className="space-y-4">
                {/* Student Name */}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Student Name</label>
                    <div className="text-lg text-gray-800">
                      {studentInfo.firstName} {studentInfo.lastName}
                    </div>
                  </div>
                </div>

                {/* Student Email */}
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Student Email</label>
                    <div className="text-lg text-gray-800">{studentInfo.email}</div>
                  </div>
                </div>

                {/* Student Contact */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Student Contact</label>
                    <div className="text-lg text-gray-800">{studentInfo.contactNumber}</div>
                  </div>
                </div>

                {/* Admission Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Admission Date</label>
                    <div className="text-lg text-gray-800">
                      {studentInfo.admissionDate 
                        ? new Date(studentInfo.admissionDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Not available'
                      }
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-[#A4B494]" />
                  <div className="flex-1">
                    <label className="text-sm text-gray-500">Emergency Contact</label>
                    <div className="text-lg text-gray-800">
                      {studentInfo.emergencyContactName || 'Not provided'}
                    </div>
                    {studentInfo.emergencyContactNumber && (
                      <div className="text-sm text-gray-600">
                        {studentInfo.emergencyContactNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 font-semibold">Account Status</div>
                <div className="text-2xl font-bold text-green-600">Active</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-800 font-semibold">Last Updated</div>
                <div className="text-sm font-medium text-blue-600">
                  {new Date(parentInfo.updatedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-purple-800 font-semibold">Student ID</div>
                <div className="text-xl font-bold text-purple-600">{parentInfo.studentId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}