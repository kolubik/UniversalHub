import { useState, useEffect } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ExternalLink, Layers } from 'lucide-react';

export default function Home() {
  const [portfolios, setPortfolios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      const q = query(collection(db, 'users'), limit(20));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      setPortfolios(docs);
      setLoading(false);
    };
    fetchPortfolios();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-16"
    >
      <header className="text-center space-y-4 max-w-2xl mx-auto py-12">
        <h1 className="text-6xl font-light tracking-tight text-white serif italic">
          <span className="cyber-text-gradient">Universal</span> Expertise. <br/>Verified in code.
        </h1>
        <p className="text-gray-400 text-lg font-light leading-relaxed">
          The decentralized-style platform for world-class talent to showcase verified achievements.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolios.map((p, idx) => (
            <motion.div
              key={p.uid}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all duration-500"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <Layers className="w-6 h-6 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <Link 
                    to={`/portfolio/${p.uid}`}
                    className="p-2 bg-white/5 text-gray-400 rounded-full group-hover:bg-cyan-400 group-hover:text-black transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-white group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">{p.bio || 'Architect of Digital Realms'}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {(p.hardSkills?.length ? p.hardSkills : p.stack)?.slice(0, 3).map(skill => (
                      <span key={skill} className="px-3 py-1 bg-white/5 text-[10px] uppercase tracking-widest font-bold text-gray-400 rounded-lg border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
