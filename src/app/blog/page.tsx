'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { blogPosts } from '@/lib/blog-data';
import { BookOpen, Clock, Calendar, ArrowRight, User } from 'lucide-react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const categories = ['Alle', 'Ratgeber', 'Marketing', 'Rechtliches'];

  const filteredPosts = selectedCategory === 'Alle'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#D1DCDB] text-[#003527] flex flex-col selection:bg-emerald-500/20 selection:text-[#003527]">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 bg-[#f9f9f8] text-[#191c1c]">
        {/* Blog Header Hero */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16 mt-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 bg-[#003527]/10 text-[#003527] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#003527]/10 select-none">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Dáhon Journal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold font-sans text-[#003527] tracking-tight leading-none mb-6">
              Wissen für deinen Gastro-Erfolg.
            </h1>
            <p className="text-base text-[#404944] max-w-2xl font-sans leading-relaxed">
              Praxisnahe Tipps, rechtliche Updates und innovative Marketing-Ideen für dein Restaurant, Café oder Bistro.
            </p>
          </div>
        </div>

        {/* Category Tabs Selector */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 flex justify-center">
          <div className="flex flex-wrap gap-2 p-1.5 bg-[#f3f4f3] rounded-2xl border border-[#bfc9c3]/30">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-btn-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#003527] text-white'
                      : 'text-[#003527]/70 hover:text-[#003527] hover:bg-[#e4e9e8]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPosts.map(post => (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  key={post.slug}
                  id={`blog-card-${post.slug}`}
                  className="bg-white border border-[#bfc9c3]/40 rounded-[2rem] overflow-hidden flex flex-col justify-between hover:border-[#003527]/30 transition-colors group"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative h-56 w-full bg-zinc-150 overflow-hidden">
                      <Image 
                        src={post.coverImage} 
                        alt={post.title} 
                        fill 
                        sizes="(max-w-768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-102 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md text-[#003527] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 select-none">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-7">
                      <div className="flex items-center gap-4 text-[10px] font-bold text-[#404944] uppercase tracking-wider mb-3.5 select-none">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                      </div>
                      
                      <h2 className="text-xl font-bold font-sans text-[#003527] leading-snug tracking-tight mb-3 group-hover:text-[#0b513d] transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-xs text-[#404944] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-7 pb-7 pt-4 border-t border-[#bfc9c3]/20 flex items-center justify-between mt-auto">
                    {/* Author Details */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                        <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col select-none">
                        <span className="text-xs font-bold text-[#003527] leading-none">{post.author.name}</span>
                        <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">{post.author.role}</span>
                      </div>
                    </div>

                    {/* Arrow Action Link */}
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="p-2 bg-[#f3f4f3] group-hover:bg-[#003527] group-hover:text-white rounded-full transition-all flex items-center justify-center border border-[#bfc9c3]/30 group-hover:border-transparent active:scale-95"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
