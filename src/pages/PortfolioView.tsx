import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Certificate } from '../types';
import { motion } from 'motion/react';
import { BadgeCheck, ExternalLink, Calendar, Building2, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PortfolioView() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile({ ...userSnap.data(), uid: userSnap.id } as UserProfile);
      }

      const certsQuery = query(
        collection(db, 'certificates'), 
        where('userId', '==', userId),
        where('status', '==', 'verified')
      );
      const certsSnap = await getDocs(certsQuery);
      setCerts(certsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Certificate)));
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) return <div className="text-center py-24 text-gray-300 font-light italic">Loading Portfolio...</div>;
  if (!profile) return <div className="text-center py-24 text-gray-500 font-medium">Portfolio Not Found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-24 pb-24"
    >
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mx-auto border border-white/10 cyber-glow">
          <UserCircle className="w-16 h-16 text-cyan-400/30" />
        </div>
        <div className="space-y-4">
          <h1 className="text-7xl font-light tracking-tight text-white serif italic">
            <span className="cyber-text-gradient">{profile.name}</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-xl mx-auto italic leading-relaxed">
            {profile.bio || "Exploring the convergence of data, logic, and aesthetic excellence."}
          </p>
        </div>
        
        <div className="flex flex-col gap-10 items-center">
          {((profile.hardSkills?.length || 0) > 0 || (profile.stack?.length || 0) > 0) && (
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500">Neural Core Skills</label>
              <div className="flex flex-wrap justify-center gap-3">
                {(profile.hardSkills?.length ? profile.hardSkills : profile.stack)?.map(skill => (
                  <span key={skill} className="px-6 py-2.5 bg-[#0a0a0a] text-white text-[11px] uppercase tracking-widest font-bold rounded-xl border border-white/10 hover:border-cyan-400 transition-colors shadow-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(profile.softSkills?.length || 0) > 0 && (
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500">Human Interface</label>
              <div className="flex flex-wrap justify-center gap-3">
                {profile.softSkills.map(skill => (
                  <span key={skill} className="px-6 py-2.5 bg-white/5 text-[11px] uppercase tracking-widest font-bold text-gray-400 rounded-xl border border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Experience / Detailed Bio */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start h-minimal">
        <div className="space-y-6">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.3em] text-cyan-400">System Logs</h2>
          <p className="text-gray-300 font-light leading-relaxed text-lg whitespace-pre-wrap selection:bg-cyan-500/50">
            {profile.experience || "The archives are currently incomplete for this narrative cycle."}
          </p>
        </div>
        <div className="bg-[#0a0a0a] p-12 rounded-[3.5rem] space-y-10 border border-white/5">
           <h2 className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-500">Verified Protocol Links</h2>
           <div className="space-y-8">
            {certs.length === 0 ? (
              <p className="text-gray-600 font-light italic text-sm">No external verifications synchronized yet.</p>
            ) : certs.map(cert => (
              <div key={cert.id} className="flex gap-5 items-start group">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-cyan-400 group-hover:border-cyan-400 transition-all">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors tracking-tight">{cert.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {cert.issuer}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {cert.date}</span>
                  </div>
                  <a 
                    href={cert.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400 mt-3 group-hover:gap-3 transition-all"
                  >
                    Access Ledger <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
           </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center pt-32 opacity-30">
        <p className="text-[10px] uppercase tracking-[0.8em] text-gray-400 font-bold">
          UNIVERSALHUB VERIFIED
        </p>
      </footer>
    </motion.div>
  );
}
