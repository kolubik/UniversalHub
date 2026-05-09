import { useState } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'motion/react';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      
      // Create user document
      const role = email === 'kolubakindmitrij@gmail.com' ? 'admin' : 'user';
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        role: role,
        createdAt: new Date(),
        bio: '',
        stack: [],
        experience: ''
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[3.5rem] space-y-10 shadow-2xl"
      >
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/5 cyber-glow">
            <UserPlus className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white serif italic">Request <span className="cyber-text-gradient">Access</span></h1>
          <p className="text-xs text-gray-500 uppercase tracking-[0.3em] font-bold">Initialize New Identity Node</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-4">Entity Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-cyan-400/50 transition-all font-light"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-4">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-cyan-400/50 transition-all font-light"
              placeholder="id@universalhub.net"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-4">Access Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-cyan-400/50 transition-all font-light"
              placeholder="Min 6 characters"
            />
          </div>
          
          {error && (
            <p className="text-rose-500 text-[10px] uppercase tracking-widest font-bold ml-4 animate-pulse">
              [Initialize Error]: {error}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-xl hover:shadow-cyan-400/20 flex items-center justify-center gap-2 group"
          >
            {loading ? 'Creating...' : 'Create Node'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 tracking-widest uppercase font-bold">
          Already verified? <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
