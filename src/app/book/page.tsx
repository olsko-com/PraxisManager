'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Clock, User, Mail, Phone, 
  CheckCircle2, ChevronRight, ArrowLeft, ArrowRight, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

export default function PublicBookingPage() {
  const [step, setStep] = useState(1);
  
  // Practice Details (Mocked default)
  const practiceName = 'Praxis Ruether';
  const specialties = ['Physiotherapie', 'Osteopathie', 'Manuelle Therapie'];

  // Services available for booking
  const services = [
    { id: 's1', name: 'Physiotherapie Erstgespräch & Befund', duration: 60, price: 90.00, desc: 'Ausführliche Anamnese und Befundaufnahme zur individuellen Therapieplanung.' },
    { id: 's2', name: 'Klassische Massagetherapie', duration: 30, price: 45.00, desc: 'Lockerung der Muskulatur und Durchblutungsförderung.' },
    { id: 's3', name: 'Manuelle Therapie (MT)', duration: 45, price: 70.00, desc: 'Gelenkmobilisation und schmerzlindernde Techniken.' },
    { id: 's4', name: 'Osteopathische Behandlung', duration: 60, price: 110.00, desc: 'Ganzheitliche osteopathische Befunderhebung und Mobilisation.' },
  ];

  // State
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Mock available slots for date
  const availableSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  const handleServiceSelect = (service: typeof services[0]) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateTimeConfirm = () => {
    if (!selectedDate || !selectedTime) {
      alert('Bitte wähle ein Datum und eine Uhrzeit.');
      return;
    }
    setStep(3);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f8] text-[#191c1c] font-sans antialiased flex flex-col justify-between selection:bg-emerald-500/20 selection:text-[#003527]">
      {/* Header */}
      <header className="bg-white border-b border-[#bfc9c3]/30 py-6 px-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#003527] flex items-center justify-center">
            <CalendarIcon className="text-white h-4 w-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-[#043F2D] leading-none">{practiceName}</h1>
            <p className="text-[10px] text-[#003527]/70 font-bold uppercase mt-1 tracking-wider">{specialties.join(' • ')}</p>
          </div>
        </div>
        <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SSL Verschlüsselt
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-grow flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-2xl bg-white border border-[#bfc9c3]/50 rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          
          {/* Progress bar */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <span className={step === 1 ? 'text-[#003527]' : ''}>1. Leistung</span>
              <ChevronRight className="w-3 h-3" />
              <span className={step === 2 ? 'text-[#003527]' : ''}>2. Termin</span>
              <ChevronRight className="w-3 h-3" />
              <span className={step === 3 ? 'text-[#003527]' : ''}>3. Daten</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: SERVICE SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#043F2D]">Wähle eine Behandlung</h2>
                  <p className="text-xs text-zinc-400 font-semibold mt-1">Wähle die gewünschte Leistung aus, um freie Termine zu sehen.</p>
                </div>

                <div className="space-y-3">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="bg-white hover:bg-[#f9f9f8] border border-[#bfc9c3]/50 hover:border-[#003527]/40 p-5 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
                    >
                      <div className="space-y-1 pr-4">
                        <h3 className="font-bold text-sm text-[#043F2D] group-hover:text-[#003527]">{service.name}</h3>
                        <p className="text-[11px] text-zinc-400 font-semibold">{service.desc}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#003527]/60 font-bold pt-1">
                          <Clock className="w-3 h-3" /> {service.duration} Min.
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-sm text-[#003527]">{service.price.toFixed(2)} €</span>
                        <div className="text-[9px] text-[#003527] font-bold mt-1 group-hover:underline flex items-center gap-0.5 justify-end">
                          Wählen <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME SLOT */}
            {step === 2 && selectedService && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-[#003527] flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Zurück
                  </button>
                  <span className="text-xs font-bold text-zinc-400">{selectedService.name}</span>
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#043F2D]">Datum & Uhrzeit wählen</h2>
                  <p className="text-xs text-zinc-400 font-semibold mt-1">Wähle einen Tag und eine Uhrzeit für deinen Termin.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#003527]/70 uppercase">Datum auswählen</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min="2026-05-29"
                      className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-sm text-[#003527] outline-none"
                    />
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#003527]/70 uppercase">Verfügbare Uhrzeiten</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              selectedTime === slot 
                                ? 'bg-[#003527] text-white border-[#003527]' 
                                : 'bg-[#f9f9f8] border-[#bfc9c3]/40 text-[#003527] hover:border-[#003527]/40'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedTime && (
                  <button 
                    onClick={handleDateTimeConfirm}
                    className="w-full bg-[#003527] text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-[#0b513d] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                  >
                    Weiter zur Dateneingabe <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            )}

            {/* STEP 3: CLIENT DETAILS */}
            {step === 3 && selectedService && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep(2)} className="text-xs font-bold text-[#003527] flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Zurück
                  </button>
                  <span className="text-xs font-bold text-zinc-400">
                    {new Date(selectedDate).toLocaleDateString('de-DE')} um {selectedTime} Uhr
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#043F2D]">Deine Kontaktdaten</h2>
                  <p className="text-xs text-zinc-400 font-semibold mt-1">Bitte trage deine Daten ein, um die Buchung abzuschließen.</p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="relative border border-[#bfc9c3]/50 bg-white rounded-2xl px-4 py-3 flex items-center">
                    <User className="w-4 h-4 text-[#003527]/40 mr-3" />
                    <input 
                      type="text" 
                      required 
                      placeholder="Dein vollständiger Name" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="flex-grow border-none outline-none font-bold text-sm text-[#003527] bg-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative border border-[#bfc9c3]/50 bg-white rounded-2xl px-4 py-3 flex items-center">
                      <Mail className="w-4 h-4 text-[#003527]/40 mr-3" />
                      <input 
                        type="email" 
                        required 
                        placeholder="E-Mail-Adresse" 
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="flex-grow border-none outline-none font-bold text-sm text-[#003527] bg-transparent"
                      />
                    </div>
                    <div className="relative border border-[#bfc9c3]/50 bg-white rounded-2xl px-4 py-3 flex items-center">
                      <Phone className="w-4 h-4 text-[#003527]/40 mr-3" />
                      <input 
                        type="tel" 
                        required 
                        placeholder="Telefonnummer" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="flex-grow border-none outline-none font-bold text-sm text-[#003527] bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="border border-[#bfc9c3]/50 bg-white rounded-2xl px-4 py-3">
                    <textarea 
                      placeholder="Nachricht an den Therapeuten (z.B. Symptome, Vorerkrankungen)" 
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      className="w-full border-none outline-none font-bold text-sm text-[#003527] bg-transparent h-20 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#003527] text-white py-3.5 rounded-2xl font-bold text-xs hover:bg-[#0b513d] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
                  >
                    Kostenpflichtig buchen ({selectedService.price.toFixed(2)} €)
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && selectedService && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-6"
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
                
                <div>
                  <h2 className="text-3xl font-serif font-bold text-[#043F2D]">Termin erfolgreich gebucht!</h2>
                  <p className="text-xs text-zinc-400 font-semibold mt-1">Wir haben dir eine Bestätigungs-E-Mail gesendet.</p>
                </div>

                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 max-w-sm mx-auto text-left space-y-3">
                  <div className="text-xs font-bold text-[#003527] uppercase tracking-wide border-b border-[#bfc9c3]/30 pb-2">Termindetails:</div>
                  <div className="text-xs text-[#003527]/80">
                    <p><strong>Behandlung:</strong> {selectedService.name}</p>
                    <p className="mt-1"><strong>Datum:</strong> {new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p className="mt-1"><strong>Uhrzeit:</strong> {selectedTime} Uhr ({selectedService.duration} Minuten)</p>
                    <p className="mt-1"><strong>Praxis:</strong> {practiceName}</p>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                  Du erhältst 24 Stunden vor deinem Termin eine automatische E-Mail-Erinnerung zur Vermeidung von No-Shows.
                </p>

                <div className="pt-4">
                  <Link href="/" className="inline-block bg-[#003527] text-white px-8 py-3 rounded-full text-xs font-bold transition-all">
                    Zurück zur Startseite
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#bfc9c3]/30 text-center text-[10px] text-zinc-400">
        &copy; {new Date().getFullYear()} {practiceName} • Powered by PraxisManager
      </footer>
    </div>
  );
}
