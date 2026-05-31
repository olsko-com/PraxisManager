'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#003527] text-zinc-300 py-16 px-6 lg:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <Leaf className="h-6 w-6 fill-current text-[#D1DCDB] rotate-[-15deg]" />
              <span className="font-sans font-bold text-2xl tracking-tight text-white">
                Dáhon
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Streamline your workflow, boost table turnover, and grow smarter with data.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-[#003527] transition-all duration-300"
                href="#"
                aria-label="Website"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </a>
              <a
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-[#003527] transition-all duration-300"
                href="#"
                aria-label="Share"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h6 style={{ color: '#ffffff' }} className="font-sans font-bold text-sm tracking-wider uppercase mb-6">
              Product
            </h6>
            <ul className="space-y-3">
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="/#features">
                  About Us
                </a>
              </li>
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="/pricing">
                  Pricing
                </a>
              </li>
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="/onboarding">
                  Kitchen Display
                </a>
              </li>
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="/blog">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h6 style={{ color: '#ffffff' }} className="font-sans font-bold text-sm tracking-wider uppercase mb-6">
              Legal
            </h6>
            <ul className="space-y-3">
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="text-sm text-zinc-400 hover:text-white transition-colors font-sans" href="#">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter signup */}
          <div>
            <h6 style={{ color: '#ffffff' }} className="font-sans font-bold text-sm tracking-wider uppercase mb-6">
              Newsletter
            </h6>
            <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">
              Get the latest dining tech news delivered weekly.
            </p>
            <div className="flex border border-zinc-800 bg-white/5 rounded-xl overflow-hidden focus-within:border-zinc-650 transition-colors">
              <input
                className="bg-transparent border-0 text-white placeholder:text-zinc-500 flex-grow px-4 py-3 text-sm font-sans focus:outline-none focus:ring-0"
                placeholder="Your email"
                type="email"
              />
              <button className="bg-white text-[#003527] px-5 py-3 text-xs font-bold font-sans cursor-pointer hover:bg-zinc-100 transition-colors shrink-0">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-sans">
          <p>© {new Date().getFullYear()} Dáhon Systems. All rights reserved.</p>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
