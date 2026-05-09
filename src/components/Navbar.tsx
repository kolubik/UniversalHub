import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { Briefcase, User, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-medium tracking-tighter text-white flex items-center gap-2 group">
              <Briefcase className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="group-hover:text-cyan-400 transition-colors uppercase tracking-widest text-sm">UNIVERSALHUB</span>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-sm font-medium text-gray-400 hover:text-cyan-400 transition-colors">
              Search
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    MODERATE
                  </Link>
                )}
                <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1">
                  <User className="w-4 h-4" />
                  DASHBOARD
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  EXIT
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all">
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
