import React from 'react';
import { Blog } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogCardProps {
  blog: Blog;
  onClick: (blog: Blog) => void;
}

export default function BlogCard({ blog, onClick }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
      onClick={() => onClick(blog)}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {blog.isDraft && (
            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full uppercase tracking-wider">
              Draft
            </span>
          )}
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
            {blog.category}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-medium">
            {blog.subcategory}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {blog.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <img 
              src={blog.authorPhoto || ''} 
              alt={blog.authorName} 
              className="w-8 h-8 rounded-full bg-gray-100"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-xs font-bold text-gray-900">{blog.authorName}</p>
              <p className="text-[10px] text-gray-400">
                {blog.createdAt?.toDate ? formatDistanceToNow(blog.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">{blog.likesCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">0</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
