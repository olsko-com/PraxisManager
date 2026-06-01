'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Check, Copy, Shield, User, CreditCard, Lock, 
  Smartphone, History, Download, ExternalLink, Eye, EyeOff, Activity, Scale,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { supabase } from '@/lib/supabase';

type TabType = 'profile' | 'security' | 'legal' | 'billing';

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
    saveSettings,
    showToast
  } = useDashboard();

  // Tabs configuration
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile local states
  const [reminderEmail, setReminderEmail] = useState(true);
  const [reminderSms, setReminderSms] = useState(false);
  const [reminderHours, setReminderHours] = useState('24');
  const [copied, setCopied] = useState(false);

  // Security local states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  // Legal local states
  const [impressumMode, setImpressumMode] = useState<'url' | 'text'>('url');
  const [impressumUrl, setImpressumUrl] = useState('');
  const [impressumText, setImpressumText] = useState('');
  const [datenschutzMode, setDatenschutzMode] = useState<'url' | 'text'>('url');
  const [datenschutzUrl, setDatenschutzUrl] = useState('');
  const [datenschutzText, setDatenschutzText] = useState('');
  const [isSavingLegal, setIsSavingLegal] = useState(false);
  const [legalSuccess, setLegalSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const impMode = localStorage.getItem('legal_impressum_mode') as 'url' | 'text' || 'url';
      const impUrl = localStorage.getItem('legal_impressum_url') || '';
      const impText = localStorage.getItem('legal_impressum_text') || '';
      
      const dsMode = localStorage.getItem('legal_datenschutz_mode') as 'url' | 'text' || 'url';
      const dsUrl = localStorage.getItem('legal_datenschutz_url') || '';
      const dsText = localStorage.getItem('legal_datenschutz_text') || '';

      setImpressumMode(impMode);
      setImpressumUrl(impUrl);
      setImpressumText(impText);
      setDatenschutzMode(dsMode);
      setDatenschutzUrl(dsUrl);
      setDatenschutzText(dsText);
    }
  }, []);

  // Save Legal Settings
  const handleSaveLegal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLegal(true);
    
    localStorage.setItem('legal_impressum_mode', impressumMode);
    localStorage.setItem('legal_impressum_url', impressumUrl);
    localStorage.setItem('legal_impressum_text', impressumText);
    
    localStorage.setItem('legal_datenschutz_mode', datenschutzMode);
    localStorage.setItem('legal_datenschutz_url', datenschutzUrl);
    localStorage.setItem('legal_datenschutz_text', datenschutzText);

    setTimeout(() => {
      setIsSavingLegal(false);
      setLegalSuccess(true);
      showToast('Rechtliche Angaben erfolgreich gespeichert!', 'success');
      setTimeout(() => setLegalSuccess(false), 3000);
    }, 800);
  };

  // Password strength check utility
  const checkPasswordStrength = (pw: string) => {
    const requirements = {
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = 'Sehr schwach';
    let color = 'bg-rose-500';
    let width = 'w-1/5';
    
    if (pw.length === 0) {
      label = 'Passwort eingeben';
      color = 'bg-zinc-200';
      width = 'w-0';
    } else if (score === 2) {
      label = 'Schwach';
      color = 'bg-orange-400';
      width = 'w-2/5';
    } else if (score === 3) {
      label = 'Mittel';
      color = 'bg-amber-400';
      width = 'w-3/5';
    } else if (score === 4) {
      label = 'Gut';
      color = 'bg-emerald-400';
      width = 'w-4/5';
    } else if (score === 5) {
      label = 'Stark (Empfohlen)';
      color = 'bg-[#003527]';
      width = 'w-full';
    }

    const isValid = requirements.length && requirements.uppercase && requirements.lowercase && requirements.number && requirements.special;

    return { requirements, score, label, color, width, isValid };
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);

    if (newPassword !== confirmNewPassword) {
      showToast('Die neuen Passwörter stimmen nicht überein.', 'error');
      setIsSavingPassword(false);
      return;
    }

    const strength = checkPasswordStrength(newPassword);
    if (!strength.isValid) {
      showToast('Das Passwort erfüllt nicht die Sicherheitskriterien.', 'error');
      setIsSavingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Passwort erfolgreich geändert!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      showToast(err?.message || 'Fehler beim Ändern des Passworts.', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSignOutOthers = () => {
    showToast('Von anderen Geräten erfolgreich abgemeldet.', 'success');
  };

  // Tabs metadata
  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'legal' as TabType, label: 'Rechtliches', icon: Scale },
    { id: 'security' as TabType, label: 'Sicherheit', icon: Shield },
    { id: 'billing' as TabType, label: 'Abrechnung', icon: CreditCard },
  ];

  const isPasswordButtonDisabled = isSavingPassword || !currentPassword || !newPassword || !confirmNewPassword || (newPassword !== confirmNewPassword) || !checkPasswordStrength(newPassword).isValid;

  return (
    <div className="flex-grow overflow-y-auto px-12 py-8 space-y-6 text-left font-sans select-none">
      
      {/* Header and Tab Navigation Group */}
      <div className="space-y-3 flex-shrink-0">
        <div className="flex justify-between items-center pb-0">
          <div className="text-left">
            <h2 className="text-lg font-bold text-[#043F2D]">Einstellungen</h2>
          </div>
        </div>

        {/* Tab Navigation (Apple style, matches Abrechnungen tab styles) */}
        <div className="flex justify-between items-end border-b border-[#bfc9c3]/20 pb-0 select-none -mx-12 px-12 h-[42px] mb-8">
          <div className="flex gap-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-xs font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id 
                      ? 'text-[#003527]' 
                      : 'text-zinc-400 hover:text-[#003527]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="settingsTabLine" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003527]" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-3xl">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PROFIL */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <form onSubmit={saveSettings} className="space-y-6">
                
                {/* Stammdaten */}
                <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-6 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 shrink-0">
                      <User className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#003527]">Praxisdaten</h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Hier verwaltest du deine Stammdaten und die Währung deiner Abrechnungen.</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-50" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Praxisname */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Praxisname / Bezeichnung</label>
                      <input 
                        type="text" 
                        required
                        value={therapistName}
                        onChange={(e) => setTherapistName(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                      />
                    </div>

                    {/* Währung */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Währung</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all cursor-pointer"
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
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                      />
                    </div>

                    {/* Anschrift */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Adresse / Anschrift</label>
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-2.5 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Buchungslink */}
                <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 shrink-0">
                      <Globe className="w-4 h-4 text-blue-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#003527]">Dein Buchungs-Link</h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Teile diesen Link auf deiner Website, um Klienten direkt online buchen zu lassen.</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-50" />
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://praxism.de/book/${therapistName.toLowerCase().replace(/\s+/g, '-')}`}
                      className="bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] flex-1 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://praxism.de/book/${therapistName.toLowerCase().replace(/\s+/g, '-')}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-[#003527] hover:bg-[#0b513d] text-white px-5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Kopiert' : 'Kopieren'}
                    </button>
                  </div>
                </div>

                {/* Kalender & No-Show Schutz */}
                <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-5 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 shrink-0">
                      <Activity className="w-4 h-4 text-purple-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#003527]">Verknüpfungen & No-Show Schutz</h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Automatische Google Kalender-Synchronisation und Erinnerungsvorlagen.</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-50" />

                  {/* Google Sync */}
                  <div className="flex justify-between items-center text-xs font-semibold text-[#404944] pt-2">
                    <div>
                      <p className="font-bold text-[#003527]">Google Calendar Sync</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Automatische Synchronisation aller Termine in beide Richtungen.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSyncEnabled(!syncEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        syncEnabled ? 'bg-[#003527]' : 'bg-zinc-200'
                      }`}
                    >
                      <motion.span
                        animate={{ x: syncEnabled ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0"
                      />
                    </button>
                  </div>

                  {syncEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-[10px] font-bold text-emerald-800 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Google Sync aktiv: {therapistName.toLowerCase().replace(/\s+/g, '')}@gmail.com
                    </motion.div>
                  )}

                  {/* Reminders */}
                  <div className="border-t border-zinc-100 pt-4 space-y-4">
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
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-3 py-2 font-bold text-xs text-[#003527] cursor-pointer"
                        >
                          <option value="12">12 Stunden vorher</option>
                          <option value="24">24 Stunden vorher</option>
                          <option value="48">48 Stunden vorher</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-8 py-3.5 rounded-lg text-xs font-bold transition-all disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSavingSettings ? 'Speichert...' : 'Profil speichern'}
                  </button>

                  {settingsSuccess && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                      <Check className="w-4 h-4" /> Erfolgreich gespeichert!
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: RECHTLICHES (NEW TAB) */}
          {activeTab === 'legal' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <form onSubmit={handleSaveLegal} className="space-y-6">
                      {/* Impressum */}
                <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 shrink-0">
                      <Scale className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#003527]">Impressum</h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        Gib an, wie das Impressum auf deiner Online-Buchungsseite angezeigt werden soll.
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-50" />

                  {/* Toggle Selector */}
                  <div className="inline-flex bg-[#f3f4f3] p-1 rounded-lg border border-zinc-200/50">
                    <button
                      type="button"
                      onClick={() => setImpressumMode('url')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        impressumMode === 'url'
                          ? 'bg-white text-[#003527] shadow-sm'
                          : 'text-[#404944] hover:text-[#003527]'
                      }`}
                    >
                      Auf bestehende Seite verlinken
                    </button>
                    <button
                      type="button"
                      onClick={() => setImpressumMode('text')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        impressumMode === 'text'
                          ? 'bg-white text-[#003527] shadow-sm'
                          : 'text-[#404944] hover:text-[#003527]'
                      }`}
                    >
                      Text hinterlegen
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {impressumMode === 'url' ? (
                      <motion.div
                        key="impressum-url"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2 pt-1"
                      >
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Impressum URL</label>
                        <input
                          type="url"
                          placeholder="https://deine-website.de/impressum"
                          value={impressumUrl}
                          onChange={(e) => setImpressumUrl(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="impressum-text"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2 pt-1"
                      >
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Impressumstext</label>
                        <textarea
                          placeholder="Trage hier dein vollständiges Impressum ein (z. B. Vertretungsberechtigte, Registernummer, Steuernummer)..."
                          value={impressumText}
                          onChange={(e) => setImpressumText(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-medium text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all h-36 resize-y"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Datenschutz */}
                <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/40 shrink-0">
                      <Shield className="w-4 h-4 text-rose-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#003527]">Datenschutz</h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        Gib an, wie die Datenschutzerklärung auf deiner Online-Buchungsseite angezeigt werden soll.
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-50" />

                  {/* Toggle Selector */}
                  <div className="inline-flex bg-[#f3f4f3] p-1 rounded-lg border border-zinc-200/50">
                    <button
                      type="button"
                      onClick={() => setDatenschutzMode('url')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        datenschutzMode === 'url'
                          ? 'bg-white text-[#003527] shadow-sm'
                          : 'text-[#404944] hover:text-[#003527]'
                      }`}
                    >
                      Auf bestehende Seite verlinken
                    </button>
                    <button
                      type="button"
                      onClick={() => setDatenschutzMode('text')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        datenschutzMode === 'text'
                          ? 'bg-white text-[#003527] shadow-sm'
                          : 'text-[#404944] hover:text-[#003527]'
                      }`}
                    >
                      Text hinterlegen
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {datenschutzMode === 'url' ? (
                      <motion.div
                        key="datenschutz-url"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2 pt-1"
                      >
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datenschutz URL</label>
                        <input
                          type="url"
                          placeholder="https://deine-website.de/datenschutz"
                          value={datenschutzUrl}
                          onChange={(e) => setDatenschutzUrl(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="datenschutz-text"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2 pt-1"
                      >
                        <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datenschutzerklärung (Text)</label>
                        <textarea
                          placeholder="Trage hier deine Datenschutzerklärung ein (z. B. Informationen zur Datenverarbeitung, Patientenrechte)..."
                          value={datenschutzText}
                          onChange={(e) => setDatenschutzText(e.target.value)}
                          className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-medium text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all h-36 resize-y"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Save button */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingLegal}
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-8 py-3.5 rounded-lg text-xs font-bold transition-all disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSavingLegal ? 'Speichert...' : 'Angaben speichern'}
                  </button>

                  {legalSuccess && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-fade-in">
                      <Check className="w-4 h-4" /> Erfolgreich gespeichert!
                    </span>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 3: SICHERHEIT */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Passwort ändern */}
              <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-6 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/40 shrink-0">
                    <Lock className="w-4 h-4 text-rose-700" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-[#003527]">Passwort ändern</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Ändere dein Anmeldepasswort. Verwende ein starkes, einzigartiges Passwort.</p>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-50" />

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Aktuelles Passwort */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest mb-1.5">Aktuelles Passwort</label>
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-8.5 text-zinc-400 hover:text-[#003527] transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Neues Passwort */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest mb-1.5">Neues Passwort</label>
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onFocus={() => setFocusField('newPassword')}
                      onBlur={() => setFocusField(null)}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-8.5 text-zinc-400 hover:text-[#003527] transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Checklist (Matches Signup behavior exactly) */}
                  {(newPassword.length > 0 || focusField === 'newPassword') && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-2.5 pt-1 overflow-hidden"
                    >
                      {(() => {
                        const { label, color, width } = checkPasswordStrength(newPassword);
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-zinc-400">Passwortstärke:</span>
                              <span className="text-[#003527]">{label}</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                              <div className={`h-full ${color} ${width} transition-all duration-300 rounded-full`} />
                            </div>
                          </div>
                        );
                      })()}

                      {(() => {
                        const { requirements } = checkPasswordStrength(newPassword);
                        const reqList = [
                           { key: 'length', text: 'Mindestens 8 Zeichen' },
                           { key: 'uppercase', text: 'Großbuchstabe (A-Z)' },
                           { key: 'lowercase', text: 'Kleinbuchstabe (a-z)' },
                           { key: 'number', text: 'Zahl (0-9)' },
                           { key: 'special', text: 'Sonderzeichen (@, !)' }
                        ];

                        return (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-semibold text-zinc-500 bg-[#f3f4f3]/40 border border-[#bfc9c3]/20 rounded-lg p-3">
                            {reqList.map((req) => {
                              const isMet = requirements[req.key as keyof typeof requirements];
                              return (
                                <div key={req.key} className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                                    isMet ? 'bg-[#003527]' : 'bg-zinc-300'
                                  }`} />
                                  <span className={`transition-colors ${isMet ? 'text-[#003527] font-bold' : 'text-zinc-400'}`}>
                                    {req.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* Passwort bestätigen */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest mb-1.5">Neues Passwort bestätigen</label>
                    <input 
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-lg px-4 py-3 font-bold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3.5 top-8.5 text-zinc-400 hover:text-[#003527] transition-colors cursor-pointer"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPasswordButtonDisabled}
                      className="bg-[#003527] hover:bg-[#0b513d] text-white px-6 py-3 rounded-lg text-xs font-bold transition-all disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSavingPassword ? 'Speichert...' : 'Passwort aktualisieren'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Zwei-Faktor-Authentifizierung */}
              <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 border border-teal-200/40 shrink-0">
                      <Smartphone className="w-4 h-4 text-teal-700" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-[#003527] flex items-center gap-1.5">
                        Zwei-Faktor-Authentifizierung (2FA)
                        <span className="bg-zinc-100 text-zinc-500 font-bold text-[8px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">Optional</span>
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Sichere dein Konto zusätzlich ab, indem du bei der Anmeldung einen Bestätigungscode per E-Mail oder Authentifikator-App anforderst.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-11 h-6 flex items-center rounded-full p-1 bg-zinc-100 cursor-not-allowed border border-zinc-200/50 opacity-60"
                  >
                    <div className="bg-white w-4 h-4 rounded-full border border-zinc-200" />
                  </button>
                </div>
              </div>

              {/* Aktive Sitzungen */}
              <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/40 shrink-0">
                    <Activity className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-[#003527]">Aktive Sitzungen</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Geräte, die derzeit in deinem Konto angemeldet sind.</p>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-50" />

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-[#003527]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#003527]">macOS • Safari (Dieses Gerät)</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Hamburg, Deutschland • Online</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#003527]/10 text-[#003527] px-2 py-0.5 rounded-full">Aktiv</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-600">iPhone 15 Pro • Safari</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Berlin, Deutschland • Zuletzt aktiv vor 2 Stunden</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleSignOutOthers}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-4 text-right">
                  <button
                    onClick={handleSignOutOthers}
                    className="border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Von allen anderen Geräten abmelden
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ABRECHNUNG */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Aktueller Tarif */}
              <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#043F2D]">Tarifübersicht</h3>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Verwalte dein Abonnement und sieh dir die Details deines Tarifs an.</p>
                </div>

                <div className="bg-[#003527]/5 border border-[#003527]/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#003527]">PraxisManager Pro</h4>
                      <span className="text-[9px] font-bold bg-[#003527]/15 text-[#003527] px-2 py-0.5 rounded-full uppercase tracking-wider">Aktiv</span>
                    </div>
                    <p className="text-[11px] text-[#404944]/90 font-medium">Voller Funktionsumfang inklusive Kalender, Abrechnungen und SOAP-Notes.</p>
                    <p className="text-[10px] text-zinc-400 font-semibold pt-1">Abonniert seit: 1. Mai 2026 • Nächste Abrechnung am 1. Juli 2026</p>
                  </div>

                  <div className="text-left md:text-right flex-shrink-0">
                    <p className="text-lg font-extrabold text-[#003527]">€29,00 <span className="text-xs font-semibold text-zinc-400">/ Monat</span></p>
                    <button 
                      onClick={() => showToast('Tarifwechsel-Optionen werden bald freigeschaltet!', 'info')}
                      className="text-[10px] font-bold text-[#003527] hover:underline block mt-1"
                    >
                      Tarif wechseln
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-1">
                  <button 
                    onClick={() => showToast('Abos können unter der Testversion nicht geändert werden.', 'info')}
                    className="border border-[#bfc9c3]/50 text-zinc-500 hover:bg-zinc-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Abonnement kündigen
                  </button>
                  <button 
                    onClick={() => showToast('Zahlungsportal wird geladen...', 'success')}
                    className="bg-[#003527] text-white hover:bg-[#0b513d] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Kundenportal öffnen
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Zahlungsmethode */}
              <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#043F2D]">Hinterlegte Zahlungsmethode</h3>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Diese Zahlungsart wird für deine monatlichen Abrechnungen verwendet.</p>
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border border-zinc-100 rounded-xl p-4 bg-zinc-50/50">
                  <div className="flex items-center gap-3">
                    {/* Visa Card Logo Badge */}
                    <div className="w-10 h-6 bg-white border border-zinc-200 rounded flex items-center justify-center font-bold text-[10px] text-blue-800 tracking-wider">
                      VISA
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#003527]">Visa endend auf 4242</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Ablaufdatum: 12/28 • Inhaber: {therapistName || 'Praxisinhaber'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast('Kreditkartendaten-Formular wird geöffnet...', 'success')}
                    className="text-xs font-bold text-[#003527] hover:text-[#0b513d] bg-white border border-[#bfc9c3]/50 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Zahlungsart aktualisieren
                  </button>
                </div>
              </div>

              {/* Rechnungsverlauf */}
              <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#043F2D]">Rechnungsverlauf</h3>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Sieh dir vergangene Rechnungen an und lade sie als PDF herunter.</p>
                </div>

                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Datum</th>
                        <th className="px-4 py-3">Rechnungsnr.</th>
                        <th className="px-4 py-3">Betrag</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-semibold text-[#404944]">
                      <tr>
                        <td className="px-4 py-3 text-[#003527]">01. Mai 2026</td>
                        <td className="px-4 py-3 text-zinc-500">RE-2026-002</td>
                        <td className="px-4 py-3 text-[#003527] font-bold">€29,00</td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Bezahlt</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => showToast('Rechnung heruntergeladen!', 'success')}
                            className="text-[#003527] hover:text-[#0b513d] p-1.5 rounded-lg hover:bg-zinc-50 transition-colors inline-flex cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-[#003527]">01. Apr 2026</td>
                        <td className="px-4 py-3 text-zinc-500">RE-2026-001</td>
                        <td className="px-4 py-3 text-[#003527] font-bold">€29,00</td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Bezahlt</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => showToast('Rechnung heruntergeladen!', 'success')}
                            className="text-[#003527] hover:text-[#0b513d] p-1.5 rounded-lg hover:bg-zinc-50 transition-colors inline-flex cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
