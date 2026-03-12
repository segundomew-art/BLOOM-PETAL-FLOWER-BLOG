/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Instagram, Twitter, Facebook, 
  Droplets, Sun, Sprout, Heart, 
  Plus, Edit2, Trash2, MessageSquare, 
  ChevronRight, Send, User, LayoutDashboard,
  LogOut, MessageCircle, RefreshCw
} from 'lucide-react';
import { Post, Feedback, Comment } from './types';
import { INITIAL_POSTS, INITIAL_FEEDBACK } from './constants';
import { db } from "./firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

// --- Components ---

const Navbar = ({ currentPage, setCurrentPage }: { currentPage: string, setCurrentPage: (p: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'articles', label: 'Article' },
    { id: 'guides', label: 'Care Guides' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'about', label: 'About Me' },
    { id: 'admin', label: 'Admin Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center gap-2"
            onClick={() => setCurrentPage('home')}
          >
            <span className="text-2xl font-serif italic text-emerald-800">Bloom & Petal</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  currentPage === item.id ? 'text-emerald-700' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-500">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-zinc-600 hover:text-emerald-600 hover:bg-zinc-50 rounded-md"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-zinc-50 border-t border-zinc-100 py-12 mt-20">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h3 className="font-serif text-xl italic text-emerald-800 mb-6">Bloom & Petal</h3>
        <div className="flex justify-center space-x-6 mb-8">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors">
          <Instagram size={24} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-sky-500 transition-colors">
          <Twitter size={24} />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 transition-colors">
          <Facebook size={24} />
        </a>
      </div>
      <p className="text-zinc-400 text-sm">© 2024 Bloom & Petal Flower Blog. All rights reserved.</p>
    </div>
  </footer>
);

const PostModal = ({ post, onClose, comments, onAddComment }: { 
  post: Post, 
  onClose: () => void, 
  comments: Comment[],
  onAddComment: (postId: string, text: string) => void
}) => {
  const [comment, setComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddComment(post.id, comment);
    setComment('');
  };

  const postComments = comments.filter(c => c.postId === post.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-12">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-[200px] sm:h-[280px] object-cover rounded-2xl mb-8 shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-medium uppercase tracking-widest text-pink-400 mb-2 block">
              {post.date}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif mb-6 text-zinc-800">{post.title}</h2>
            <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed mb-12">
              {post.content.split('\n').map((p, i) => (
                <p key={i} className="mb-4">{p}</p>
              ))}
            </div>

            <div className="border-t border-pink-100 pt-8">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-pink-400" />
                Reader Thoughts
              </h3>
              
              <div className="space-y-4 mb-8">
                {postComments.length === 0 ? (
                  <p className="text-zinc-400 italic text-sm">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  postComments.map((c) => (
                    <div key={c.id} className="bg-white/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm text-zinc-700">{c.author}</span>
                        <span className="text-[10px] text-zinc-400 uppercase">{c.date}</span>
                      </div>
                      <p className="text-sm text-zinc-600">{c.text}</p>
                      {c.reply && (
                        <div className="mt-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 mb-1">Admin Reply</p>
                          <p className="text-sm text-emerald-700">{c.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-white border border-pink-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <button 
                  type="submit"
                  className="bg-pink-400 text-white p-2 rounded-xl hover:bg-pink-500 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PostCard: React.FC<{ post: Post; onReadMore: (p: Post) => void }> = ({ post, onReadMore }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-xl transition-all"
    >
    <div className="h-40 overflow-hidden relative">
      <img 
        src={post.imageUrl} 
        alt={post.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      {post.featured && (
        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
          Featured
        </div>
      )}
    </div>
    <div className="p-6">
      <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-2 block">
        {post.date}
      </span>
      <h3 className="text-xl font-serif mb-3 text-zinc-800 group-hover:text-emerald-700 transition-colors">
        {post.title}
      </h3>
      <p className="text-zinc-500 text-sm line-clamp-2 mb-6 leading-relaxed">
        {post.shortDescription}
      </p>
      <button 
        onClick={() => onReadMore(post)}
        className="text-xs font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-1 hover:gap-2 transition-all"
      >
        Read More <ChevronRight size={14} />
      </button>
</div>
</motion.div>
  );
};
// --- Pages ---

const HomePage = ({ posts, onReadMore }: { posts: Post[], onReadMore: (p: Post) => void }) => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <section className="text-center mb-20 max-w-2xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl sm:text-6xl font-serif italic mb-6 text-emerald-900"
      >
        Welcome to Bloom & Petal
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-zinc-500 leading-relaxed"
      >
        A sanctuary for flower enthusiasts. Explore the delicate beauty of nature, 
        discover expert care tips, and immerse yourself in the vibrant world of floral wonders.
      </motion.p>
    </section>

    <section>
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-3xl font-serif">Featured Stories</h2>
        <div className="h-[1px] flex-1 bg-zinc-100 mx-8 mb-3 hidden sm:block" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.filter(p => p.featured).map(post => (
          <PostCard key={post.id} post={post} onReadMore={onReadMore} />
        ))}
      </div>
    </section>
  </div>
);

const ArticlesPage = ({ posts, onReadMore }: { posts: Post[], onReadMore: (p: Post) => void }) => (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="mb-12">
      <h1 className="text-4xl font-serif mb-4">The Floral Archive</h1>
      <p className="text-zinc-500">Browse our complete collection of articles and stories.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onReadMore={onReadMore} />
      ))}
    </div>
  </div>
);

const GuidesPage = () => {
  const guides = [
    {
      title: 'Watering Wisdom',
      icon: <Droplets className="text-blue-400" />,
      content: 'Most flowers prefer deep, infrequent watering rather than light daily sprinkles. Water at the base of the plant to keep foliage dry and prevent fungal diseases. Early morning is the best time to water.',
      color: 'bg-blue-50'
    },
    {
      title: 'Sunlight Secrets',
      icon: <Sun className="text-amber-400" />,
      content: 'Understand your flowers light requirements: Full Sun (6+ hours), Partial Shade (3-6 hours), or Full Shade. Watch how shadows move in your garden throughout the day before planting.',
      color: 'bg-amber-50'
    },
    {
      title: 'Soil Success',
      icon: <Sprout className="text-emerald-400" />,
      content: 'Healthy soil is the foundation of beautiful blooms. Use well-draining soil enriched with organic compost. Test your soil pH—most flowers thrive in slightly acidic to neutral soil (pH 6.0-7.0).',
      color: 'bg-emerald-50'
    },
    {
      title: 'Maintenance Magic',
      icon: <Heart className="text-pink-400" />,
      content: 'Deadheading (removing spent blooms) encourages the plant to produce more flowers. Prune regularly to maintain shape and improve air circulation. Mulching helps retain moisture and suppress weeds.',
      color: 'bg-pink-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif mb-4">Care Guides</h1>
        <p className="text-zinc-500 max-w-xl mx-auto">Essential knowledge to help your floral companions thrive and bloom to their fullest potential.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {guides.map((guide, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`${guide.color} p-8 rounded-3xl border border-zinc-100/50`}
          >
            <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              {guide.icon}
            </div>
            <h3 className="text-2xl font-serif mb-4 text-zinc-800">{guide.title}</h3>
            <p className="text-zinc-600 leading-relaxed">{guide.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FeedbackPage = ({ onSubmit }: { onSubmit: (f: Omit<Feedback, 'id' | 'date'>) => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif mb-4">Share Your Thoughts</h1>
        <p className="text-zinc-500">We value your feedback and would love to hear from you.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
          <textarea
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
            placeholder="What's on your mind?"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-800 text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-100"
        >
          {submitted ? 'Message Sent!' : 'Send Feedback'}
        </button>
      </form>
    </div>
  );
};

const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <div className="flex flex-col md:flex-row gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-shrink-0"
      >
        <img 
          src="https://i.imgur.com/0wa5laT.jpg" 
          alt="Profile" 
          className="rounded-full shadow-xl w-48 h-48 object-cover border-4 border-white"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-4xl font-serif mb-6">Hello, I'm Jamelle!</h1>
        <div className="prose prose-zinc text-zinc-600 space-y-4">
          <p>
            Welcome to my little corner of the internet. I've been a passionate gardener and floral 
            enthusiast for over a decade. What started as a small windowsill herb garden has grown 
            into a lifelong obsession with the language of flowers.
          </p>
          <p>
            I created <strong>Bloom & Petal</strong> to share the joy that flowers bring to our lives. 
            Whether it's the first crocus of spring or a perfectly arranged bouquet, I believe 
            flowers have a unique power to heal, inspire, and connect us.
          </p>
          <p>
            My goal is to provide a space where beginners can find approachable care guides and 
            seasoned gardeners can find inspiration for their next floral project.
          </p>
          <div className="pt-6">
            <h4 className="font-serif italic text-emerald-800 text-xl">Let's bloom together.</h4>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const AdminDashboard = ({ 
  posts, setPosts, feedback, setFeedback, comments, setComments
}: { 
  posts: Post[], setPosts: (p: Post[]) => void, 
  feedback: Feedback[], setFeedback: (f: Feedback[]) => void,
  comments: Comment[], setComments: (c: Comment[]) => void
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'feedback' | 'comments'>('posts');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentReplyTo, setCommentReplyTo] = useState<string | null>(null);
  const [commentReplyText, setCommentReplyText] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {

      push(ref(db, "admin_logins"), {
      admin: "Jamelle",
      role: "admin",
      action: "login",
      time: new Date().toISOString()
    });
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleResetData = () => {
    if (confirm('This will delete all your custom posts and comments and reset to the original code data. Continue?')) {
      localStorage.removeItem('flower_posts');
      localStorage.removeItem('flower_feedback');
      localStorage.removeItem('flower_comments');
      window.location.reload();
    }
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const postRef = ref(db, "posts/" + id);
      remove(postRef);
    }
  };

  const handleDeleteFeedback = (id: string) => {
    if (confirm('Delete this feedback?')) {
      const updated = feedback.filter(f => f.id !== id);
      setFeedback(updated);
    }
  };

  const handleDeleteComment = (id: string) => {
    if (confirm('Delete this comment?')) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  const handleSavePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const postData = {
      title: formData.get('title') as string,
      shortDescription: formData.get('shortDescription') as string,
      content: formData.get('content') as string,
      imageUrl: formData.get('imageUrl') as string,
      featured: formData.get('featured') === 'on',
    };

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p));
    } else {
      const newPost: Post = {
        id: Date.now().toString(),
        ...postData,
        date: new Date().toISOString().split('T')[0],
      };
      const postsRef = ref(db, "posts");
      const newPostRef = push(postsRef);
      set(newPostRef, newPost);
    }
    setEditingPost(null);
    setIsAdding(false);
  };

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    setFeedback(feedback.map(f => f.id === id ? { ...f, reply: replyText } : f));
    setReplyingTo(null);
    setReplyText('');
  };

  const handleCommentReply = (id: string) => {
    if (!commentReplyText.trim()) return;
    setComments(comments.map(c => c.id === id ? { ...c, reply: commentReplyText } : c));
    setCommentReplyTo(null);
    setCommentReplyText('');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm text-center">
          <LayoutDashboard size={48} className="mx-auto text-emerald-800 mb-6" />
          <h1 className="text-2xl font-serif mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (admin123)"
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              className="w-full bg-emerald-800 text-white font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-emerald-900 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-serif">Admin Dashboard</h1>
            <div className="flex gap-1">
              <button 
                onClick={handleResetData}
                className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Reset to original code data"
              >
                <RefreshCw size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
          <p className="text-zinc-500">Manage your blog content and reader interactions.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl overflow-x-auto">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'posts' ? 'bg-white shadow-sm text-emerald-700' : 'text-zinc-500'}`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'feedback' ? 'bg-white shadow-sm text-emerald-700' : 'text-zinc-500'}`}
          >
            Feedback
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'comments' ? 'bg-white shadow-sm text-emerald-700' : 'text-zinc-500'}`}
          >
            Comments
          </button>
        </div>
      </div>

      {activeTab === 'posts' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif">Manage Posts</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-900 transition-colors"
            >
              <Plus size={18} /> New Post
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center gap-4">
                <img src={post.imageUrl} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-zinc-800 truncate">{post.title}</h4>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">{post.date} • {post.featured ? 'Featured' : 'Standard'}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingPost(post)}
                    className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div>
          <h2 className="text-2xl font-serif mb-8">Reader Feedback</h2>
          <div className="grid grid-cols-1 gap-6">
            {feedback.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <MessageSquare className="mx-auto text-zinc-300 mb-4" size={48} />
                <p className="text-zinc-500">No feedback messages yet.</p>
              </div>
            ) : (
              feedback.map(f => (
                <div key={f.id} className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-zinc-800">{f.name}</h4>
                      <p className="text-sm text-emerald-600">{f.email}</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{f.date}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteFeedback(f.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-zinc-600 text-sm bg-zinc-50 p-4 rounded-xl italic">"{f.message}"</p>
                  
                  {f.reply && (
                    <div className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 mb-1">Admin Reply</p>
                      <p className="text-sm text-emerald-700">{f.reply}</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    {replyingTo === f.id ? (
                      <div className="w-full flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                        <button 
                          onClick={() => handleReply(f.id)}
                          className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase"
                        >
                          Send
                        </button>
                        <button 
                          onClick={() => setReplyingTo(null)}
                          className="text-zinc-400 px-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReplyingTo(f.id)}
                        className="text-xs font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-1 hover:text-emerald-600"
                      >
                        {f.reply ? 'Update Reply' : 'Reply'} <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div>
          <h2 className="text-2xl font-serif mb-8">Article Comments</h2>
          <div className="grid grid-cols-1 gap-6">
            {comments.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <MessageCircle className="mx-auto text-zinc-300 mb-4" size={48} />
                <p className="text-zinc-500">No comments yet.</p>
              </div>
            ) : (
              comments.map(c => {
                const post = posts.find(p => p.id === c.postId);
                return (
                  <div key={c.id} className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-zinc-800">{c.author}</h4>
                        <p className="text-xs text-emerald-600">On: {post?.title || 'Unknown Post'}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{c.date}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-zinc-600 text-sm bg-zinc-50 p-4 rounded-xl italic">"{c.text}"</p>
                    
                    {c.reply && (
                      <div className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 mb-1">Admin Reply</p>
                        <p className="text-sm text-emerald-700">{c.reply}</p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      {commentReplyTo === c.id ? (
                        <div className="w-full flex gap-2">
                          <input
                            type="text"
                            value={commentReplyText}
                            onChange={(e) => setCommentReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                          />
                          <button 
                            onClick={() => handleCommentReply(c.id)}
                            className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase"
                          >
                            Send
                          </button>
                          <button 
                            onClick={() => setCommentReplyTo(null)}
                            className="text-zinc-400 px-2"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setCommentReplyTo(c.id)}
                          className="text-xs font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-1 hover:text-emerald-600"
                        >
                          {c.reply ? 'Update Reply' : 'Reply'} <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Post Editor Modal */}
      <AnimatePresence>
        {(editingPost || isAdding) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setEditingPost(null); setIsAdding(false); }} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-xl font-serif">{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
                <button onClick={() => { setEditingPost(null); setIsAdding(false); }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSavePost} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Title</label>
                  <input name="title" defaultValue={editingPost?.title} required className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Image URL</label>
                  <input name="imageUrl" defaultValue={editingPost?.imageUrl} required className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Short Description</label>
                  <textarea name="shortDescription" defaultValue={editingPost?.shortDescription} required rows={2} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Full Content</label>
                  <textarea name="content" defaultValue={editingPost?.content} required rows={6} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="featured" id="featured" defaultChecked={editingPost?.featured} className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="featured" className="text-sm text-zinc-600">Mark as Featured</label>
                </div>
                <button type="submit" className="w-full bg-emerald-800 text-white font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-emerald-900 transition-colors">
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('flower_posts');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : INITIAL_POSTS;
    }
    return INITIAL_POSTS;
  });
  useEffect(() => {
  const postsRef = ref(db, "posts");

  onValue(postsRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const postsArray = Object.entries(data as Record<string, Post>).map(([id, value]) => ({
  id: id,
  ...(value as Omit<Post, "id">)
}));

setPosts(postsArray);
    }
  });
}, []);
  const [feedback, setFeedback] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem('flower_feedback');
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
  });
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('flower_comments');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    localStorage.setItem('flower_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('flower_feedback', JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem('flower_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
  const commentsRef = ref(db, "comments");

  onValue(commentsRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const commentsArray = Object.values(data);
      setComments(commentsArray as Comment[]);
    }
  });
}, []);

  const handleFeedbackSubmit = (f: Omit<Feedback, 'id' | 'date'>) => {
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      ...f,
      date: new Date().toISOString().split('T')[0],
    };
    push(ref(db, "feedback"), newFeedback);

    setFeedback([newFeedback, ...feedback]);
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      postId,
      author: 'Guest Reader',
      text,
      date: new Date().toISOString().split('T')[0],
    };
    const commentsRef = ref(db, "comments");
    const newCommentRef = push(commentsRef);
    set(newCommentRef, newComment);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage posts={posts} onReadMore={setSelectedPost} />;
      case 'articles': return <ArticlesPage posts={posts} onReadMore={setSelectedPost} />;
      case 'guides': return <GuidesPage />;
      case 'feedback': return <FeedbackPage onSubmit={handleFeedbackSubmit} />;
      case 'about': return <AboutPage />;
      case 'admin': return <AdminDashboard posts={posts} setPosts={setPosts} feedback={feedback} setFeedback={setFeedback} comments={comments} setComments={setComments} />;
      default: return <HomePage posts={posts} onReadMore={setSelectedPost} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedPost && (
          <PostModal 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            comments={comments}
            onAddComment={handleAddComment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
