'use client';

import React, { useState } from 'react';
import { 
  Link2, Calendar, Clock, Sparkles, Check, Copy, ExternalLink, Code, 
  ChevronRight, ArrowLeft, CheckCircle2, User, Mail, Phone 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';

interface TimeSlotDay {
  active: boolean;
  start: string;
  end: string;
}

export default function BookingConfig({ 
  isAddonActive, 
  onActivate 
}: { 
  isAddonActive: boolean; 
  onActivate?: () => void; 
}) {
  const { services, showToast } = useDashboard();
  
  // Local Config states
  const [slug, setSlug] = useState('praxis-ruether');
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>(
    services.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, TimeSlotDay>>({
    'Montag': { active: true, start: '09:00', end: '17:00' },
    'Dienstag': { active: true, start: '09:00', end: '17:00' },
    'Mittwoch': { active: true, start: '09:00', end: '17:00' },
    'Donnerstag': { active: true, start: '09:00', end: '17:00' },
    'Freitag': { active: true, start: '09:00', end: '15:00' }
  });

  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedWidget, setIsCopiedWidget] = useState(false);

  // Simulator flow states
  const [simStep, setSimStep] = useState(1);
  const [simServiceId, setSimServiceId] = useState('');
  const [simDate, setSimDate] = useState('2026-06-02'); // Tuesday
  const [simTimeSlot, setSimTimeSlot] = useState('');
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [simPhone, setSimPhone] = useState('');
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://hmanager.de/book/${slug}`);
    setIsCopiedLink(true);
    showToast('Buchungslink in die Zwischenablage kopiert.', 'success');
    setTimeout(() => setIsCopiedLink(false), 2000);
  };

  const handleCopyWidget = () => {
    const iframeCode = `<iframe src="https://hmanager.de/book/${slug}?widget=true" width="100%" height="700px" style="border:none; border-radius:16px; box-shadow:0 4px 30px rgba(0,0,0,0.03);"></iframe>`;
    navigator.clipboard.writeText(iframeCode);
    setIsCopiedWidget(true);
    showToast('Widget-Code in die Zwischenablage kopiert.', 'success');
    setTimeout(() => setIsCopiedWidget(false), 2000);
  };

  const handleToggleDay = (day: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const handleChangeTime = (day: string, type: 'start' | 'end', value: string) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
  };

  const handleToggleService = (id: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mock slot data based on availability
  const simulatorSlots = ['09:00', '10:30', '12:00', '14:00', '15:30'];

  const simSelectedService = services.find(s => s.id === simServiceId);

  const resetSimulator = () => {
    setSimStep(1);
    setSimServiceId('');
    setSimTimeSlot('');
    setSimName('');
    setSimEmail('');
    setSimPhone('');
  };

  const handleFinishSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName || !simEmail) {
      showToast('Bitte Namen und E-Mail eingeben.', 'error');
      return;
    }
    setSimStep(4);
    showToast('Testbuchung erfolgreich abgeschlossen!', 'success');
  };

  // If public-booking addon is inactive, show dynamic premium teaser
  if (!isAddonActive) {
    return (
      <div className="relative rounded-2xl border border-[#bfc9c3]/30 bg-white p-12 text-center max-w-2xl mx-auto space-y-6 shadow-[0_8px_30px_rgba(0,53,39,0.01)] animate-fade-in mt-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center animate-pulse">
          <Calendar className="w-8 h-8 text-[#003527]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#043F2D]">Online-Buchungsseite konfigurieren</h3>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            Aktiviere das Addon <strong className="text-[#003527]">„Online-Buchungsseite“</strong> im Erweiterungskatalog, um deine Verfügbarkeiten einzustellen, Buchungslinks zu erstellen und das Widget auf deiner Homepage einzubetten.
          </p>
        </div>
        {onActivate && (
          <button
            type="button"
            onClick={onActivate}
            className="px-6 py-3 bg-[#003527] hover:bg-[#0b513d] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            Erweiterung jetzt aktivieren
          </button>
        )}
        <div className="h-px bg-zinc-100 my-4" />
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Features der Online-Buchung:</p>
        <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto text-[11px] font-bold text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Eigene Wunsch-Subdomain
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Kombinierte Kalendersperren
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Website-Iframe Widget
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Automatischer Mailversand
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl pb-24 animate-fade-in">
      
      {/* LEFT COLUMN: Configurations (Col-span 7) */}
      <div className="lg:col-span-7 space-y-6 text-left">
        
        {/* Card 1: Link Configuration */}
        <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Link2 className="w-4 h-4 text-[#003527]" /> Buchungslink & Subdomain
          </h4>
          
          <div className="space-y-4 text-xs font-semibold">
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
              Deine persönliche Buchungsseite ist unter diesem Link erreichbar. Du kannst das URL-Kürzel jederzeit ändern:
            </p>
            
            <div className="flex gap-2">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 flex items-center gap-1 w-full text-zinc-400 text-xs font-semibold select-all">
                <span>hmanager.de/book/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase())}
                  className="bg-transparent border-none outline-none font-bold text-xs text-[#003527] w-full p-0 focus:ring-0"
                  placeholder="wunsch-name"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl px-4 flex items-center justify-center text-[#003527] cursor-pointer transition-colors"
                title="Link kopieren"
              >
                {isCopiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Time Slots & Weekly Availability */}
        <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Clock className="w-4 h-4 text-[#003527]" /> Freigeschaltete Time-Slots
          </h4>
          
          <div className="space-y-4">
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
              Stelle ein, an welchen Wochentagen und zu welchen Zeiten Klienten Termine online reservieren dürfen:
            </p>
            
            <div className="space-y-3">
              {Object.keys(weeklyAvailability).map((day) => {
                const config = weeklyAvailability[day];
                return (
                  <div key={day} className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-zinc-50/50 border border-zinc-100 text-xs font-bold text-[#003527]">
                    
                    {/* Day Toggle Switch */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          config.active ? 'bg-[#003527]' : 'bg-zinc-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                            config.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`w-20 text-left ${config.active ? 'text-[#003527]' : 'text-zinc-400'}`}>{day}</span>
                    </div>

                    {/* Time Selectors */}
                    {config.active ? (
                      <div className="flex items-center gap-2 text-zinc-400 font-semibold">
                        <select
                          value={config.start}
                          onChange={(e) => handleChangeTime(day, 'start', e.target.value)}
                          className="bg-white border border-[#bfc9c3]/50 rounded-lg px-2 py-1 font-bold text-xs text-[#003527] cursor-pointer"
                        >
                          {['08:00', '09:00', '10:00', '11:00', '12:00'].map(t => (
                            <option key={t} value={t}>{t} Uhr</option>
                          ))}
                        </select>
                        <span>bis</span>
                        <select
                          value={config.end}
                          onChange={(e) => handleChangeTime(day, 'end', e.target.value)}
                          className="bg-white border border-[#bfc9c3]/50 rounded-lg px-2 py-1 font-bold text-xs text-[#003527] cursor-pointer"
                        >
                          {['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(t => (
                            <option key={t} value={t}>{t} Uhr</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-medium italic">Geschlossen</span>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Selectable Services */}
        <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Sparkles className="w-4 h-4 text-[#003527]" /> Leistungen freischalten
          </h4>
          
          <div className="space-y-4">
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
              Wähle aus, welche deiner Behandlungs-Leistungen direkt über die Website gebucht werden können:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => {
                const isSelected = selectedServices[srv.id] || false;
                return (
                  <div 
                    key={srv.id}
                    onClick={() => handleToggleService(srv.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#003527] bg-[#003527]/3' 
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-left space-y-0.5 min-w-0 pr-2">
                      <p className="text-xs font-bold text-[#003527] truncate">{srv.name}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold">{srv.duration} Min. • {srv.price.toFixed(2)} €</p>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-[#003527] border-[#003527] text-white' 
                        : 'border-zinc-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Embed Widget Code */}
        <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Code className="w-4 h-4 text-[#003527]" /> Widget-Code für die eigene Website
          </h4>
          
          <div className="space-y-4 text-xs font-semibold">
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
              Kopiere diesen HTML-Code, um das Buchungsmodal direkt als responsive Box nahtlos in deine Homepage (WordPress, Wix, Webflow etc.) einzubinden:
            </p>
            
            <div className="relative">
              <pre className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-[10px] font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap select-all leading-normal">
                {`<iframe src="https://hmanager.de/book/${slug}?widget=true" width="100%" height="700px" style="border:none; border-radius:16px; box-shadow:0 4px 30px rgba(0,0,0,0.03);"></iframe>`}
              </pre>
              <button
                type="button"
                onClick={handleCopyWidget}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white border border-zinc-200 rounded-lg p-1.5 flex items-center justify-center text-[#003527] cursor-pointer transition-colors shadow-sm"
                title="Widget-Code kopieren"
              >
                {isCopiedWidget ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Mobile Simulator (Col-span 5) */}
      <div className="lg:col-span-5 space-y-4 text-left">
        <span className="text-[10px] font-extrabold tracking-widest text-[#003527]/70 uppercase">Vorschau Buchungsmodal (Live-Simulator)</span>
        
        {/* Device Wrapper */}
        <div className="relative bg-[#003527] p-3.5 rounded-[40px] shadow-2xl border-4 border-[#0b513d]/25 max-w-[340px] mx-auto overflow-hidden">
          
          {/* Top Speaker Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#003527] rounded-b-xl z-20 flex items-center justify-center">
            <div className="w-10 h-1 bg-zinc-800 rounded-full" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="bg-[#f9f9f8] rounded-[30px] min-h-[500px] max-h-[500px] overflow-y-auto px-4 py-7 flex flex-col justify-between font-sans border border-[#bfc9c3]/20 relative hide-scrollbar text-[#003527]">
            
            {/* Header Area of the public widget */}
            <div>
              <div className="border-b border-[#bfc9c3]/15 pb-2.5 mb-4 text-center mt-2">
                <h5 className="font-extrabold text-[12px] leading-tight">Praxis Ruether</h5>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Online Terminvereinbarung</p>
              </div>

              {/* STEP 1: SELECT SERVICE */}
              {simStep === 1 && (
                <div className="space-y-3.5 animate-fade-in text-left">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">1. Leistung auswählen</p>
                  
                  <div className="space-y-2">
                    {services
                      .filter(s => selectedServices[s.id] !== false)
                      .map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => {
                            setSimServiceId(srv.id);
                            setSimStep(2);
                          }}
                          className="w-full bg-white hover:bg-[#003527]/3 border border-[#bfc9c3]/30 hover:border-[#003527]/30 rounded-xl p-3.5 flex justify-between items-center transition-all text-left cursor-pointer group"
                        >
                          <div className="space-y-0.5 min-w-0 pr-1.5">
                            <p className="text-[11px] font-extrabold text-[#003527] truncate">{srv.name}</p>
                            <p className="text-[9px] text-zinc-400 font-bold">{srv.duration} Min. • {srv.price.toFixed(2)} €</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#003527] transition-all" />
                        </button>
                      ))}
                    {services.filter(s => selectedServices[s.id] !== false).length === 0 && (
                      <p className="text-[9px] text-zinc-400 italic text-center py-6">Keine Leistungen freigegeben.</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT SLOT */}
              {simStep === 2 && (
                <div className="space-y-4 animate-fade-in text-left">
                  <button
                    type="button"
                    onClick={() => setSimStep(1)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-[#003527] bg-transparent border-none cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Zurück
                  </button>
                  
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">2. Termin wählen</p>
                  
                  {/* Selected service summary */}
                  {simSelectedService && (
                    <div className="bg-white border border-[#bfc9c3]/20 rounded-xl p-2.5 flex justify-between items-center text-[10px] font-bold">
                      <span className="truncate">{simSelectedService.name}</span>
                      <span className="text-[9px] text-zinc-400 shrink-0 pl-1">{simSelectedService.duration} Min.</span>
                    </div>
                  )}

                  {/* Days calendar row */}
                  <div className="grid grid-cols-5 gap-1 text-center select-none">
                    {[
                      { key: '2026-06-01', day: 'Mo', date: '01' },
                      { key: '2026-06-02', day: 'Di', date: '02' },
                      { key: '2026-06-03', day: 'Mi', date: '03' },
                      { key: '2026-06-04', day: 'Do', date: '04' },
                      { key: '2026-06-05', day: 'Fr', date: '05' }
                    ].map((item) => {
                      const isSelected = simDate === item.key;
                      return (
                        <div 
                          key={item.key}
                          onClick={() => setSimDate(item.key)}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-0.5 ${
                            isSelected 
                              ? 'bg-[#003527] border-[#003527] text-white' 
                              : 'bg-white border-zinc-200 text-[#003527] hover:border-zinc-300'
                          }`}
                        >
                          <span className="text-[8px] opacity-70 font-semibold">{item.day}</span>
                          <span className="text-[11px] font-extrabold">{item.date}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slots Grid */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Verfügbare Uhrzeiten:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {simulatorSlots.map((slot) => {
                        const isSelected = simTimeSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => {
                              setSimTimeSlot(slot);
                              setSimStep(3);
                            }}
                            className={`py-2 text-[10px] font-extrabold border rounded-lg transition-all cursor-pointer text-center ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-white border-zinc-200 text-[#003527] hover:bg-zinc-50'
                            }`}
                          >
                            {slot} Uhr
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CLIENT DETAILS */}
              {simStep === 3 && (
                <div className="space-y-4 animate-fade-in text-left">
                  <button
                    type="button"
                    onClick={() => setSimStep(2)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 hover:text-[#003527] bg-transparent border-none cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Zurück
                  </button>

                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">3. Kontaktdaten</p>

                  {/* Summary Box */}
                  <div className="bg-white border border-[#bfc9c3]/30 rounded-xl p-3 space-y-1.5 text-[9px] font-bold text-[#003527]">
                    <p className="truncate text-left">Leistung: {simSelectedService?.name}</p>
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Di, 02.06.2026 um {simTimeSlot} Uhr</span>
                      <span>{simSelectedService?.price.toFixed(2)} €</span>
                    </div>
                  </div>

                  <form onSubmit={handleFinishSimulation} className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-extrabold uppercase tracking-wider text-zinc-400">Name, Vorname</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-2.5 w-3 h-3 text-zinc-400" />
                        <input
                          type="text"
                          required
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          placeholder="z.B. Alexander Hoffmann"
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-[10px] font-bold text-[#003527] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-extrabold uppercase tracking-wider text-zinc-400">E-Mail</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-2.5 w-3 h-3 text-zinc-400" />
                        <input
                          type="email"
                          required
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          placeholder="z.B. alex@hoffmann.de"
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-[10px] font-bold text-[#003527] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-extrabold uppercase tracking-wider text-zinc-400">Telefonnummer</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-2.5 w-3 h-3 text-zinc-400" />
                        <input
                          type="text"
                          value={simPhone}
                          onChange={(e) => setSimPhone(e.target.value)}
                          placeholder="z.B. +49 176 1234567"
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-[10px] font-bold text-[#003527] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-3 bg-[#003527] hover:bg-[#0b513d] text-white py-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none"
                    >
                      Termin zahlungspflichtig buchen
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 4: CONFIRMATION SUCCESS */}
              {simStep === 4 && (
                <div className="space-y-6 text-center py-8 animate-fade-in">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h5 className="font-extrabold text-[12px] text-[#003527]">Termin gebucht!</h5>
                    <p className="text-[9px] text-zinc-400 font-semibold px-4 leading-normal">
                      Vielen Dank, Herr/Frau {simName}. Wir haben dir eine Bestätigungs-E-Mail gesendet.
                    </p>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-xl p-4 text-[9px] font-bold text-left space-y-1 mx-2">
                    <p className="border-b border-zinc-100 pb-1.5 text-center text-[#003527] uppercase tracking-wider text-[8px]">Buchungsbestätigung</p>
                    <p>Leistung: {simSelectedService?.name}</p>
                    <p>Datum: Di, 02.06.2026</p>
                    <p>Uhrzeit: {simTimeSlot} Uhr</p>
                    <p className="text-zinc-400 mt-1 font-medium italic text-[8.5px]">Dies war eine Simulation.</p>
                  </div>

                  <button
                    type="button"
                    onClick={resetSimulator}
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-4 py-2 rounded-lg text-[9px] font-bold transition-colors cursor-pointer border-none"
                  >
                    Erneut simulieren
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Indicator Bar */}
            <div className="w-20 h-1 bg-zinc-300 rounded-full mx-auto" />
          </div>

        </div>
      </div>

    </div>
  );
}
