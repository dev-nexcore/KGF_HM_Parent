// src/components/ProfileContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [parentFullName, setParentFullName] = useState("Parent");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
  try {
    const parentToken = localStorage.getItem('parentToken');
    
    if (!parentToken) {
      loadFromLocalStorage();
      return;
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

    const { parentInfo } = response.data.profile;
    
    // Set parent name
    const firstName = parentInfo.firstName || "";
    const lastName = parentInfo.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    setParentFullName(fullName || "Parent");
    localStorage.setItem('parentFullName', fullName);

    // Set and save profile image
    if (parentInfo.profileImage) {
      const imageUrl = `${process.env.NEXT_PUBLIC_PROD_API_URL}/${parentInfo.profileImage}`;
      setProfileImage(imageUrl);
      localStorage.setItem('parentProfileImage', imageUrl);
    } else {
      const localImage = localStorage.getItem('parentProfileImage');
      setProfileImage(localImage);
    }

  } catch (error) {
    console.error('Failed to fetch profile data:', error);
    loadFromLocalStorage();
  } finally {
    setLoading(false);
  }
};


  const loadFromLocalStorage = () => {
    const parentInfo = localStorage.getItem("parentInfo");
    if (parentInfo) {
      try {
        const parsed = JSON.parse(parentInfo);
        const firstName = parsed.firstName || parsed.firstname || "";
        const lastName = parsed.lastName || parsed.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();
        setParentFullName(fullName || "Parent");
      } catch (error) {
        console.error("Failed to parse parent info from localStorage", error);
      }
    }

    const storedImage = localStorage.getItem("parentProfileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
    setLoading(false);
  };

  // Function to refresh profile data (call this after profile updates)
  const refreshProfile = () => {
    setLoading(true);
    fetchProfileData();
  };

  return (
    <ProfileContext.Provider value={{
      parentFullName,
      profileImage,
      loading,
      refreshProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};