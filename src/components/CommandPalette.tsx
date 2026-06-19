'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, Users, FileText, Settings, User, FolderOpen, Mail } from 'lucide-react';
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

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-50 border border-blue-200/60 text-blue-800',
    'bg-emerald-50 border border-emerald-200/60 text-emerald-800',
    'bg-purple-50 border border-purple-200/60 text-purple-800',
    'bg-amber-50 border border-amber-200/60 text-amber-800',
    'bg-rose-50 border border-rose-200/60 text-rose-800',
    'bg-teal-50 border border-teal-200/60 text-teal-800'
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function CommandPalette({ isOpen, setIsOpen, actions }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState('all');
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
    setNewAppServiceId,
    setIsMailModalOpen,
    applyMailTemplate
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
        icon: Plus,
        onSelect: () => {
          setIsNewClientModalOpen(true);
        }
      },
      {
        id: 'action-new-appt',
        type: 'action',
        title: 'Neuen Termin planen',
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
        initialsColor: patient.isFavorite ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' : getAvatarColor(patient.name),
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
        icon: Plus,
        onSelect: () => {
          setIsNewClientModalOpen(true);
        }
      },
      {
        id: 'action-new-appt',
        type: 'action',
        title: 'Neuen Termin planen',
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
        initialsColor: getAvatarColor(patient.name),
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

  const displayedItems = selectedTab === 'all'
    ? allFilteredItems
    : allFilteredItems.filter(item => item.type === selectedTab);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setSelectedTab('all');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (displayedItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + displayedItems.length) % (displayedItems.length || 1));
      } else if (e.key === 'Enter' && displayedItems.length > 0) {
        e.preventDefault();
        displayedItems[activeIndex].onSelect();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayedItems, activeIndex, setIsOpen]);

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
            className="fixed inset-0 bg-black/60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-[#bfc9c3]/40 overflow-hidden relative z-10 flex flex-col"
          >
            {/* Input Area */}
            <div className="flex items-center px-6 py-4.5 bg-white relative">
              <Search className="h-5.5 w-5.5 text-[#003527]/35 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suchen..."
                className="flex-1 bg-transparent border-none outline-none text-[17px] font-bold text-[#003527] placeholder:text-[#003527]/30"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Suche schließen"
                className="text-[10px] font-mono font-bold text-[#003527]/40 bg-[#f3f4f3] hover:bg-[#e4e5e4] active:scale-95 px-2 py-1 rounded cursor-pointer transition-all shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-[#bfc9c3]/20 bg-white overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Alle', icon: null },
                { id: 'patient', label: 'Patienten', icon: Users },
                { id: 'appointment', label: 'Termine', icon: Calendar },
                { id: 'invoice', label: 'Rechnungen', icon: FileText },
                { id: 'action', label: 'Aktionen', icon: Plus }
              ].map(tab => {
                const count = tab.id === 'all'
                  ? allFilteredItems.length
                  : allFilteredItems.filter(item => item.type === tab.id).length;

                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTab(tab.id)}
                    className={`pb-3 pt-2 text-[12px] font-extrabold transition-all border-b-2 cursor-pointer select-none shrink-0 flex items-center gap-1.5 -mb-[1px] ${
                      selectedTab === tab.id
                        ? 'border-[#003527] text-[#003527]'
                        : 'border-transparent text-[#003527]/40 hover:text-[#003527]/75'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md transition-all select-none ${
                      selectedTab === tab.id
                        ? 'bg-[#003527]/10 text-[#003527]'
                        : 'bg-zinc-100 text-[#003527]/45'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto py-1 no-scrollbar">
              {displayedItems.length === 0 ? (
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
                  return displayedItems.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    
                    let categoryHeader = null;
                    if (item.type !== currentType) {
                      currentType = item.type;
                      const typeLabel = 
                        item.type === 'action' ? 'Aktionen' : 
                        item.type === 'patient' ? 'Patienten' : 
                        item.type === 'appointment' ? 'Termine' : 'Rechnungen';
                      categoryHeader = (
                        <div className="px-6 pt-4 pb-2 text-[9px] font-extrabold uppercase tracking-widest text-[#003527]/35 text-left">
                          {typeLabel}
                        </div>
                      );
                    }

                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="text-left">
                        {categoryHeader}
                        
                        <div 
                          className={`w-full flex items-center justify-between px-6 py-3.5 transition-all cursor-pointer select-none relative group overflow-hidden ${
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
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-[11px] mr-3 shrink-0 ${
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
                                  className="p-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/60 text-[#003527] rounded-lg cursor-pointer flex items-center justify-center w-7 h-7 transition-all active:scale-95"
                                  title="Patientenakte öffnen"
                                >
                                  <FolderOpen className="w-3.5 h-3.5" />
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
                                  className="p-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/60 text-[#003527] rounded-lg cursor-pointer flex items-center justify-center w-7 h-7 transition-all active:scale-95"
                                  title="Neuen Termin vereinbaren"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const patientId = item.id.replace('patient-', '');
                                    const patientObj = clients.find(c => c.id === patientId);
                                    if (patientObj) {
                                      setSelectedClientId(patientId);
                                      applyMailTemplate('custom', undefined, undefined, patientObj);
                                      setIsMailModalOpen(true);
                                      setIsOpen(false);
                                    }
                                  }}
                                  className="p-1.5 bg-white hover:bg-zinc-50 border border-zinc-200/60 text-[#003527] rounded-lg cursor-pointer flex items-center justify-center w-7 h-7 transition-all active:scale-95"
                                  title="E-Mail senden"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Divider line inset to match content area */}
                          {idx < displayedItems.length - 1 && (
                            <div className="absolute bottom-0 left-6 right-6 h-px bg-[#bfc9c3]/15 pointer-events-none" />
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#bfc9c3]/20 bg-white px-6 py-3 flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
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
