import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { getInitials, stringToColor } from '@/lib/utils';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { data } = await api.put('/users/profile', profileForm);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setIsUpdatingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploadingAvatar(true);
    try {
      const { data } = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Account Settings</h1>
        <p className="text-dark-400 text-sm">Manage your profile details and security settings.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card / Avatar */}
        <div className="md:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mx-auto mb-4">
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-black text-white overflow-hidden shadow-glow"
                style={{ background: user?.avatar ? undefined : stringToColor(user?.name || '') }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name || '')
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <h3 className="font-semibold text-white text-lg">{user?.name}</h3>
            <p className="text-xs text-dark-400 mb-2">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/25 uppercase">
              {user?.role || 'user'}
            </span>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile details */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" /> Personal Info
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                id="settings-name"
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Textarea
                id="settings-bio"
                label="Biography"
                placeholder="Tell us about yourself..."
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                rows={4}
              />
              <Button type="submit" isLoading={isUpdatingProfile} className="mt-2">
                Save Changes
              </Button>
            </form>
          </div>

          {/* Change password */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" /> Security & Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                id="settings-current-password"
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  id="settings-new-password"
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                />
                <Input
                  id="settings-confirm-password"
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" variant="primary" isLoading={isUpdatingPassword} className="mt-2">
                Update Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
