'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

export default function NewClientModal() {
  const {
    isNewClientModalOpen,
    setIsNewClientModalOpen,
    handleCreateClient
  } = useDashboard();

  // Local form state
  const [salutation, setSalutation] = useState<'Keine' | 'Frau' | 'Herr'>('Keine');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewClientModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsSubmitting(true);
    const success = await handleCreateClient(
      salutation,
      firstName.trim(),
      lastName.trim(),
      birthday,
      email,
      phone,
      '', // emergency contact is blank
      notes,
      address,
      occupation,
      maritalStatus
    );

    setIsSubmitting(false);
    if (success) {
      // Clear form
      setSalutation('Keine');
      setFirstName('');
      setLastName('');
      setBirthday('');
      setPhone('');
      setEmail('');
      setAddress('');
      setOccupation('');
      setMaritalStatus('');
      setNotes('');
      // Close modal
      setIsNewClientModalOpen(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsNewClientModalOpen(false)}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[170]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-zinc-200/50 shadow-none z-[180] flex flex-col overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden text-left bg-white">
          {/* Header */}
          <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-white flex-shrink-0">
            <div className="text-left">
              <h3 className="text-base font-bold text-[#003527]">Patient anlegen</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Erstelle eine neue Patientenakte in deiner Praxis.</p>
            </div>
            <button 
              type="button"
              onClick={() => setIsNewClientModalOpen(false)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-[#003527] transition-all cursor-pointer border-none bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 hide-scrollbar">
            
            {/* SECTION 1: Personal Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Persönliche Daten</h4>
              
              <div className="space-y-4">
                {/* Salutation Selector (Apple-style segmented control) */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-semibold text-zinc-500">Anrede</label>
                  <div className="bg-zinc-100/60 p-0.5 rounded-xl border border-transparent flex relative overflow-hidden">
                    {(['Keine', 'Frau', 'Herr'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSalutation(opt)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors cursor-pointer bg-transparent border-none ${
                          salutation === opt ? 'text-[#003527]' : 'text-zinc-400 hover:text-zinc-500'
                        }`}
                      >
                        {opt === 'Keine' ? 'Keine' : opt}
                        {salutation === opt && (
                          <motion.div
                            layoutId="active-salutation-pill"
                            className="absolute inset-0 bg-white rounded-lg border border-zinc-200/50 z-[-1] shadow-none"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* First Name & Last Name in 1 row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-semibold text-zinc-500">Vorname</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="z.B. Sarah"
                      className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-semibold text-zinc-500">Nachname</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="z.B. Müller"
                      className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                    />
                  </div>
                </div>

                {/* Birthday & Marital Status in 1 row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-semibold text-zinc-500">Geburtstag</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all cursor-pointer text-zinc-400"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-semibold text-zinc-500">Familienstand</label>
                    <input
                      type="text"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      placeholder="z.B. ledig, verheiratet"
                      className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* SECTION 2: Contact Details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Erreichbarkeit & Lebensumstände</h4>
              
              <div className="space-y-4">
                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-semibold text-zinc-500">Telefon</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="z.B. +49 176 1234567"
                      className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-semibold text-zinc-500">E-Mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@beispiel.de"
                      className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                    />
                  </div>
                </div>

                {/* Anschrift */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-semibold text-zinc-500">Anschrift</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Straße, Hausnummer, PLZ & Ort"
                    className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                  />
                </div>

                {/* Derzeitige Beschäftigung */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-semibold text-zinc-500">Derzeitige Beschäftigung</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="z.B. Büroangestellte/r, Handwerker/in"
                    className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400/70"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* SECTION 3: Clinical Notes */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Medizinische Notizen</h4>
              
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-semibold text-zinc-500">Anmerkungen & Diagnosen</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z.B. chronische Rückenschmerzen M75.0, Bandscheibenvorfall LWS..."
                  className="w-full bg-zinc-100/60 border border-transparent focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2.5 font-semibold text-xs text-[#003527] outline-none resize-none transition-all placeholder-zinc-400/70 min-h-[90px]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-zinc-100 bg-white flex gap-3 flex-shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsNewClientModalOpen(false)}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200/80 text-[#003527] py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 border-none shadow-none"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
              className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed border-none shadow-none"
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Patient speichern'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
