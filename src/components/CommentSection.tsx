import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { Comment, User } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommentSectionProps {
  blogId: string;
  user: User | null;
}

export default function CommentSection({ blogId, user }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'blogs', blogId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `blogs/${blogId}/comments`);
    });

    return () => unsubscribe();
  }, [blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'blogs', blogId, 'comments'), {
        blogId,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `blogs/${blogId}/comments`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
          />
          <button
            disabled={isSubmitting || !newComment.trim()}
            className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="p-6 bg-blue-50 rounded-2xl text-center">
          <p className="text-sm text-blue-600 font-medium">Please login to join the conversation.</p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-4"
            >
              <img
                src={comment.authorPhoto || ''}
                alt={comment.authorName}
                className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900">{comment.authorName}</p>
                    <p className="text-[10px] text-gray-400">
                      {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
