"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Edit2, Save, X, Phone, Mail, Calendar, UserCheck, ShieldCheck, MapPin, BadgeCheck, Clock } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

// ── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#7A8B5E",
  bgLight: "#F8FAF5",
  accent: "#7A8B5E",
  accentDark: "#5A6E3A",
  accentLight: "#E8EDDF",
  gold: "#C5A059",
  goldLight: "#F4EDE1",
  text: "#1A1F16",
  textMuted: "#6B7280",
  border: "rgba(122,139,94,0.15)",
  glass: "rgba(255, 255, 255, 0.9)",
  shadow: "rgba(40, 50, 30, 0.08)",
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedData, setEditedData] = useState({});

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
        { headers: { Authorization: `Bearer ${parentToken}` } }
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
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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
        parentInfo: { ...prev.parentInfo, profileImage: response.data.profileImage }
      }));
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error('Failed to upload image');
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
        { headers: { Authorization: `Bearer ${parentToken}` } }
      );

      setProfileData(prev => ({
        ...prev,
        parentInfo: { ...prev.parentInfo, ...editedData }
      }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAF5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#7A8B5E] border-t-transparent"></div>
    </div>
  );

  const { parentInfo, studentInfo } = profileData;
  const profileImg = parentInfo.profileImage ? `${process.env.NEXT_PUBLIC_PROD_API_URL}/${parentInfo.profileImage}` : null;

  return (
    <div className="min-h-screen bg-[#F8FAF5] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#7A8B5E] rounded-full"></div>
        <h2 className="text-2xl font-black text-[#1A1F16]">Account Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Profile Card ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#7A8B5E]/10 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#7A8B5E] to-[#5A6E3A]"></div>
            
            <div className="relative mt-12 mb-6">
              <div className="w-32 h-32 mx-auto rounded-[40px] bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-[35px] bg-[#E8EDDF] overflow-hidden flex items-center justify-center relative group/img">
                  {profileImg ? (
                    <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-[#7A8B5E]" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" />
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/80 rounded-[40px] flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-[#7A8B5E] border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            <h3 className="text-2xl font-black text-[#1A1F16]">{parentInfo.firstName} {parentInfo.lastName}</h3>
            <p className="text-[#7A8B5E] font-bold text-sm uppercase tracking-widest mt-1">Authorized Parent</p>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#6B7280] uppercase">
                <BadgeCheck size={14} className="text-green-500" /> Account Verified
              </div>
              <div className="text-[10px] font-black text-[#9CAD8F] uppercase tracking-tighter">
                Member Since {new Date(parentInfo.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-8 w-full py-4 rounded-2xl bg-[#E8EDDF] text-[#7A8B5E] font-black text-sm uppercase tracking-widest hover:bg-[#7A8B5E] hover:text-white transition-all shadow-sm"
              >
                Edit Profile
              </button>
            ) : (
              <div className="mt-8 flex gap-3">
                <button onClick={handleSaveProfile} className="flex-1 py-4 rounded-2xl bg-[#7A8B5E] text-white font-black text-sm uppercase">Save</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-2xl bg-red-50 text-red-500 font-black text-sm uppercase">Cancel</button>
              </div>
            )}
          </div>

          <div className="bg-[#1A1F16] rounded-[32px] p-6 text-white text-center">
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.2em] mb-2">Need Help?</p>
            <p className="text-sm text-white/70 mb-4 font-medium">Update your security settings or contact support for assistance.</p>
            <button className="w-full py-3 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Support Center</button>
          </div>
        </div>

        {/* ── Right Column: Details ── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Parent Info Section */}
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#7A8B5E]/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#E8EDDF] flex items-center justify-center text-[#7A8B5E]">
                <User size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1A1F16]">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <ProfileField 
                label="First Name" 
                value={parentInfo.firstName} 
                editing={isEditing} 
                onChange={(v) => setEditedData({...editedData, firstName: v})}
                val={editedData.firstName}
              />
              <ProfileField 
                label="Last Name" 
                value={parentInfo.lastName} 
                editing={isEditing} 
                onChange={(v) => setEditedData({...editedData, lastName: v})}
                val={editedData.lastName}
              />
              <ProfileField 
                label="Email Address" 
                value={parentInfo.email} 
                icon={<Mail size={16} />}
                disabled
              />
              <ProfileField 
                label="Contact Number" 
                value={parentInfo.contactNumber} 
                editing={isEditing} 
                onChange={(v) => setEditedData({...editedData, contactNumber: v})}
                val={editedData.contactNumber}
                icon={<Phone size={16} />}
              />
            </div>
          </section>

          {/* Student Association Section */}
          <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#7A8B5E]/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1A1F16]">Associated Student</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <DisplayField label="Student Full Name" value={`${studentInfo.firstName} ${studentInfo.lastName}`} icon={<User size={16}/>} />
              <DisplayField label="Registration ID" value={parentInfo.studentId} icon={<ShieldCheck size={16}/>} />
              <DisplayField label="Official Email" value={studentInfo.email} icon={<Mail size={16}/>} />
              <DisplayField label="Emergency Contact" value={studentInfo.emergencyContactNumber} icon={<Phone size={16}/>} />
            </div>
          </section>

          {/* Account Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ActivityCard label="Last Updated" value={new Date(parentInfo.updatedAt).toLocaleDateString()} icon={<Clock size={20} className="text-blue-500"/>} />
            <ActivityCard label="Admission Date" value={new Date(studentInfo.admissionDate).toLocaleDateString()} icon={<Calendar size={20} className="text-purple-500"/>} />
            <ActivityCard label="Location" value="Hostel Block A" icon={<MapPin size={20} className="text-red-500"/>} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, editing, onChange, val, icon, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
        {icon} {label}
      </label>
      {editing && !disabled ? (
        <input 
          type="text" 
          value={val} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#F8FAF5] border border-[#7A8B5E]/10 focus:border-[#7A8B5E] focus:ring-0 outline-none font-bold text-[#1A1F16] transition-all"
        />
      ) : (
        <div className={`w-full px-4 py-3 rounded-xl bg-[#F8FAF5] border border-transparent font-black text-[#1A1F16] ${disabled ? 'opacity-60' : ''}`}>
          {value}
        </div>
      )}
    </div>
  );
}

function DisplayField({ label, value, icon }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-[#6B7280] uppercase tracking-widest flex items-center gap-2">
        {icon} {label}
      </label>
      <div className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent font-black text-[#1A1F16]">
        {value || 'N/A'}
      </div>
    </div>
  );
}

function ActivityCard({ label, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-[#7A8B5E]/5 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-[#1A1F16] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
