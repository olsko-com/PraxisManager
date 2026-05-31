'use client';

import React, { useState } from 'react';
import { CheckCircle2, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

export default function SettingsPage() {
  const {
    therapistName,
    setTherapistName,
    currency,
    setCurrency,
    phone,
    setPhone,
    address,
    setAddress,
    syncEnabled,
    setSyncEnabled,
    isSavingSettings,
    settingsSuccess,
    saveSettings
  } = useDashboard();

  // Local state for settings elements that don't need global context sharing
  const [reminderEmail, setReminderEmail] = useState(true);
  const [reminderSms, setReminderSms] = useState(false);
  const [reminderHours, setReminderHours] = useState('24');
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex-grow overflow-y-auto px-12 py-8 space-y-6 text-left">
      <div className="max-w-3xl bg-white border border-[#bfc9c3]/50 rounded-2xl p-8 shadow-none space-y-8">
        <div>
          <h3 className="text-lg font-bold text-[#043F2D]">Praxis-Einstellungen</h3>
          <p className="text-xs text-zinc-400 font-semibold mt-1">Hier verwaltest du deine Stammdaten, automatische SMS/E-Mail-Erinnerungen und Syncs.</p>
        </div>

        <form onSubmit={saveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Praxisname */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Praxisname / Bezeichnung</label>
              <input 
                type="text" 
                required
                value={therapistName}
                onChange={(e) => setTherapistName(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
              />
            </div>

            {/* Währung */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Währung</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all cursor-pointer"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            {/* Telefon */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Telefonnummer</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
              />
            </div>

            {/* Anschrift */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Adresse / Anschrift</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none h-20"
              />
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">Verknüpfungen & Kalender</h4>
            <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
              <div>
                <p className="font-bold text-[#003527]">Google Calendar Sync</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Automatisches Synchronisieren aller Termine in beide Richtungen.</p>
              </div>
              
              <button
                type="button"
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  syncEnabled ? 'bg-[#003527]' : 'bg-[#bfc9c3]/50'
                }`}
              >
                <motion.div 
                  layout
                  className="bg-white w-4 h-4 rounded-full border border-zinc-200"
                  animate={{ x: syncEnabled ? 24 : 0 }}
                />
              </button>
            </div>

            {syncEnabled && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[10px] font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Google Sync aktiv: {therapistName.toLowerCase().replace(/\s+/g, '')}@gmail.com
              </div>
            )}
          </div>

          {/* Automatic Reminders */}
          <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">Automatischer No-Show Schutz (Erinnerungen)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-[#404944]">
              <div className="space-y-3 flex flex-col justify-center items-start">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#003527]">
                  <input type="checkbox" checked={reminderEmail} onChange={() => setReminderEmail(!reminderEmail)} className="rounded text-[#003527] cursor-pointer" />
                  E-Mail Erinnerung senden
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#003527]">
                  <input type="checkbox" checked={reminderSms} onChange={() => setReminderSms(!reminderSms)} className="rounded text-[#003527] cursor-pointer" />
                  SMS Erinnerung senden
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Zeitraum vor dem Termin</label>
                <select
                  value={reminderHours}
                  onChange={(e) => setReminderHours(e.target.value)}
                  className="w-full bg-white border border-[#bfc9c3]/50 rounded-xl px-3 py-2 font-bold text-xs text-[#003527] cursor-pointer"
                >
                  <option value="12">12 Stunden vorher</option>
                  <option value="24">24 Stunden vorher</option>
                  <option value="48">48 Stunden vorher</option>
                </select>
              </div>
            </div>
          </div>

          {/* Public Booking Link */}
          <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">Dein Buchungs-Link</h4>
            <p className="text-xs text-zinc-400 font-semibold">Teile diesen Link auf deiner Website, in E-Mails oder auf Social Media, um Klienten direkt online buchen zu lassen.</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={`https://praxism.de/book/${therapistName.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white border border-[#bfc9c3]/40 rounded-xl px-4 py-2.5 font-bold text-xs text-[#003527] flex-1 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://praxism.de/book/${therapistName.toLowerCase().replace(/\s+/g, '-')}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-[#003527] text-white hover:bg-[#0b513d] px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kopiert' : 'Kopieren'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="bg-[#003527] hover:bg-[#0b513d] text-white px-8 py-3.5 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingSettings ? 'Speichert...' : 'Einstellungen speichern'}
            </button>

            {settingsSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                <Check className="w-4 h-4" /> Erfolgreich gespeichert!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
