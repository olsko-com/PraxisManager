'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

interface Action {
  id: string;
  title: string;
  icon: React.ElementType;
  onSelect: () => void;
}

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  actions: Action[];
}

export default function CommandPalette({ isOpen, setIsOpen, actions }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredActions = actions.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Max 8 results

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter' && filteredActions.length > 0) {
        e.preventDefault();
        filteredActions[activeIndex].onSelect();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, activeIndex, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#043F2D]/40 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-[#f9f9f8] rounded-[2rem] shadow-none border border-[#bfc9c3]/50 overflow-hidden relative z-10 flex flex-col"
          >
            <div className="flex items-center px-6 py-4 border-b border-[#bfc9c3]/30 bg-white">
              <Search className="h-6 w-6 text-[#003527]/40 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Was möchtest du tun? (z.B. 'Klient anlegen' oder 'Rechnung')"
                className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-[#003527] placeholder:text-[#003527]/30"
              />
              <span className="text-[10px] font-mono text-[#003527]/40 bg-[#f3f4f3] px-2 py-1 rounded">ESC</span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <div className="py-12 text-center text-[#003527]/50 font-medium">
                  Keine Befehle gefunden.
                </div>
              ) : (
                filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.onSelect();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors cursor-pointer text-left ${
                        isActive 
                          ? 'bg-[#003527] text-white' 
                          : 'text-[#043F2D] hover:bg-[#D1DCDB]/50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#003527]/60'}`} />
                      <span className="font-bold">{action.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
