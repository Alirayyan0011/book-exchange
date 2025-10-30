'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Save, Lock, Phone, Mail, UserIcon, LogOut } from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';
import UserSidebar from '@/components/user/Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  profileImage?: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface ProfileLayoutProps {
  isAdmin?: boolean;
}

export default function ProfileLayout({ isAdmin = false }: ProfileLayoutProps) {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, [isAdmin]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = isAdmin ? '/api/admin/profile' : '/api/user/profile';

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          mobileNumber: data.user.mobileNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        if (data.user.profileImage) {
          setImagePreview(data.user.profileImage);
        }
      } else {
        setMessage(data.message || 'Failed to fetch profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error fetching profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push(isAdmin ? '/admin/login' : '/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        setMessageType('error');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      // Validate passwords if provided
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setMessage('Current password is required to set new password');
          setMessageType('error');
          setUpdating(false);
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setMessage('New passwords do not match');
          setMessageType('error');
          setUpdating(false);
          return;
        }

        if (formData.newPassword.length < 8) {
          setMessage('New password must be at least 8 characters long');
          setMessageType('error');
          setUpdating(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const apiUrl = isAdmin ? '/api/admin/profile' : '/api/user/profile';

      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('mobileNumber', formData.mobileNumber);

      if (formData.currentPassword && formData.newPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage);
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setMessage('Profile updated successfully');
        setMessageType('success');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setSelectedImage(null);
      } else {
        setMessage(data.message || 'Failed to update profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error updating profile');
      setMessageType('error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isAdmin ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
        {isAdmin ? (
          <AdminSidebar
            activeItem="profile"
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        ) : (
          <UserSidebar
            activeItem="profile"
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}
        <div className={`transition-all duration-300 flex flex-col min-h-screen ${
          isSidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}>
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
              <p className="text-slate-600 font-light">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      {/* Sidebar */}
      {isAdmin ? (
        <AdminSidebar
          activeItem="profile"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      ) : (
        <UserSidebar
          activeItem="profile"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        {/* Header */}
        <header className={`shadow-lg border-b ${
          isAdmin ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-light ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
                {isAdmin ? 'Admin Profile' : 'My Profile'}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`font-light ${isAdmin ? 'text-slate-300' : 'text-slate-600'}`}>
                  Welcome, {profile?.firstName} {profile?.lastName}
                </span>
                {isAdmin && (
                  <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Administrator
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isAdmin
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                {message && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    messageType === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Profile Image Section */}
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-200">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <UserIcon size={32} />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 bg-slate-600 hover:bg-slate-700 text-white p-1.5 rounded-full shadow-lg transition-colors"
                      >
                        <Camera size={12} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-medium text-slate-900">
                        {profile?.firstName} {profile?.lastName}
                      </h3>
                      <p className="text-slate-600 flex items-center justify-center sm:justify-start text-sm">
                        <Mail size={14} className="mr-2" />
                        {profile?.email}
                      </p>
                      {profile?.isAdmin && (
                        <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          Administrator
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone size={14} className="inline mr-2" />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                        placeholder="Enter your mobile number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email (Read-only)
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
                      <Lock size={18} className="mr-2" />
                      Change Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 text-sm"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}