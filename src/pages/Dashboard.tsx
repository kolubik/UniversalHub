import { useState, useEffect } from 'react';
import React from 'react';
import { doc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { UserProfile, Certificate } from '../types';
import { motion } from 'motion/react';
import { Edit3, Upload, FileText, CheckCircle2, XCircle, Clock, Trash2, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', issuer: '', date: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [user.uid]);

  const fetchCertificates = async () => {
    const q = query(collection(db, 'certificates'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    setCertificates(snap.docs.map(d => ({ ...d.data(), id: d.id } as Certificate)));
  };

  const [newHardSkill, setNewHardSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: profile.name,
        bio: profile.bio,
        stack: profile.stack,
        hardSkills: profile.hardSkills,
        softSkills: profile.softSkills,
        experience: profile.experience
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const addHardSkill = () => {
    const trimmed = newHardSkill.trim();
    if (trimmed && !profile.hardSkills?.includes(trimmed)) {
      setProfile({ ...profile, hardSkills: [...(profile.hardSkills || []), trimmed] });
      setNewHardSkill('');
    }
  };

  const addSoftSkill = () => {
    const trimmed = newSoftSkill.trim();
    if (trimmed && !profile.softSkills?.includes(trimmed)) {
      setProfile({ ...profile, softSkills: [...(profile.softSkills || []), trimmed] });
      setNewSoftSkill('');
    }
  };

  const removeHardSkill = (skill: string) => {
    setProfile({ ...profile, hardSkills: profile.hardSkills?.filter(s => s !== skill) || [] });
  };

  const removeSoftSkill = (skill: string) => {
    setProfile({ ...profile, softSkills: profile.softSkills?.filter(s => s !== skill) || [] });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `certificates/${user.uid}/${Date.now()}_${file.name}`);
      const uploadSnap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadSnap.ref);

      await addDoc(collection(db, 'certificates'), {
        userId: user.uid,
        userName: user.name,
        title: newCert.title,
        issuer: newCert.issuer,
        date: newCert.date,
        pdfUrl: url,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setNewCert({ title: '', issuer: '', date: '' });
      setFile(null);
      fetchCertificates();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!window.confirm('Delete this certificate?')) return;
    await deleteDoc(doc(db, 'certificates', id));
    fetchCertificates();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Profile Sidebar */}
      <div className="lg:col-span-1 space-y-8">
        <section className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl cyber-glow">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xl font-medium tracking-tight text-white">Identity Hub</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 bg-white/5 rounded-full hover:bg-cyan-400 hover:text-black transition-all"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2">Entity Name</label>
                <input 
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-light text-white outline-none focus:border-cyan-400 transition-all"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2">Interface Bio</label>
                <textarea 
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-light h-24 resize-none text-white outline-none focus:border-cyan-400 transition-all"
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="Short Bio"
                />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2">Neural Core (Hard Skills)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.hardSkills?.map(s => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1 bg-cyan-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg">
                        {s}
                        <button type="button" onClick={() => removeHardSkill(s)} className="hover:text-rose-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-light text-white outline-none focus:border-cyan-400"
                      value={newHardSkill}
                      onChange={e => setNewHardSkill(e.target.value)}
                      onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addHardSkill(); } }}
                      placeholder="e.g. React, Python"
                    />
                    <button 
                      type="button" 
                      onClick={addHardSkill}
                      className="px-4 bg-white/5 text-cyan-400 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2">Human Interface (Soft Skills)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.softSkills?.map(s => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                        {s}
                        <button type="button" onClick={() => removeSoftSkill(s)} className="hover:text-rose-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-light text-white outline-none focus:border-cyan-400"
                      value={newSoftSkill}
                      onChange={e => setNewSoftSkill(e.target.value)}
                      onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); addSoftSkill(); } }}
                      placeholder="e.g. Leadership, Teamwork"
                    />
                    <button 
                      type="button" 
                      onClick={addSoftSkill}
                      className="px-4 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2">System Logs (Experience)</label>
                <textarea 
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-light h-32 resize-none text-white outline-none focus:border-cyan-400 transition-all"
                  value={profile.experience}
                  onChange={e => setProfile({...profile, experience: e.target.value})}
                  placeholder="Detailed background..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-white text-black py-3 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-cyan-400 transition-all shadow-lg hover:shadow-cyan-400/20">
                  Sync Identity
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-3 bg-white/5 text-gray-500 rounded-xl text-xs font-bold tracking-widest uppercase">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-light text-white serif italic"><span className="cyber-text-gradient">{profile.name}</span></h3>
                <p className="text-gray-500 text-xs tracking-widest uppercase font-bold mt-1">{profile.email}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400">Interface Narrative</label>
                <p className="text-gray-400 font-light leading-relaxed italic">"{profile.bio || 'Interface currently silent. Awaiting narrative input.'}"</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Neural Specialization</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.hardSkills?.length ? profile.hardSkills.map(s => (
                      <span key={s} className="px-3 py-1 bg-cyan-400 text-black text-[10px] uppercase tracking-widest font-bold rounded-lg border border-cyan-400/20">
                        {s}
                      </span>
                    )) : (profile.stack?.length ? profile.stack.map(s => (
                      <span key={s} className="px-3 py-1 bg-white/5 text-gray-500 text-[10px] uppercase tracking-widest font-bold rounded-lg border border-white/5">
                        {s}
                      </span>
                    )) : <p className="text-xs text-gray-500 italic">No specializations locked.</p>)}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">Human Connection</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.softSkills?.length ? profile.softSkills.map(s => (
                      <span key={s} className="px-3 py-1 bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg border border-white/5">
                        {s}
                      </span>
                    )) : <p className="text-xs text-gray-500 italic">No human interfaces defined.</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 mb-2 block">Archive Logs</label>
                <p className="text-gray-400 font-light text-sm italic line-clamp-3">{profile.experience || 'Archive incomplete.'}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Certificates Main Content */}
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-light tracking-tight text-white serif italic">Verification <span className="cyber-text-gradient">Protocols</span></h2>
            <div className="p-2 bg-white/5 rounded-full border border-white/5">
              <FileText className="w-5 h-5 text-cyan-400/50" />
            </div>
          </div>

          <form onSubmit={handleUpload} className="bg-white/5 p-8 rounded-3xl space-y-6 mb-12 border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required
                className="px-5 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-light text-white outline-none focus:border-cyan-400 transition-all"
                placeholder="Protocol Title (e.g. AWS Security)"
                value={newCert.title}
                onChange={e => setNewCert({...newCert, title: e.target.value})}
              />
              <input 
                required
                className="px-5 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-light text-white outline-none focus:border-cyan-400 transition-all"
                placeholder="Entity Issuer (e.g. Amazon)"
                value={newCert.issuer}
                onChange={e => setNewCert({...newCert, issuer: e.target.value})}
              />
            </div>
            <div className="flex gap-4 items-center">
              <input 
                type="date"
                required
                className="flex-1 px-5 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm font-light text-white outline-none focus:border-cyan-400 transition-all [color-scheme:dark]"
                value={newCert.date}
                onChange={e => setNewCert({...newCert, date: e.target.value})}
              />
              <label className="flex-1 cursor-pointer group">
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex items-center justify-center gap-2 px-5 py-4 bg-[#050505] border border-white/5 rounded-2xl text-sm text-gray-500 group-hover:border-cyan-400 transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{file ? file.name : 'Select PDF Ledger'}</span>
                </div>
              </label>
            </div>
            <button 
              disabled={uploading || !file}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-lg hover:shadow-cyan-400/20"
            >
              {uploading ? 'Synchronizing...' : 'Initialize Verification'}
            </button>
          </form>

          <div className="space-y-4">
            {certificates.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-gray-600 font-light italic">
                No verified protocols on record.
              </div>
            ) : certificates.map((cert) => (
              <motion.div 
                layout
                key={cert.id}
                className="flex items-center justify-between p-6 bg-[#050505] border border-white/5 rounded-3xl hover:border-cyan-400/30 transition-all group shadow-xl"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5",
                    cert.status === 'verified' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' :
                    cert.status === 'rejected' ? 'bg-rose-400/10 text-rose-400 border-rose-400/20' : 'bg-white/5 text-gray-500'
                  )}>
                    {cert.status === 'verified' ? <CheckCircle2 className="w-6 h-6" /> :
                     cert.status === 'rejected' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-widest">{cert.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{cert.issuer} • {cert.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:text-white transition-colors">
                    Access Ledger
                  </a>
                  {cert.status === 'pending' && (
                    <button 
                      onClick={() => handleDeleteCert(cert.id)}
                      className="p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500 text-rose-500 hover:text-white transition-all"
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
