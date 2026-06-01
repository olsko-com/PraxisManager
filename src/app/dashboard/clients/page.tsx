'use client';

import React from 'react';
import { 
  Plus, Search, Mail, Calendar as CalendarIcon, Paperclip, FileText, 
  Edit2, Trash2, Star, Flag, ChevronRight, MoreVertical, User, Phone, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { Client, SoapNote, Invoice } from '@/lib/types';

interface ClientListItemProps {
  client: Client;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onToggleFlag: () => void;
  onDelete: () => void;
  onSendMail: () => void;
  onAddAppointment: () => void;
}

function ClientListItem({ 
  client, isSelected, onSelect, onToggleFavorite, onToggleFlag, onDelete, onSendMail, onAddAppointment 
}: ClientListItemProps) {
  const [swipeState, setSwipeState] = React.useState<'left' | 'right' | 'closed'>('closed');

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      setSwipeState('left');
    } else if (info.offset.x > 50) {
      setSwipeState('right');
    } else {
      setSwipeState('closed');
    }
  };

  const xOffset = swipeState === 'left' ? -128 : swipeState === 'right' ? 64 : 0;

  return (
    <div className="relative overflow-hidden border-b border-[#bfc9c3]/30 select-none bg-[#bfc9c3]/10">
      {/* Behind layer left: Flag button (revealed when swiping right) */}
      <div className="absolute left-0 top-0 bottom-0 flex z-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFlag();
            setSwipeState('closed');
          }}
          className={`w-16 flex flex-col items-center justify-center transition-colors cursor-pointer text-[10px] font-bold gap-1 border-r border-[#bfc9c3]/30 ${
            client.isFlagged 
              ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Flag className={`w-3.5 h-3.5 ${client.isFlagged ? 'fill-current' : ''}`} />
          <span>{client.isFlagged ? 'Un-Flag' : 'Markieren'}</span>
        </button>
      </div>

      {/* Behind layer right: Action buttons (revealed when swiping left) */}
      <div className="absolute right-0 top-0 bottom-0 flex z-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
            setSwipeState('closed');
          }}
          className={`w-16 flex flex-col items-center justify-center transition-colors cursor-pointer text-[10px] font-bold gap-1 ${
            client.isFavorite 
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${client.isFavorite ? 'fill-current' : ''}`} />
          <span>{client.isFavorite ? 'Un-Fav' : 'Favorit'}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setSwipeState('closed');
          }}
          className="w-16 bg-rose-50 text-rose-600 hover:bg-rose-100 flex flex-col items-center justify-center border-l border-[#bfc9c3]/30 transition-colors cursor-pointer text-[10px] font-bold gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Löschen</span>
        </button>
      </div>

      {/* Front layer: Draggable card content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -128, right: 64 }}
        dragElastic={{ left: 0.1, right: 0.1 }}
        animate={{ x: xOffset }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (swipeState !== 'closed') {
            setSwipeState('closed');
          } else {
            onSelect();
          }
        }}
        className={`px-6 py-4 cursor-pointer flex items-center justify-between bg-white relative z-10 select-none transition-colors group ${
          isSelected 
            ? 'bg-[#003527]/5 text-[#003527]' 
            : 'hover:bg-zinc-50 text-[#404944]'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 text-left">
            <h4 className="font-bold text-xs">{client.name}</h4>
            {client.isFavorite && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            )}
            {client.isFlagged && (
              <Flag className="w-3 h-3 text-rose-500 fill-rose-500" />
            )}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 text-left">Geb: {new Date(client.birthday).toLocaleDateString('de-DE')}</p>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Hover Actions (Apple-style) */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSendMail();
              }}
              className="p-1.5 rounded-lg hover:bg-[#003527]/10 text-zinc-400 hover:text-[#003527] transition-all cursor-pointer bg-transparent border-none"
              title="E-Mail schreiben"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddAppointment();
              }}
              className="p-1.5 rounded-lg hover:bg-[#003527]/10 text-zinc-400 hover:text-[#003527] transition-all cursor-pointer bg-transparent border-none"
              title="Termin vereinbaren"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.div>
    </div>
  );
}

export default function ClientsPage() {
  const {
    clients,
    setClients,
    appointments,
    invoices,
    setInvoices,
    soapNotes,
    clientDocuments,
    setClientDocuments,
    selectedClientId,
    setSelectedClientId,
    clientSearch,
    setClientSearch,
    clientFilter,
    setClientFilter,
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    setIsNewClientModalOpen,
    setIsMailModalOpen,
    setSelectedMailInvoiceId,
    setSelectedMailAppointmentId,
    applyMailTemplate,
    services,
    setIsSheetOpen,
    setSheetMode,
    setNewAppDate,
    setNewAppHour,
    setNewAppClientId,
    setNewAppServiceId,
    createSoapNote,
    startEditSoap,
    soapEditId,
    soapSubjective,
    setSoapSubjective,
    soapObjective,
    setSoapObjective,
    soapAssessment,
    setSoapAssessment,
    soapPlan,
    setSoapPlan,
    saveSoapNote,
    showToast
  } = useDashboard();

  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = React.useState(false);

  const currentClient = clients.find(c => c.id === selectedClientId);
  const clientSoapNotes = soapNotes.filter(n => n.clientId === selectedClientId);

  return (
    <div className="flex-grow flex min-h-0 h-screen overflow-hidden relative">
      {/* Left Side: Client List as a secondary Sidebar */}
      <div className="fixed left-64 top-0 bottom-0 w-80 bg-white border-r border-[#bfc9c3]/30 flex flex-col z-40">
        <div className="p-6 pt-8 space-y-4">
          <div className="flex justify-between items-center">
            {(() => {
              const count = clients.filter(c => {
                if (clientFilter === 'upcoming') {
                  return appointments.some(a => a.clientId === c.id && new Date(a.startTime) >= new Date(new Date().setHours(0,0,0,0)));
                }
                if (clientFilter === 'invoices') {
                  return invoices.some(i => i.clientId === c.id && (i.status === 'open' || i.status === 'overdue'));
                }
                return true;
              }).length;
              return <h3 className="text-sm font-bold text-[#003527]">Patienten ({count})</h3>;
            })()}
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-[#003527] hover:bg-[#003527]/5 transition-all cursor-pointer animate-fade-in"
              title="Patient anlegen"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Patient suchen..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              onFocus={() => setIsFilterMenuOpen(true)}
              onBlur={() => setTimeout(() => setIsFilterMenuOpen(false), 200)}
              className="w-full bg-[#f3f4f3] focus:bg-white border border-[#bfc9c3]/30 focus:border-[#003527]/60 focus:ring-1 focus:ring-[#003527]/60 rounded-xl pl-9 pr-4 py-2.5 font-semibold text-xs text-[#003527] outline-none transition-all placeholder-zinc-400"
            />
          </div>

          <AnimatePresence initial={false}>
            {(isFilterMenuOpen || clientFilter !== 'all' || clientSearch !== '') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => setClientFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      clientFilter === 'all'
                        ? 'bg-[#003527] text-white'
                        : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setClientFilter('upcoming')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      clientFilter === 'upcoming'
                        ? 'bg-[#003527] text-white'
                        : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                    }`}
                  >
                    Termine
                  </button>
                  <button
                    onClick={() => setClientFilter('invoices')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      clientFilter === 'invoices'
                        ? 'bg-[#003527] text-white'
                        : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                    }`}
                  >
                    Offene Abrechnungen
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 border-t border-[#bfc9c3]/30">
          {(() => {
            const filtered = clients
              .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
              .filter(c => {
                if (clientFilter === 'upcoming') {
                  return appointments.some(a => a.clientId === c.id && new Date(a.startTime) >= new Date(new Date().setHours(0,0,0,0)));
                }
                if (clientFilter === 'invoices') {
                  return invoices.some(i => i.clientId === c.id && (i.status === 'open' || i.status === 'overdue'));
                }
                return true;
              });

            if (filtered.length === 0) {
              return (
                <div className="p-6 text-center text-xs text-zinc-400 font-medium">
                  Keine Patienten gefunden
                </div>
              );
            }

            const sorted = [...filtered].sort((a, b) => {
              if (a.isFavorite && !b.isFavorite) return -1;
              if (!a.isFavorite && b.isFavorite) return 1;
              if (a.isFlagged && !b.isFlagged) return -1;
              if (!a.isFlagged && b.isFlagged) return 1;
              return 0;
            });

            return sorted.map((c) => (
              <ClientListItem
                key={c.id}
                client={c}
                isSelected={selectedClientId === c.id}
                onSelect={() => setSelectedClientId(c.id)}
                onToggleFavorite={() => {
                  setClients((prev: Client[]) => prev.map(cl => cl.id === c.id ? { ...cl, isFavorite: !cl.isFavorite } : cl));
                }}
                onToggleFlag={() => {
                  setClients((prev: Client[]) => prev.map(cl => cl.id === c.id ? { ...cl, isFlagged: !cl.isFlagged } : cl));
                }}
                onDelete={() => {
                  if (confirm(`Möchtest du ${c.name} wirklich löschen?`)) {
                    setClients((prev: Client[]) => prev.filter(cl => cl.id !== c.id));
                    if (selectedClientId === c.id) {
                      const remaining = clients.filter(cl => cl.id !== c.id);
                      setSelectedClientId(remaining.length > 0 ? remaining[0].id : '');
                    }
                  }
                }}
                onSendMail={() => {
                  const clientInvoices = invoices.filter(i => i.clientId === c.id);
                  const clientAppointments = appointments.filter(a => a.clientId === c.id);
                  const firstInvId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                  const firstAppId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                  setSelectedMailInvoiceId(firstInvId);
                  setSelectedMailAppointmentId(firstAppId);
                  applyMailTemplate('custom', firstInvId, firstAppId, c);
                  setIsMailModalOpen(true);
                }}
                onAddAppointment={() => {
                  setSheetMode('new');
                  setNewAppDate(new Date().toISOString().slice(0, 10));
                  setNewAppHour(9);
                  setNewAppClientId(c.id);
                  if (services.length > 0) setNewAppServiceId(services[0].id);
                  setIsSheetOpen(true);
                }}
              />
            ));
          })()}
        </div>
      </div>

      {/* Right Side: Profile Details */}
      <div className="lg:ml-80 flex-grow flex flex-col min-h-0 h-screen overflow-hidden">
        {currentClient ? (
          <div className="flex-grow flex flex-col min-h-0">
            {/* Patient Header */}
            <div className="border-b border-[#bfc9c3]/30 px-12 py-6 flex justify-between items-center bg-[#f9f9f8]/95 backdrop-blur-xl z-20 flex-shrink-0">
              <div className="text-left">
                <h3 className="text-xl font-bold text-[#043F2D]">{currentClient.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">Registriert seit {new Date(currentClient.createdAt).toLocaleDateString('de-DE')}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                    const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                    const firstInvId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                    const firstAppId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                    setSelectedMailInvoiceId(firstInvId);
                    setSelectedMailAppointmentId(firstAppId);
                    applyMailTemplate('custom', firstInvId, firstAppId, currentClient);
                    setIsMailModalOpen(true);
                  }}
                  className="bg-[#003527] hover:bg-[#0b513d] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" /> Mail schreiben
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsDetailsMenuOpen(!isDetailsMenuOpen)}
                    className="p-2.5 bg-white border border-[#bfc9c3]/50 rounded-xl hover:bg-zinc-50 text-[#003527] transition-all cursor-pointer flex items-center justify-center"
                    title="Optionen anzeigen"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {isDetailsMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setIsDetailsMenuOpen(false)}
                      />
                      <div className="absolute top-12 right-0 w-52 bg-white border border-[#bfc9c3]/50 rounded-2xl shadow-xl overflow-hidden py-1.5 flex flex-col z-50 animate-fade-in text-left">
                        <button
                          onClick={() => {
                            setIsDetailsMenuOpen(false);
                            setSheetMode('new');
                            setNewAppDate(new Date().toISOString().slice(0, 10));
                            setNewAppHour(9);
                            setNewAppClientId(currentClient.id);
                            if (services.length > 0) setNewAppServiceId(services[0].id);
                            setIsSheetOpen(true);
                          }}
                          className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-[#003527]/70" />
                          Termin hinzufügen
                        </button>
                        <button
                          onClick={() => {
                            setIsDetailsMenuOpen(false);
                            const name = prompt('Dokumentenname (z.B. Rezept_Befund.pdf):');
                            if (name) {
                              const docs = clientDocuments[currentClient.id] || [];
                              setClientDocuments((prev: Record<string, {name: string, size: string}[]>) => ({
                                ...prev,
                                [currentClient.id]: [...docs, { name, size: '150 KB' }]
                              }));
                              showToast('Dokument erfolgreich hinzugefügt.', 'success');
                            }
                          }}
                          className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100/80"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-[#003527]/70" />
                          Dokument hinzufügen
                        </button>
                        <button
                          onClick={() => {
                            setIsDetailsMenuOpen(false);
                            const amountStr = prompt('Rechnungsbetrag in € eingeben (z.B. 90.00):');
                            if (amountStr) {
                              const amount = parseFloat(amountStr.replace(',', '.'));
                              if (!isNaN(amount) && amount > 0) {
                                const num = invoices.length + 1;
                                const invNum = `RE-2026-${num.toString().padStart(4, '0')}`;
                                const newInv = {
                                  id: `i-${Date.now()}`,
                                  appointmentId: `custom-${Date.now()}`,
                                  clientId: currentClient.id,
                                  clientName: currentClient.name,
                                  invoiceNumber: invNum,
                                  amount: amount,
                                  date: new Date().toISOString().slice(0, 10),
                                  status: 'open' as const
                                };
                                setInvoices((prev: Invoice[]) => [...prev, newInv]);
                                showToast(`Rechnung ${invNum} über ${amount.toFixed(2)} € erstellt!`, 'success');
                              } else {
                                showToast('Ungültiger Betrag.', 'error');
                              }
                            }
                          }}
                          className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100/80"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#003527]/70" />
                          Rechnung erstellen
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable details content */}
            <div className="flex-grow overflow-y-auto px-12 py-8 space-y-6">
              {/* Quick profile info grid (Bento Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bento Card 1: Stammdaten */}
                <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] relative group overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                        Stammdaten
                      </span>
                    </div>
                    <div className="space-y-3.5 text-left pt-1">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Geburtstag</span>
                        <span className="block text-xs font-extrabold text-[#003527]">{new Date(currentClient.birthday).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Mitglied seit</span>
                        <span className="block text-xs font-extrabold text-[#003527]">{new Date(currentClient.createdAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Kontakt */}
                <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] relative group overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                        Erreichbarkeit
                      </span>
                    </div>
                    <div className="space-y-3.5 text-left pt-1">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">Telefon</span>
                        <span className="block text-xs font-extrabold text-[#003527]">{currentClient.phone || 'Keine Angabe'}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium text-zinc-400">E-Mail</span>
                        <span className="block text-xs font-extrabold text-[#003527] break-all">{currentClient.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Card 3: Notfallkontakt */}
                <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] relative group overflow-hidden">
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200/40 text-rose-700">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                        Notfallkontakt
                      </span>
                    </div>
                    <div className="space-y-3 text-left pt-3 min-h-[82px] flex flex-col justify-center">
                      <p className="text-xs font-extrabold text-[#003527] leading-relaxed">
                        {currentClient.emergencyContact || 'Kein Notfallkontakt hinterlegt'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Row 2: Notes & Document Locker side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bento Card 4: Medizinische Notizen / Anamnese (col-span-2) */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] relative group overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                        Praxisnotizen & Anamnese
                      </span>
                    </div>
                    <div className="text-left pt-1">
                      <p className="text-xs font-semibold leading-relaxed text-[#404944] min-h-[60px]">
                        {currentClient.notes || 'Keine medizinischen Notizen hinterlegt.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bento Card 5: Dokumente locker (col-span-1) */}
                <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] relative group overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <button 
                        onClick={() => {
                          const name = prompt('Dokumentenname (z.B. Rezept_Befund.pdf):');
                          if (name) {
                            const docs = clientDocuments[currentClient.id] || [];
                            setClientDocuments((prev: Record<string, {name: string, size: string}[]>) => ({
                              ...prev,
                              [currentClient.id]: [...docs, { name, size: '150 KB' }]
                            }));
                            showToast('Dokument erfolgreich hinzugefügt.', 'success');
                          }
                        }}
                        className="text-[9px] font-bold text-[#003527] hover:text-[#0b513d] flex items-center gap-0.5 transition-colors cursor-pointer bg-zinc-100 hover:bg-[#003527]/5 border border-transparent rounded-md px-2 py-0.5"
                      >
                        + PDF
                      </button>
                    </div>

                    <div className="space-y-2 text-left">
                      {(clientDocuments[currentClient.id] || []).length > 0 ? (
                        <div className="max-h-[110px] overflow-y-auto pr-1 space-y-1.5 hide-scrollbar">
                          {(clientDocuments[currentClient.id] || []).map((doc, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-[#404944] bg-zinc-50 border border-zinc-200/30 p-2 rounded-lg hover:border-zinc-200 transition-all">
                              <span className="flex items-center gap-1.5 min-w-0 pr-2">
                                <FileText className="w-3.5 h-3.5 text-[#003527]/60 flex-shrink-0" />
                                <span className="truncate" title={doc.name}>{doc.name}</span>
                              </span>
                              <a href="#" className="text-[9px] font-extrabold text-[#003527] hover:underline flex-shrink-0">Ansehen</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-[10px] text-zinc-400 font-medium italic">
                          Keine Dokumente abgelegt
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SOAP Notes Section */}
              <div className="space-y-4 pt-4 border-t border-[#bfc9c3]/20 text-left">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest">Therapieverlauf (SOAP-Notes)</h4>
                  <button 
                    onClick={() => createSoapNote(`app-${Date.now()}`, currentClient.id)}
                    className="bg-[#003527] hover:bg-[#0b513d] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Eintrag anlegen
                  </button>
                </div>

                <div className="space-y-4">
                  {clientSoapNotes.length > 0 ? (
                    clientSoapNotes.map((note) => (
                      <div key={note.id} className="bg-white border border-[#bfc9c3]/30 rounded-2xl p-5 space-y-4 hover:border-[#bfc9c3]/50 transition-all duration-300 relative group overflow-hidden shadow-[0_4px_20px_rgba(0,53,39,0.01)]">
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200/30 text-emerald-700">
                              <CalendarIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-extrabold text-[#003527] uppercase tracking-wider">Eintrag vom {new Date(note.date).toLocaleDateString('de-DE')}</span>
                          </div>
                          {soapEditId === note.id ? (
                            <button onClick={saveSoapNote} className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer border-none bg-transparent p-0">Speichern</button>
                          ) : (
                            <button onClick={() => startEditSoap(note)} className="text-[10px] font-extrabold text-zinc-400 hover:text-[#003527] transition-colors flex items-center gap-0.5 cursor-pointer border-none bg-transparent p-0 opacity-0 group-hover:opacity-100">
                              <Edit2 className="w-3 h-3" /> Bearbeiten
                            </button>
                          )}
                        </div>

                        {soapEditId === note.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                            <div className="space-y-1.5">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Subjective (Befund)</label>
                              <textarea 
                                value={soapSubjective} 
                                onChange={(e) => setSoapSubjective(e.target.value)} 
                                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-2.5 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Objective (Untersuchung)</label>
                              <textarea 
                                value={soapObjective} 
                                onChange={(e) => setSoapObjective(e.target.value)} 
                                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-2.5 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Assessment (Beurteilung)</label>
                              <textarea 
                                value={soapAssessment} 
                                onChange={(e) => setSoapAssessment(e.target.value)} 
                                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-2.5 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#003527]/70">Plan (Fortsetzung)</label>
                              <textarea 
                                value={soapPlan} 
                                onChange={(e) => setSoapPlan(e.target.value)} 
                                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-2.5 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[60px]" 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50/50 border border-zinc-200/20 rounded-xl p-3.5 space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-800 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">S</span>
                                <span className="block text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">Subjective (Befund)</span>
                              </div>
                              <p className="text-xs text-[#404944] font-medium leading-relaxed italic">{note.subjective}</p>
                            </div>
                            <div className="bg-zinc-50/50 border border-zinc-200/20 rounded-xl p-3.5 space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-blue-800 bg-blue-50 border border-blue-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">O</span>
                                <span className="block text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">Objective (Untersuchung)</span>
                              </div>
                              <p className="text-xs text-[#404944] font-medium leading-relaxed">{note.objective}</p>
                            </div>
                            <div className="bg-zinc-50/50 border border-zinc-200/20 rounded-xl p-3.5 space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">A</span>
                                <span className="block text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">Assessment (Beurteilung)</span>
                              </div>
                              <p className="text-[#404944] text-xs font-medium leading-relaxed">{note.assessment}</p>
                            </div>
                            <div className="bg-zinc-50/50 border border-zinc-200/20 rounded-xl p-3.5 space-y-1.5 text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-purple-800 bg-purple-50 border border-purple-200/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">P</span>
                                <span className="block text-[9px] font-extrabold tracking-widest text-zinc-400 uppercase">Plan (Fortsetzung)</span>
                              </div>
                              <p className="text-[#404944] text-xs font-medium leading-relaxed">{note.plan}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-zinc-400 font-semibold italic bg-white border border-[#bfc9c3]/20 rounded-2xl shadow-[0_4px_20px_rgba(0,53,39,0.01)]">Keine Behandlungsberichte für diesen Patienten vorhanden.</div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-rose-200/30 flex justify-between items-center text-left">
                <div>
                  <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Gefahrenbereich</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Diesen Patienten unwiderruflich aus der Datenbank entfernen.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Möchtest du diesen Patienten wirklich löschen?')) {
                      setClients((prev: Client[]) => prev.filter(c => c.id !== currentClient.id));
                      setSelectedClientId(clients.find(c => c.id !== currentClient.id)?.id || '');
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/30"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Patient löschen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-xs text-zinc-400 font-semibold italic">
            Bitte wähle einen Patienten aus der Liste aus.
          </div>
        )}
      </div>
    </div>
  );
}
