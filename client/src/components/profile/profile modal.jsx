import React, { useState, useRef } from 'react';
import { 
  X, Camera, User, Mail, Sparkles, Check, 
  Loader2, Shield, Edit3, Crown 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMockAuth } from '../../context/AuthContext';
import api from '../../config/api';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useMockAuth();
  
  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [nickname, setNickname] = useState(user?.nickname || user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.url) {
        setImageUrl(res.data.url);
        toast.success("Profile photo uploaded to Cloudinary! 📸");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload photo to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        nickname: nickname.trim() || fullName.trim(),
        imageUrl,
        bio: bio.trim()
      });

      toast.success("Profile updated successfully! ✨");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Card */}
      <div className="bg-white rounded-4xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-blue-50/50 via-white to-indigo-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0055ff]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">User Profile Settings</h3>
              <p className="text-xs text-slate-500">Manage your avatar and personal information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                {imageUrl ? (
                  <img src={imageUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(fullName)}</span>
                )}
              </div>

              {/* Upload Overlay Badge */}
              <div className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>

              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-slate-900/60 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
                accept="image/png,image/jpeg,image/webp,image/jpg"
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#0055ff] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{imageUrl ? "Change Photo (Cloudinary)" : "Upload Photo (Cloudinary)"}</span>
              </button>
              <p className="text-[10px] text-slate-400">JPG, PNG or WEBP up to 5MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* Meeting Nickname */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Meeting Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Name shown on video tiles"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100/70 border border-slate-200/70 text-xs text-slate-500 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user?.email || 'user@example.com'}</span>
              </div>
            </div>

            {/* Plan Badge */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Current Plan: {user?.plan || 'Free'}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                Active
              </span>
            </div>

          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 bg-[#0055ff] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
