/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PortfolioView from './pages/PortfolioView';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), uid: firebaseUser.uid } as UserProfile);
        } else {
          // New user might still need profile creation, 
          // but we keep minimal state here
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Anonymous',
            role: 'user',
            createdAt: new Date()
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505]">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1, 0.98] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-2xl font-light tracking-[0.5em] text-cyan-400 cyber-glow"
        >
          UNIVERSALHUB
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] font-sans text-gray-100 selection:bg-cyan-500/30">
        <Navbar user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
              <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="/portfolio/:userId" element={<PortfolioView />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}
