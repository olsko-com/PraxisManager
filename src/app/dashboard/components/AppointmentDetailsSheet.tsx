'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, User, Calendar as CalendarIcon, Clock, FileText, Printer, Sparkles, Trash2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

export default function AppointmentDetailsSheet() {
  const router = useRouter();
  const {
    isSheetOpen,
    setIsSheetOpen,
    sheetMode,
    selectedAppointment,
    setSelectedAppointment,
    newAppDate,
    setNewAppDate,
    newAppHour,
    setNewAppHour,
    newAppClientId,
    setNewAppClientId,
    newAppServiceId,
    setNewAppServiceId,
    clients,
    services,
    appointments,
    setAppointments,
    invoices,
    soapNotes,
    markInvoicePaid,
    printInvoice,
    openNewInvoiceSheetWithPrefill,
    createSoapNote,
    startEditSoap,
    setSelectedClientId,
    showToast
  } = useDashboard();

  if (!isSheetOpen) return null;

  const formatAppTimeRange = (startTimeStr: string, durationMin: number) => {
    const start = new Date(startTimeStr);
    const end = new Date(start.getTime() + durationMin * 60000);
    const startStr = start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppDate || !newAppClientId || !newAppServiceId) return;

    const cli = clients.find(c => c.id === newAppClientId);
    const srv = services.find(s => s.id === newAppServiceId);
    if (!cli || !srv) return;

    const start = new Date(newAppDate);
    start.setHours(newAppHour, 0, 0, 0);
    const end = new Date(start.getTime() + srv.duration * 60000);

    const newApp = {
      id: `a-${Date.now()}`,
      clientId: cli.id,
      clientName: cli.name,
      serviceId: srv.id,
      serviceName: srv.name,
      price: srv.price,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'booked' as const
    };

    setAppointments(prev => [...prev, newApp]);
    setIsSheetOpen(false);
    showToast('Termin erfolgreich eingetragen.', 'success');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsSheetOpen(false)}
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[80]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[90] p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div>
          <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
            <h3 className="text-lg font-bold text-[#043F2D]">
              {sheetMode === 'new' ? 'Neuer Termin' : 'Termindetails'}
            </h3>
            <button 
              onClick={() => setIsSheetOpen(false)}
              className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {sheetMode === 'new' ? (
            <form onSubmit={handleCreateAppointment} className="space-y-5 text-left">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Patient / Klient</label>
                <select
                  value={newAppClientId}
                  onChange={(e) => setNewAppClientId(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Leistung</label>
                <select
                  value={newAppServiceId}
                  onChange={(e) => setNewAppServiceId(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration} Min - {s.price} €)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Datum</label>
                  <input
                    type="date"
                    value={newAppDate}
                    onChange={(e) => setNewAppDate(e.target.value)}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Uhrzeit (Start)</label>
                  <select
                    value={newAppHour}
                    onChange={(e) => setNewAppHour(parseInt(e.target.value))}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] cursor-pointer"
                  >
                    {Array.from({ length: 8 }).map((_, i) => {
                      const hr = i + 9;
                      return (
                        <option key={hr} value={hr}>{hr.toString().padStart(2, '0')}:00 Uhr</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs mt-6 transition-all cursor-pointer border-none"
              >
                Termin eintragen
              </button>
            </form>
          ) : (
            selectedAppointment && (
              <div className="space-y-6 text-left">
                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-[1.5rem] p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-extrabold text-[#003527] bg-[#003527]/5 border border-[#003527]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedAppointment.serviceName.split(' ')[0]}
                    </span>
                    <span className="font-extrabold text-sm text-[#003527]">{selectedAppointment.price.toFixed(2)} €</span>
                  </div>
                  
                  <h4 className="font-extrabold text-sm text-[#043F2D] leading-tight">{selectedAppointment.serviceName}</h4>
                  
                  <div className="space-y-1.5 text-xs text-[#404944] font-semibold">
                    <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#003527]/60" /> {selectedAppointment.clientName}</p>
                    <p className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5 text-[#003527]/60" /> {new Date(selectedAppointment.startTime).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#003527]/60" /> {formatAppTimeRange(selectedAppointment.startTime, Math.round((new Date(selectedAppointment.endTime).getTime() - new Date(selectedAppointment.startTime).getTime()) / 60000))} Uhr</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Status ändern</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'booked', label: 'Reserviert', activeClass: 'bg-amber-500 text-white border-amber-500', defaultClass: 'bg-amber-50 text-amber-800 border-amber-200' },
                      { id: 'confirmed', label: 'Bestätigt', activeClass: 'bg-blue-600 text-white border-blue-600', defaultClass: 'bg-blue-50 text-blue-800 border-blue-200' },
                      { id: 'noshow', label: 'Erledigt', activeClass: 'bg-emerald-600 text-white border-emerald-600', defaultClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                      { id: 'cancelled', label: 'Absage', activeClass: 'bg-rose-500 text-white border-rose-500', defaultClass: 'bg-rose-50 text-rose-800 border-rose-200' }
                    ].map((st) => {
                      const isActive = selectedAppointment.status === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            const updated = { ...selectedAppointment, status: st.id as any };
                            setSelectedAppointment(updated);
                            setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                          }}
                          className={`flex-1 py-2 text-[10px] font-bold border rounded-xl transition-all cursor-pointer ${
                            isActive ? st.activeClass : st.defaultClass
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#003527]" /> Abrechnung & Rechnung
                  </h4>
                  
                  {(() => {
                    const invoice = invoices.find(inv => inv.appointmentId === selectedAppointment.id);
                    if (invoice) {
                      return (
                        <div className="flex justify-between items-center text-xs font-semibold text-[#404944]">
                          <div 
                            onClick={() => {
                              setIsSheetOpen(false);
                              router.push('/dashboard/invoices');
                            }}
                            className="cursor-pointer hover:bg-zinc-100/80 p-1.5 rounded-lg transition-colors text-left"
                            title="Zur Rechnung navigieren"
                          >
                            <p className="font-bold text-[#003527]">Rechnungsnummer: {invoice.invoiceNumber}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Erstellt am: {new Date(invoice.date).toLocaleDateString('de-DE')}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                              invoice.status === 'paid' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}>
                              {invoice.status === 'paid' ? 'Bezahlt' : 'Offen'}
                            </span>
                            {invoice.status === 'open' && (
                              <button 
                                onClick={() => markInvoicePaid(invoice.id)}
                                className="text-[9px] bg-emerald-600 text-white px-2 py-1 rounded transition-colors cursor-pointer border-none"
                              >
                                Bezahlen
                              </button>
                            )}
                            <button 
                              onClick={() => printInvoice(invoice)}
                              className="p-1 bg-zinc-200 hover:bg-zinc-300 text-[#003527] rounded transition-colors cursor-pointer border-none"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-zinc-400 italic font-semibold">Keine Rechnung für diesen Termin erstellt.</span>
                          <button 
                            onClick={() => openNewInvoiceSheetWithPrefill({
                              clientId: selectedAppointment.clientId,
                              amount: selectedAppointment.price,
                              appointmentId: selectedAppointment.id,
                              clientName: selectedAppointment.clientName,
                              date: selectedAppointment.startTime.slice(0, 10)
                            })}
                            className="bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border-none"
                          >
                            <Sparkles className="w-3 h-3 text-white" /> Abrechnen
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>

                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-[#043F2D] uppercase tracking-wider border-b border-zinc-200 pb-2">SOAP-Verlauf</h4>
                  {(() => {
                    const note = soapNotes.find(n => n.appointmentId === selectedAppointment.id);
                    if (note) {
                      return (
                        <div className="space-y-2 text-xs font-semibold text-[#404944]">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-400 font-bold">Diagnose / SOAP vorhanden</span>
                            <button 
                              onClick={() => {
                                setSelectedClientId(selectedAppointment.clientId);
                                startEditSoap(note);
                                setIsSheetOpen(false);
                                router.push('/dashboard/clients');
                              }}
                              className="text-[10px] text-[#003527] hover:underline flex items-center gap-0.5 cursor-pointer font-bold border-none bg-transparent"
                            >
                              Bearbeiten
                            </button>
                          </div>
                          <p className="line-clamp-2 text-zinc-500 mt-1 italic"><strong>S:</strong> {note.subjective}</p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-zinc-400 italic">Keine Behandlungsnotiz hinterlegt.</span>
                          <button 
                            onClick={() => {
                              createSoapNote(selectedAppointment.id, selectedAppointment.clientId);
                              router.push('/dashboard/clients');
                              setIsSheetOpen(false);
                            }}
                            className="text-[10px] text-[#003527] hover:underline font-bold cursor-pointer border-none bg-transparent"
                          >
                            Bericht anlegen
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Private Anmerkungen zu dieser Sitzung</label>
                  <textarea
                    rows={3}
                    value={selectedAppointment.notes || ''}
                    onChange={(e) => {
                      const updated = { ...selectedAppointment, notes: e.target.value };
                      setSelectedAppointment(updated);
                      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updated : a));
                    }}
                    placeholder="z.B. Patient kam 5 Min später, Schwerpunkt heute LWS Mobilisierung..."
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-semibold text-xs text-[#003527] focus:border-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-[#bfc9c3]/20 flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (confirm('Möchtest du diesen Termin wirklich löschen?')) {
                        setAppointments(prev => prev.filter(a => a.id !== selectedAppointment.id));
                        setIsSheetOpen(false);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" /> Termin löschen
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </motion.div>
    </>
  );
}
