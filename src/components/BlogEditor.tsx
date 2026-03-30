import React, { useState } from 'react';
import { User, Blog } from '../types';
import { CATEGORIES } from '../constants/categories';
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { X, Send, Image as ImageIcon, Type, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogEditorProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BlogEditor({ user, onClose, onSuccess }: BlogEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [subcategory, setSubcategory] = useState(CATEGORIES[0].subcategories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const selectedCategory = CATEGORIES.find(c => c.id === category);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    if (!title || !content) return;

    if (isDraft) setIsDrafting(true);
    else setIsSubmitting(true);

    try {
      const excerpt = content.slice(0, 150).replace(/[#*`]/g, '') + '...';
      await addDoc(collection(db, 'blogs'), {
        title,
        content,
        excerpt,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        category: selectedCategory?.name || category,
        subcategory,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        viewsCount: 0,
        isDraft
      });
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'blogs');
    } finally {
      setIsSubmitting(false);
      setIsDrafting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
            <p className="text-sm text-gray-500">Share your technical knowledge with the community</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Layout className="w-4 h-4" /> Category
              </label>
              <select 
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const cat = CATEGORIES.find(c => c.id === e.target.value);
                  if (cat) setSubcategory(cat.subcategories[0]);
                }}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4" /> Subcategory
              </label>
              <select 
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {selectedCategory?.subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title..."
              className="w-full px-0 py-4 text-4xl font-bold border-none focus:ring-0 placeholder:text-gray-200 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Content (Markdown supported)</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your technical masterpiece here..."
              className="w-full min-h-[400px] px-0 py-4 text-lg border-none focus:ring-0 placeholder:text-gray-200 resize-none outline-none leading-relaxed"
              required
            />
          </div>
        </form>

        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-gray-400">
            <button type="button" className="hover:text-blue-600 transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting || isDrafting || !title || !content}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isDrafting ? 'Saving Draft...' : 'Save as Draft'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting || isDrafting || !title || !content}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {isSubmitting ? 'Publishing...' : (
                <>
                  <Send className="w-4 h-4" /> Publish Post
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
