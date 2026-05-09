import { useState, useEffect } from 'react';
import React from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Certificate, UserProfile } from '../types';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle, XCircle, Trash2, User, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [pendingCerts, setPendingCerts] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const certsQ = query(collection(db, 'certificates'), where('status', '==', 'pending'));
    const certsSnap = await getDocs(certsQ);
    setPendingCerts(certsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Certificate)));

    const usersSnap = await getDocs(collection(db, 'users'));
    setUsers(usersSnap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
    
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: 'verified' | 'rejected') => {
    await updateDoc(doc(db, 'certificates', id), { status });
    fetchData();
  };

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this profile? All associated data will be orphaned or must be manually cleaned.')) return;
    await deleteDoc(doc(db, 'users', uid));
    fetchData();
  };

  const handleDeleteCert = async (id: string) => {
    if (!window.confirm('Delete this certificate?')) return;
    await deleteDoc(doc(db, 'certificates', id));
    fetchData();
  };

  if (loading) return <div className="text-center py-24 text-gray-600 font-bold tracking-[0.5em] uppercase animate-pulse">Loading Authority Protocols...</div>;

  return (
    <div className="space-y-16">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-amber-500/20 cyber-glow">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white serif italic">Moderation <span className="cyber-text-gradient">Suite</span></h1>
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">Reviewing {pendingCerts.length} active verification requests</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Pending Certificates */}
        <section className="space-y-6">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.4em] text-cyan-400 ml-2">Verification Queue</h2>
          <div className="space-y-4">
            {pendingCerts.length === 0 ? (
              <div className="bg-cyan-400/5 p-16 rounded-[3rem] text-center border border-cyan-400/10 shadow-2xl">
                <CheckCircle className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                <p className="text-white font-bold uppercase tracking-widest text-sm">Clear Horizon</p>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-2">All protocols verified.</p>
              </div>
            ) : pendingCerts.map(cert => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={cert.id} 
                className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl hover:border-cyan-400/30 transition-all group"
              >
                <div className="space-y-2">
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm">{cert.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Initiated by {cert.userName || 'Unknown Entity'}</p>
                  <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-4 hover:text-white transition-colors">
                    Access Resource <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleStatusChange(cert.id, 'verified')}
                    className="p-4 bg-cyan-400/10 text-cyan-400 rounded-2xl hover:bg-cyan-400 hover:text-black transition-all border border-cyan-400/20"
                    title="Initialize Verification"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(cert.id, 'rejected')}
                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                    title="Terminate Protocol"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* User Management */}
        <section className="space-y-6">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500 ml-2">Entity Directory</h2>
          <div className="space-y-3">
            {users.map(u => (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={u.uid} 
                className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-cyan-400/30 transition-all">
                    <User className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">{u.name}</h4>
                    <p className="text-[10px] text-cyan-400/50 font-bold uppercase tracking-[0.2em]">{u.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <Link to={`/portfolio/${u.uid}`} className="p-2 bg-white/5 text-gray-500 rounded-lg hover:bg-cyan-400 hover:text-black transition-all">
                    <ExternalLink className="w-4 h-4" />
                   </Link>
                   {u.role !== 'admin' && (
                     <button 
                       onClick={() => handleDeleteUser(u.uid)}
                       className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                     >
                      <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
