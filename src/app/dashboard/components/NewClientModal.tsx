'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

export default function NewClientModal() {
  const {
    isNewClientModalOpen,
    setIsNewClientModalOpen,
    newClientName,
    setNewClientName,
    newClientBirthday,
    setNewClientBirthday,
    newClientEmail,
    setNewClientEmail,
    newClientPhone,
    setNewClientPhone,
    newClientEmergency,
    setNewClientEmergency,
    newClientNotes,
    setNewClientNotes,
    handleCreateClient
  } = useDashboard();

  if (!isNewClientModalOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsNewClientModalOpen(false)}
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[170]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[180] p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div>
          <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
            <h3 className="text-lg font-bold text-[#043F2D]">Neuen Patienten anlegen</h3>
            <button 
              onClick={() => setIsNewClientModalOpen(false)}
              className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateClient} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Name, Vorname</label>
              <input
                type="text"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="z.B. Sarah Müller"
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Geburtsdatum</label>
                <input
                  type="date"
                  value={newClientBirthday}
                  onChange={(e) => setNewClientBirthday(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Telefon</label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="z.B. +49 176 1234567"
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">E-Mail Adresse</label>
              <input
                type="email"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                placeholder="z.B. patient@email.de"
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Notfallkontakt</label>
              <input
                type="text"
                value={newClientEmergency}
                onChange={(e) => setNewClientEmergency(e.target.value)}
                placeholder="z.B. Sarah Hoffmann (Ehefrau) - +49 176 7654321"
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Anmerkungen & Vorerkrankungen</label>
              <textarea
                rows={4}
                value={newClientNotes}
                onChange={(e) => setNewClientNotes(e.target.value)}
                placeholder="Chronische LWS-Schmerzen, Schreibtischjob..."
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none resize-none h-24 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Patient speichern
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
