'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, Users, FileText, Settings, User } from 'lucide-react';
import { useDashboard } from '@/app/dashboard/context';
import { useRouter } from 'next/navigation';

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

interface SearchResultItem {
  id: string;
  type: 'action' | 'patient' | 'appointment' | 'invoice';
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  initials?: string;
  initialsColor?: string;
  icon?: React.ElementType;
  onSelect: () => void;
}

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};

export default function CommandPalette({ isOpen, setIsOpen, actions }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    clients,
    appointments,
    invoices,
    services,
    setSelectedClientId,
    setIsNewClientModalOpen,
    setIsNewInvoiceSheetOpen,
    setIsSheetOpen,
    setSheetMode,
    setNewAppDate,
    setNewAppHour,
    setNewAppClientId,
    setNewAppServiceId
  } = useDashboard();

  const allFilteredItems: SearchResultItem[] = [];
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === '') {
    // 1. Actions / Aktionen
    allFilteredItems.push(
      {
        id: 'action-new-patient',
        type: 'action',
        title: 'Neuen Patienten anlegen',
        subtitle: 'Patientenstamm erweitern',
        icon: Plus,
        onSelect: () => {
          setIsNewClientModalOpen(true);
        }
      },
      {
        id: 'action-new-appt',
        type: 'action',
        title: 'Neuen Termin planen',
        subtitle: 'Terminkalender befüllen',
        icon: Calendar,
        onSelect: () => {
          setSheetMode('new');
          setNewAppDate(new Date().toISOString().slice(0, 10));
          setNewAppHour(9);
          if (clients.length > 0) setNewAppClientId(clients[0].id);
          if (services.length > 0) setNewAppServiceId(services[0].id);
          setIsSheetOpen(true);
        }
      },
      {
        id: 'action-new-invoice',
        type: 'action',
        title: 'Neue Rechnung erstellen',
        subtitle: 'Leistungen abrechnen',
        icon: FileText,
        onSelect: () => {
          setIsNewInvoiceSheetOpen(true);
        }
      }
    );

    // 2. Recent patients / Zuletzt geöffnet
    clients.slice(0, 4).forEach(patient => {
      allFilteredItems.push({
        id: `patient-${patient.id}`,
        type: 'patient',
        title: patient.name,
        subtitle: `${patient.phone || 'Keine Telefonnummer'} • Geb. ${patient.birthday || 'k.A.'}`,
        initials: getInitials(patient.name),
        initialsColor: patient.isFavorite ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' : 'bg-zinc-100 text-zinc-800',
        onSelect: () => {
          setSelectedClientId(patient.id);
          router.push('/dashboard/clients');
        }
      });
    });
  } else if (normalizedQuery === 'neu') {
    // Only show creation shortcuts
    allFilteredItems.push(
      {
        id: 'action-new-patient',
        type: 'action',
        title: 'Neuen Patienten anlegen',
        subtitle: 'Patientenstamm erweitern',
        icon: Plus,
        onSelect: () => {
          setIsNewClientModalOpen(true);
        }
      },
      {
        id: 'action-new-appt',
        type: 'action',
        title: 'Neuen Termin planen',
        subtitle: 'Terminkalender befüllen',
        icon: Calendar,
        onSelect: () => {
          setSheetMode('new');
          setNewAppDate(new Date().toISOString().slice(0, 10));
          setNewAppHour(9);
          if (clients.length > 0) setNewAppClientId(clients[0].id);
          if (services.length > 0) setNewAppServiceId(services[0].id);
          setIsSheetOpen(true);
        }
      },
      {
        id: 'action-new-invoice',
        type: 'action',
        title: 'Neue Rechnung erstellen',
        subtitle: 'Leistungen abrechnen',
        icon: FileText,
        onSelect: () => {
          setIsNewInvoiceSheetOpen(true);
        }
      }
    );
  } else {
    // 1. Actions / Commands matching query
    actions.filter(action => 
      action.title.toLowerCase().includes(normalizedQuery)
    ).forEach(action => {
      allFilteredItems.push({
        id: `action-${action.id}`,
        type: 'action',
        title: action.title,
        icon: action.icon,
        onSelect: action.onSelect
      });
    });

    // 2. Patients matching name, phone or email
    clients.filter(patient => 
      patient.name.toLowerCase().includes(normalizedQuery) ||
      (patient.phone && patient.phone.toLowerCase().includes(normalizedQuery)) ||
      (patient.email && patient.email.toLowerCase().includes(normalizedQuery))
    ).slice(0, 5).forEach(patient => {
      allFilteredItems.push({
        id: `patient-${patient.id}`,
        type: 'patient',
        title: patient.name,
        subtitle: `${patient.phone || 'Keine Telefonnummer'} • Geb. ${patient.birthday || 'k.A.'}`,
        initials: getInitials(patient.name),
        initialsColor: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        onSelect: () => {
          setSelectedClientId(patient.id);
          router.push('/dashboard/clients');
        }
      });
    });

    // 3. Appointments matching clientName or serviceName
    appointments.filter(appt => 
      appt.clientName.toLowerCase().includes(normalizedQuery) ||
      appt.serviceName.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5).forEach(appt => {
      let dateStr = '';
      try {
        const d = new Date(appt.startTime);
        dateStr = d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' Uhr';
      } catch (e) {
        dateStr = appt.startTime;
      }

      let statusColor = 'bg-zinc-100 text-zinc-600 border border-zinc-200/50';
      let statusLabel = 'Gebucht';
      if (appt.status === 'confirmed') {
        statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        statusLabel = 'Bestätigt';
      } else if (appt.status === 'noshow') {
        statusColor = 'bg-rose-50 text-rose-700 border border-rose-100';
        statusLabel = 'Ausfall';
      } else if (appt.status === 'cancelled') {
        statusColor = 'bg-zinc-200 text-zinc-500 border border-zinc-350';
        statusLabel = 'Storniert';
      }

      allFilteredItems.push({
        id: `appt-${appt.id}`,
        type: 'appointment',
        title: appt.serviceName,
        subtitle: `${dateStr} • ${appt.clientName}`,
        badge: statusLabel,
        badgeColor: statusColor,
        icon: Calendar,
        onSelect: () => {
          router.push('/dashboard/calendar');
        }
      });
    });

    // 4. Invoices matching invoiceNumber, clientName or status
    invoices.filter(inv => 
      inv.invoiceNumber.toLowerCase().includes(normalizedQuery) ||
      inv.clientName.toLowerCase().includes(normalizedQuery) ||
      inv.status.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5).forEach(inv => {
      let statusColor = 'bg-zinc-100 text-zinc-600 border border-zinc-200/50';
      let statusLabel = 'Offen';
      if (inv.status === 'paid') {
        statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
        statusLabel = 'Bezahlt';
      } else if (inv.status === 'overdue') {
        statusColor = 'bg-rose-50 text-rose-700 border border-rose-100';
        statusLabel = 'Überfällig';
      }

      allFilteredItems.push({
        id: `invoice-${inv.id}`,
        type: 'invoice',
        title: `${inv.invoiceNumber} für ${inv.clientName}`,
        subtitle: `Betrag: ${inv.amount.toFixed(2)} € • Datum: ${new Date(inv.date).toLocaleDateString('de-DE')}`,
        badge: statusLabel,
        badgeColor: statusColor,
        icon: FileText,
        onSelect: () => {
          router.push('/dashboard/invoices');
        }
      });
    });
  }

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
        setActiveIndex(prev => (prev + 1) % (allFilteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + allFilteredItems.length) % (allFilteredItems.length || 1));
      } else if (e.key === 'Enter' && allFilteredItems.length > 0) {
        e.preventDefault();
        allFilteredItems[activeIndex].onSelect();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allFilteredItems, activeIndex, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] sm:pt-[15vh] px-4 pb-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-zinc-900/45"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-[#f9f9f8] rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-[#bfc9c3]/40 overflow-hidden relative z-10 flex flex-col"
          >
            {/* Input Area */}
            <div className="flex items-center px-6 py-4.5 border-b border-[#bfc9c3]/35 bg-white relative">
              <Search className="h-5.5 w-5.5 text-[#003527]/35 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suche nach Patienten, Rechnungen, Terminen oder tippe 'neu'..."
                className="flex-1 bg-transparent border-none outline-none text-[17px] font-bold text-[#003527] placeholder:text-[#003527]/30"
              />
              <span className="text-[10px] font-mono font-bold text-[#003527]/40 bg-[#f3f4f3] px-2 py-1 rounded">ESC</span>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-3.5 space-y-1.5 no-scrollbar">
              {allFilteredItems.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="bg-[#bfc9c3]/15 p-4 rounded-full mb-3 text-[#003527]/40">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-[#003527]/60 font-bold">Keine Ergebnisse für "{query}"</p>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Überprüfe die Schreibweise oder lege einen neuen Eintrag an.</p>
                </div>
              ) : (
                (() => {
                  let currentType = '';
                  return allFilteredItems.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    
                    let categoryHeader = null;
                    if (item.type !== currentType) {
                      currentType = item.type;
                      const typeLabel = 
                        item.type === 'action' ? 'Aktionen' : 
                        item.type === 'patient' ? 'Patienten' : 
                        item.type === 'appointment' ? 'Termine' : 'Rechnungen';
                      categoryHeader = (
                        <div className="px-3 pt-3.5 pb-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#003527]/35 text-left">
                          {typeLabel}
                        </div>
                      );
                    }

                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="text-left">
                        {categoryHeader}
                        
                        <div 
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer border border-transparent select-none relative group overflow-hidden ${
                            isActive 
                              ? 'bg-[#003527]/5 text-[#003527]' 
                              : 'bg-transparent text-[#043F2D]'
                          }`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            item.onSelect();
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            {/* Initials / Avatar / Icon */}
                            {item.type === 'patient' && item.initials ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[11px] mr-3 shrink-0 ${
                                item.initialsColor || 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {item.initials}
                              </div>
                            ) : (
                              Icon && (
                                <div className="p-1.5 rounded-xl mr-3 shrink-0 bg-[#003527]/5 text-[#003527]/60">
                                  <Icon className="w-4 h-4" />
                                </div>
                              )
                            )}

                            {/* Details */}
                            <div className="text-left min-w-0 flex-1">
                              <p className="text-xs font-bold truncate text-[#003527]">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-[10px] font-semibold truncate text-zinc-400">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Badge or Quick Actions */}
                          <div className="flex items-center shrink-0 ml-3 z-10">
                            {item.badge && (item.type !== 'patient' || !isActive) && (
                              <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}

                            {/* Hover Actions for Patients */}
                            {item.type === 'patient' && (
                              <div className={`flex items-center gap-1.5 transition-all duration-200 ${
                                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
                              }`}>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClientId(item.id.replace('patient-', ''));
                                    router.push('/dashboard/clients');
                                    setIsOpen(false);
                                  }}
                                  className="px-2.5 py-1 text-[9px] font-extrabold bg-white text-[#003527] rounded-lg shadow-sm border border-zinc-200/50 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                                >
                                  Akte öffnen
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSheetMode('new');
                                    setNewAppDate(new Date().toISOString().slice(0, 10));
                                    setNewAppHour(9);
                                    setNewAppClientId(item.id.replace('patient-', ''));
                                    if (services.length > 0) setNewAppServiceId(services[0].id);
                                    setIsSheetOpen(true);
                                    setIsOpen(false);
                                  }}
                                  className="px-2.5 py-1 text-[9px] font-extrabold bg-[#003527] text-white rounded-lg shadow-sm border border-transparent hover:bg-[#0b513d] active:scale-95 transition-all cursor-pointer"
                                >
                                  Termin
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#bfc9c3]/30 bg-zinc-50 px-6 py-3 flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-zinc-200 rounded px-1 py-0.5 shadow-sm text-zinc-500 font-mono">↑</kbd> 
                  <kbd className="bg-white border border-zinc-200 rounded px-1 py-0.5 shadow-sm text-zinc-500 font-mono">↓</kbd> Navigieren
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-zinc-200 rounded px-1.5 py-0.5 shadow-sm text-zinc-500 font-mono">↵</kbd> Auswählen
                </span>
              </div>
              <div className="uppercase tracking-widest text-[9px] font-extrabold text-[#003527]/30">HManager Search v1.1</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
