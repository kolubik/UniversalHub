import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ExternalLink, Layers, X } from 'lucide-react';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolios, setPortfolios] = useState<UserProfile[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      setPortfolios(docs);
      setFilteredPortfolios(docs);
      setLoading(false);
    };
    fetchPortfolios();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = portfolios.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(term);
      const bioMatch = p.bio?.toLowerCase().includes(term);
      const stackMatch = p.stack?.some(s => s.toLowerCase().includes(term));
      const hardSkillMatch = p.hardSkills?.some(s => s.toLowerCase().includes(term));
      const softSkillMatch = p.softSkills?.some(s => s.toLowerCase().includes(term));
      const expMatch = p.experience?.toLowerCase().includes(term);
      return nameMatch || bioMatch || stackMatch || hardSkillMatch || softSkillMatch || expMatch;
    });
    setFilteredPortfolios(filtered);
  }, [searchTerm, portfolios]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      <header className="space-y-8 max-w-2xl py-8">
        <h1 className="text-5xl font-light tracking-tight text-white serif italic">
          Discover <span className="cyber-text-gradient">Nodes</span>
        </h1>
        <div className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text"
            placeholder="Query name, stack, or neural keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-12 py-5 bg-[#0a0a0a] border border-white/5 rounded-2xl focus:ring-4 focus:ring-cyan-400/5 focus:border-cyan-400/50 transition-all shadow-2xl font-light text-lg text-white"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          <p className="text-[10px] text-cyan-400/50 font-bold uppercase tracking-[0.3em] ml-2">
            SCAN COMPLETE: {filteredPortfolios.length} MATCHING ENTITIES
          </p>
          
          {filteredPortfolios.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
              <p className="text-gray-500 italic font-light">No direct matches found in current sector.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredPortfolios.map((p, idx) => (
                  <motion.div
                    key={p.uid}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] hover:border-cyan-400/30 hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                          <Layers className="w-6 h-6 text-cyan-400/40" />
                        </div>
                        <Link 
                          to={`/portfolio/${p.uid}`}
                          className="p-2 bg-white/5 text-gray-500 rounded-full group-hover:bg-cyan-400 group-hover:text-black transition-all duration-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-medium text-white group-hover:text-cyan-400 transition-colors tracking-tight">{p.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem] font-light">{p.bio || 'Interface Architect'}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {(p.hardSkills?.length ? p.hardSkills : p.stack)?.slice(0, 3).map(skill => (
                            <button
                              key={skill}
                              onClick={(e) => {
                                e.preventDefault();
                                setSearchTerm(skill);
                              }}
                              className="px-3 py-1 bg-white/5 text-[10px] uppercase tracking-widest font-bold text-gray-500 rounded-lg border border-white/5 hover:border-cyan-400 hover:text-white transition-all shadow-sm"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
