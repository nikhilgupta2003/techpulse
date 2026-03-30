import React from 'react';
import { Blog, User } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Heart, MessageSquare, Share2, Calendar, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import CommentSection from './CommentSection';

interface BlogDetailProps {
  blog: Blog;
  user: User | null;
  onBack: () => void;
}

export default function BlogDetail({ blog, user, onBack }: BlogDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Feed
      </button>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {blog.category}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-medium">
              {blog.subcategory}
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            {blog.title}
          </h1>
        </div>

        <div className="flex items-center justify-between py-8 border-y border-gray-100">
          <div className="flex items-center gap-4">
            <img 
              src={blog.authorPhoto || ''} 
              alt={blog.authorName} 
              className="w-12 h-12 rounded-full bg-gray-100"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">{blog.authorName}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {blog.createdAt?.toDate ? formatDistanceToNow(blog.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {blog.likesCount || 0} Likes
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-gray-50 rounded-full text-gray-400 hover:text-blue-500 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="prose prose-lg max-w-none prose-blue prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed py-12">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>

        <div className="pt-12 border-t border-gray-100">
          <CommentSection blogId={blog.id} user={user} />
        </div>
      </div>
    </motion.div>
  );
}
