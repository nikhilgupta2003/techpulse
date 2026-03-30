import React, { useState } from 'react';
import { User } from '../types';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, MapPin, Globe, Twitter, Github, Edit2, Save, X, Camera } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    twitter: user.twitter || '',
    github: user.github || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date(),
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="px-8 pb-8 -mt-16">
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <div className="relative group">
              <img 
                src={formData.photoURL || 'https://picsum.photos/seed/user/200/200'} 
                alt={formData.displayName} 
                className="w-32 h-32 rounded-[32px] border-4 border-white bg-gray-100 object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <h2 className="text-3xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
            </div>

            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                isEditing 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditing ? (
                <Save className="w-5 h-5" />
              ) : (
                <Edit2 className="w-5 h-5" />
              )}
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">About Me</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl min-h-[120px]">
                    {user.bio || "No bio yet. Click edit to add one!"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Picture URL</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.photoURL}
                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://example.com/photo.jpg"
                  />
                ) : (
                  <p className="text-gray-500 text-xs truncate bg-gray-50 px-4 py-2 rounded-xl">
                    {user.photoURL || "No custom photo URL"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Details & Social</label>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-transparent border-none text-sm outline-none w-full"
                        placeholder="Location"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{user.location || "Earth"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <Globe className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="bg-transparent border-none text-sm outline-none w-full"
                        placeholder="Website URL"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{user.website || "No website"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <Twitter className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="bg-transparent border-none text-sm outline-none w-full"
                        placeholder="Twitter handle"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{user.twitter || "Not linked"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <Github className="w-5 h-5 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="bg-transparent border-none text-sm outline-none w-full"
                        placeholder="GitHub handle"
                      />
                    ) : (
                      <span className="text-sm text-gray-700">{user.github || "Not linked"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
