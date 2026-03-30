import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, collection, query, orderBy, onSnapshot, doc, getDoc, signInWithPopup, googleProvider, setDoc, serverTimestamp, handleFirestoreError, OperationType } from './lib/firebase';
import { User, Blog } from './types';
import Navbar from './components/Navbar';
import BlogCard from './components/BlogCard';
import BlogEditor from './components/BlogEditor';
import BlogDetail from './components/BlogDetail';
import UserProfile from './components/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';
import { CATEGORIES } from './constants/categories';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, TrendingUp, Sparkles, Filter, PlusCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Fallback if doc doesn't exist yet (handled in Navbar login)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous',
            photoURL: firebaseUser.photoURL,
            role: 'user',
            createdAt: new Date()
          });
        }
      } else {
        setUser(null);
      }
    });

    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribeBlogs = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Blog[];
      setBlogs(blogsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'blogs');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeBlogs();
    };
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    // If showing drafts, only show user's drafts
    if (showDrafts) {
      return blog.isDraft && blog.authorId === user?.uid;
    }
    
    // Otherwise, show only non-drafts
    if (blog.isDraft) return false;

    // Apply category filter
    if (activeCategory) {
      return blog.category.toLowerCase() === activeCategory.toLowerCase();
    }

    return true;
  });

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: 'user',
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      setSelectedBlog(null);
      setActiveCategory(null);
      setShowDrafts(false);
    } else if (page === 'editor') {
      if (user) {
        setIsEditorOpen(true);
      } else {
        handleLogin();
      }
    } else if (page === 'profile') {
      if (user) {
        setIsProfileOpen(true);
      } else {
        handleLogin();
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
        <Navbar user={user} onNavigate={handleNavigate} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">
            {selectedBlog ? (
              <BlogDetail 
                key="detail"
                blog={selectedBlog} 
                user={user} 
                onBack={() => setSelectedBlog(null)} 
              />
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* Hero Section */}
                {!activeCategory && (
                  <div className="space-y-12">
                    <div className="relative rounded-[40px] bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 p-12 overflow-hidden">
                      <div className="relative z-10 max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest">
                          <Sparkles className="w-4 h-4" />
                          Explore the Future
                        </div>
                        <h1 className="text-6xl font-bold text-white leading-tight">
                          The Pulse of <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            Modern Technology
                          </span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                          Join a community of developers, engineers, and tech enthusiasts sharing insights on AI, Cloud, DevOps, and beyond.
                        </p>
                        <div className="pt-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => user ? setIsEditorOpen(true) : handleNavigate('editor')}
                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
                          >
                            <PlusCircle className="w-5 h-5" />
                            Start Writing Today
                          </motion.button>
                        </div>
                      </div>
                      <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('https://picsum.photos/seed/tech/800/600')] bg-cover bg-center opacity-20 mask-gradient" />
                    </div>

                    {blogs.length > 0 && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-yellow-500" />
                          Featured Article
                        </h2>
                        <div 
                          onClick={() => setSelectedBlog(blogs[0])}
                          className="group cursor-pointer relative rounded-[40px] bg-white border border-gray-100 p-8 flex flex-col md:flex-row gap-8 hover:shadow-2xl transition-all"
                        >
                          <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                {blogs[0].category}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500 font-medium">
                                {blogs[0].subcategory}
                              </span>
                            </div>
                            <h3 className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {blogs[0].title}
                            </h3>
                            <p className="text-gray-600 text-lg line-clamp-3">
                              {blogs[0].excerpt}
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                              <img 
                                src={blogs[0].authorPhoto || ''} 
                                alt={blogs[0].authorName} 
                                className="w-10 h-10 rounded-full bg-gray-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{blogs[0].authorName}</p>
                                <p className="text-xs text-gray-400">Author</p>
                              </div>
                            </div>
                          </div>
                          <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-3xl bg-gray-100 overflow-hidden">
                            <img 
                              src={`https://picsum.photos/seed/${blogs[0].id}/600/600`} 
                              alt="Featured" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories Bar */}
                <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                  <button
                    onClick={() => {
                      setActiveCategory(null);
                      setShowDrafts(false);
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                      !activeCategory && !showDrafts
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" /> All Posts
                  </button>

                  {user && (
                    <button
                      onClick={() => {
                        setActiveCategory(null);
                        setShowDrafts(true);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                        showDrafts
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' 
                          : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" /> My Drafts
                    </button>
                  )}

                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.name);
                        setShowDrafts(false);
                      }}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                        activeCategory === cat.name 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Blog Grid */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      {showDrafts ? (
                        <>
                          <PlusCircle className="w-6 h-6 text-amber-600" />
                          My Drafts
                        </>
                      ) : activeCategory ? (
                        <>
                          <Filter className="w-6 h-6 text-blue-600" />
                          {activeCategory} Articles
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                          Latest Insights
                        </>
                      )}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">{filteredBlogs.length} articles found</p>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[400px] bg-gray-100 rounded-3xl animate-pulse" />
                      ))}
                    </div>
                  ) : filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredBlogs.map(blog => (
                        <BlogCard 
                          key={blog.id} 
                          blog={blog} 
                          onClick={setSelectedBlog} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">No articles yet</h3>
                      <p className="text-gray-500 text-sm mt-2">Be the first to share your knowledge in this category!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {isEditorOpen && user && (
            <BlogEditor 
              user={user} 
              onClose={() => setIsEditorOpen(false)} 
              onSuccess={() => {
                setIsEditorOpen(false);
                // Refresh is handled by onSnapshot
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProfileOpen && user && (
            <UserProfile 
              user={user} 
              onClose={() => setIsProfileOpen(false)} 
            />
          )}
        </AnimatePresence>

        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TechPulse
            </p>
            <p className="text-gray-400 text-sm">
              © 2026 TechPulse Blog. Built with AI Studio and Firebase.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
