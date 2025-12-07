"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, ArrowLeft, User, Lock, Mail, Save, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    full_name: "",
  });
  
  const [usernameForm, setUsernameForm] = useState({
    username: "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    fetchUserData(token);
  }, [router]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/verify-token/', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setUsernameForm({ username: data.user.full_name || data.user.username });
        setIsLoading(false);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError("Authentication token not found");
      setIsSaving(false);
      return;
    }
    
    if (!usernameForm.username.trim()) {
      setError("Username cannot be empty");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/users/update-username/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: usernameForm.username }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Username updated successfully!");
        setUserData(prev => ({ ...prev, full_name: data.user.full_name, username: data.user.username }));
        
        // Update localStorage so it reflects everywhere
        localStorage.setItem('userFullName', data.user.full_name || data.user.username);
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new Event('usernameUpdated'));
        
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update username");
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setError("An error occurred while updating username");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError("Authentication token not found");
      setIsSaving(false);
      return;
    }
    
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setError("All password fields are required");
      setIsSaving(false);
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match");
      setIsSaving(false);
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      setError("New password must be at least 6 characters long");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/users/update-password/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });

      if (response.ok) {
        setSuccess("Password updated successfully!");
        setPasswordForm({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update password");
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError("An error occurred while updating password");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
              <Settings size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <p className="text-green-600">{success}</p>
            <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
              ×
            </button>
          </div>
        )}

        {/* Account Information (Read-only) */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Mail className="text-green-600" size={24} />
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg">
                <Mail size={20} className="text-gray-400" />
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="flex-1 bg-transparent text-gray-600 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Email address cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Update Username */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-green-600" size={24} />
            Update Username
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username / Full Name</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                <User size={20} className="text-gray-400" />
                <input
                  type="text"
                  value={usernameForm.username}
                  onChange={(e) => setUsernameForm({ username: e.target.value })}
                  className="flex-1 outline-none text-gray-800"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            <button
              onClick={handleUpdateUsername}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{isSaving ? "Saving..." : "Update Username"}</span>
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Lock className="text-green-600" size={24} />
            Change Password
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                <Lock size={20} className="text-gray-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="flex-1 outline-none text-gray-800"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                <Lock size={20} className="text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="flex-1 outline-none text-gray-800"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
                <Lock size={20} className="text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="flex-1 outline-none text-gray-800"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleUpdatePassword}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{isSaving ? "Saving..." : "Update Password"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}