'use client';

import React from 'react';
import { 
  Plus, Search, Mail, Calendar as CalendarIcon, Paperclip, FileText, 
  Edit2, Trash2, Star, Flag, ChevronLeft, ChevronRight, MoreVertical, User, Phone, Heart, Info,
  Check, Printer, Download, Briefcase, MapPin, Smile, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { Client, SoapNote, Invoice } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import CranioAnamnesisTab from '../components/CranioAnamnesisTab';

interface ClientListItemProps {
  client: Client;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onToggleFlag: () => void;
  onDelete: () => void;
  onSendMail: () => void;
  onAddAppointment: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function ClientListItem({ 
  client, isSelected, onSelect, onToggleFavorite, onToggleFlag, onDelete, onSendMail, onAddAppointment, onContextMenu 
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
        onContextMenu={onContextMenu}
        onClick={() => {
          if (swipeState !== 'closed') {
            setSwipeState('closed');
          } else {
            onSelect();
          }
        }}
      className={`px-6 py-4 cursor-pointer flex items-center justify-between bg-white relative z-10 select-none transition-all group ${
          isSelected 
            ? 'bg-[#003527]/8 text-[#003527] font-semibold' 
            : 'hover:bg-zinc-100/80 active:bg-[#003527]/8 text-[#404944]'
        }`}
      >
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003527] z-20" />
        )}
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
    toggleClientFavorite,
    toggleClientFlag,
    toggleClientGdpr,
    openGdprModal,
    handleClientContextMenu,
    deleteClient,
    updateClientDetails,
    markInvoicePaid,
    sendInvoiceEmail,
    printInvoice,
    downloadInvoicePdf,
    therapistId,
    appointments,
    invoices,
    setInvoices,
    soapNotes,
    setSoapNotes,
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showGdprTooltip, setShowGdprTooltip] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'anamnesis' | 'soap' | 'billing'>('overview');

  // Accordion state for SOAP notes
  const [expandedNoteIds, setExpandedNoteIds] = React.useState<Record<string, boolean>>({});

  const toggleSoapNoteExpand = (noteId: string) => {
    setExpandedNoteIds(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const handleDeleteSoapNote = async (noteId: string) => {
    if (!window.confirm('Möchten Sie diesen Behandlungsbericht wirklich unwiderruflich löschen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('soap_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        showToast(`Fehler beim Löschen des Berichts: ${error.message}`, 'error');
        return;
      }

      setSoapNotes(prev => prev.filter(note => note.id !== noteId));
      showToast('Behandlungsbericht erfolgreich gelöscht.', 'success');
    } catch (err: any) {
      showToast(`Ein unerwarteter Fehler ist aufgetreten: ${err.message}`, 'error');
    }
  };

  // Inline client editing state
  const [isEditingClient, setIsEditingClient] = React.useState(false);
  const [editSalutation, setEditSalutation] = React.useState('');
  const [editFirstName, setEditFirstName] = React.useState('');
  const [editLastName, setEditLastName] = React.useState('');
  const [editBirthday, setEditBirthday] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editAddress, setEditAddress] = React.useState('');
  const [editStreet, setEditStreet] = React.useState('');
  const [editHouseNumber, setEditHouseNumber] = React.useState('');
  const [editZipCode, setEditZipCode] = React.useState('');
  const [editCity, setEditCity] = React.useState('');
  const [editOccupation, setEditOccupation] = React.useState('');
  const [editMaritalStatus, setEditMaritalStatus] = React.useState('');
  const [editNotes, setEditNotes] = React.useState('');

  const calculateAge = (birthdayStr: string) => {
    if (!birthdayStr) return '';
    const birthDate = new Date(birthdayStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const startEditing = () => {
    if (!currentClient) return;
    setEditSalutation(currentClient.salutation || 'Keine');
    setEditFirstName(currentClient.firstName || '');
    setEditLastName(currentClient.lastName || '');
    setEditBirthday(currentClient.birthday || '');
    setEditPhone(currentClient.phone || '');
    setEditEmail(currentClient.email || '');
    setEditAddress(currentClient.address || '');
    setEditStreet(currentClient.street || '');
    setEditHouseNumber(currentClient.houseNumber || '');
    setEditZipCode(currentClient.zipCode || '');
    setEditCity(currentClient.city || '');
    setEditOccupation(currentClient.occupation || '');
    setEditMaritalStatus(currentClient.maritalStatus || '');
    setEditNotes(currentClient.notes || '');
    setIsEditingClient(true);
  };

  const saveEditing = async () => {
    if (!currentClient) return;
    const success = await updateClientDetails(currentClient.id, {
      salutation: editSalutation,
      firstName: editFirstName,
      lastName: editLastName,
      birthday: editBirthday,
      email: editEmail,
      phone: editPhone,
      address: '', // clear legacy address text field
      street: editStreet,
      houseNumber: editHouseNumber,
      zipCode: editZipCode,
      city: editCity,
      occupation: editOccupation,
      maritalStatus: editMaritalStatus,
      notes: editNotes
    });
    if (success) {
      setIsEditingClient(false);
    }
  };

  // Reset editing mode when client changes
  React.useEffect(() => {
    setIsEditingClient(false);
  }, [selectedClientId]);

  // Auto-close sidebar when selected client changes
  React.useEffect(() => {
    if (selectedClientId) {
      setIsSidebarOpen(false);
    }
  }, [selectedClientId]);

  const currentClient = clients.find(c => c.id === selectedClientId);
  const clientSoapNotes = soapNotes.filter(n => n.clientId === selectedClientId);

  return (
    <div className="relative flex-grow bg-[#eef0ed] rounded-none lg:rounded-[24px] border-0 lg:border border-[#003527]/10 m-0 lg:my-4 lg:mr-4 lg:ml-4 flex p-0 lg:p-6 gap-0 lg:gap-6 h-[calc(100vh-64px)] lg:h-[calc(100vh-32px)] overflow-hidden shadow-none transition-all duration-300">
      {/* Left Side: Client List as a secondary Sidebar */}
      <div className={`absolute lg:relative top-0 bottom-0 left-0 z-45 w-full md:w-80 bg-white border-r lg:border border-[#003527]/10 rounded-r-[20px] lg:rounded-[20px] flex flex-col flex-shrink-0 overflow-hidden h-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex ${
        !currentClient
          ? 'translate-x-0'
          : isSidebarOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
      }`}>
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
              return <h3 className="text-sm font-bold text-[#003527]">Klienten ({count})</h3>;
            })()}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsNewClientModalOpen(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-[#003527] hover:bg-[#003527]/5 transition-all cursor-pointer animate-fade-in"
                title="Klient anlegen"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                title="Schließen"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Klient suchen..."
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

            if (clients.length === 0) {
              return (
                <div className="p-6 text-center text-xs text-zinc-400 font-medium space-y-3">
                  <p>Noch keine Klienten angelegt.</p>
                  <button
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="w-full bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-[#bfc9c3]/30"
                  >
                    + Klient anlegen
                  </button>
                </div>
              );
            }

            if (filtered.length === 0) {
              return (
                <div className="p-6 text-center text-xs text-zinc-400 font-medium">
                  Keine Klienten gefunden
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
                onSelect={() => {
                  setSelectedClientId(c.id);
                  setIsSidebarOpen(false);
                }}
                onToggleFavorite={() => {
                  toggleClientFavorite(c.id);
                }}
                onToggleFlag={() => {
                  toggleClientFlag(c.id);
                }}
                onContextMenu={(e) => {
                  handleClientContextMenu(e, c);
                }}
                onDelete={async () => {
                  if (confirm(`Möchtest du ${c.name} wirklich löschen?`)) {
                    await deleteClient(c.id);
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

      {/* Floating sidebar toggle trigger on left screen edge */}
      {!isSidebarOpen && currentClient && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-0 top-[120px] z-30 lg:hidden bg-white hover:bg-zinc-50 border border-l-0 border-[#bfc9c3]/40 rounded-r-xl shadow-[4px_4px_12px_rgba(0,53,39,0.08)] py-3.5 px-2.5 text-[#003527] transition-all active:scale-95 flex items-center justify-center group cursor-pointer"
          title="Klientenliste anzeigen"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Backdrop for sliding sidebar on mobile/tablet */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#003527]/20 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Right Side: Profile Details */}
      <div className={`flex-grow flex flex-col min-h-0 overflow-hidden ${currentClient ? 'flex' : 'hidden lg:flex'}`}>
        {currentClient ? (
          <div className="flex-grow flex flex-col min-h-0">
            {/* Klient Header */}
            <div className="border-b border-[#bfc9c3]/30 px-4 md:px-6 pt-6 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent z-20 flex-shrink-0 text-left">
              <div className="flex flex-col text-left">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-[#043F2D]">
                    {currentClient.name}
                    {currentClient.birthday && (
                      <span className="text-sm font-semibold text-zinc-400 ml-2">
                        ({calculateAge(currentClient.birthday)} J.)
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">Klient seit {new Date(currentClient.createdAt).toLocaleDateString('de-DE')}</span>
                    <span className="text-zinc-300 hidden sm:inline">•</span>
                    <button
                      onClick={() => {
                        if (currentClient.gdprAccepted) {
                          toggleClientGdpr(currentClient.id);
                        } else {
                          openGdprModal(currentClient.id);
                        }
                      }}
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border transition-all cursor-pointer inline-flex items-center gap-0.5 outline-none ${
                        currentClient.gdprAccepted
                          ? 'bg-emerald-50 border-emerald-200/50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 border-amber-200/50 text-amber-700 hover:bg-amber-100'
                      }`}
                      title={currentClient.gdprAccepted ? "Klicken, um Einwilligung zu widerrufen" : "Klicken, um DSGVO-Einwilligung zu erteilen"}
                    >
                      {currentClient.gdprAccepted ? '✓ DSGVO erteilt' : '⚠ DSGVO ausstehend'}
                    </button>
                  </div>
                </div>
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
                                const invoiceId = crypto.randomUUID();
                                supabase
                                  .from('invoices')
                                  .insert({
                                    id: invoiceId,
                                    user_id: therapistId,
                                    appointment_id: null,
                                    client_id: currentClient.id,
                                    invoice_number: invNum,
                                    amount: amount,
                                    date: new Date().toISOString().slice(0, 10),
                                    status: 'open'
                                  })
                                  .then(({ error }) => {
                                    if (error) {
                                      showToast(`Fehler beim Erstellen der Rechnung: ${error.message}`, 'error');
                                      return;
                                    }
                                    const newInv = {
                                      id: invoiceId,
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
                                  });
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

            {/* Sub-tab navigation */}
            <div className="flex border-b border-[#bfc9c3]/30 px-4 md:px-6 bg-transparent select-none z-20 flex-shrink-0">
              {(['overview', 'anamnesis', 'soap', 'billing'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 px-4 text-xs font-bold transition-all relative border-b-2 -mb-[2px] cursor-pointer outline-none bg-transparent ${
                    activeTab === tab
                      ? 'border-[#003527] text-[#003527]'
                      : 'border-transparent text-zinc-400 hover:text-[#003527]'
                  }`}
                >
                  {tab === 'overview' && '📋 Stammdaten'}
                  {tab === 'anamnesis' && '📝 Cranio-Anamnese'}
                  {tab === 'soap' && '🩺 Behandlungsverlauf'}
                  {tab === 'billing' && '📄 Abrechnung & Dokumente'}
                </button>
              ))}
            </div>

            {/* Scrollable details content */}
            <div className="flex-grow overflow-y-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in text-left">
                  {/* Tab Action Bar */}
                  <div className="flex justify-between items-center pb-2 border-b border-[#bfc9c3]/20">
                    <div>
                      <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest">Stammdaten</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Demographische Daten, Beschäftigung und medizinisches Profil.</p>
                    </div>
                    {!isEditingClient ? (
                      <button 
                        onClick={startEditing}
                        className="bg-white hover:bg-zinc-50 text-[#003527] border border-[#bfc9c3]/50 px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" /> Akte bearbeiten
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsEditingClient(false)}
                          className="bg-zinc-100 hover:bg-zinc-200/80 text-[#003527] px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border-none"
                        >
                          Abbrechen
                        </button>
                        <button 
                          onClick={saveEditing}
                          className="bg-[#003527] hover:bg-[#0b513d] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border-none"
                        >
                          Speichern
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingClient ? (
                    /* EDIT MODE FORM */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                      {/* Linke Spalte Formular */}
                      <div className="space-y-6">
                        {/* Karte 1 Formular: Stammdaten */}
                        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Stammdaten</h4>
                          
                          <div className="space-y-3.5">
                            {/* Salutation */}
                            <div className="space-y-1 text-left">
                              <label className="block text-[10px] font-semibold text-zinc-500">Anrede</label>
                              <div className="bg-zinc-100/60 p-0.5 rounded-xl border border-transparent flex relative overflow-hidden">
                                {(['Keine', 'Frau', 'Herr'] as const).map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setEditSalutation(opt)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg relative z-10 transition-colors cursor-pointer bg-transparent border-none ${
                                      editSalutation === opt ? 'text-[#003527]' : 'text-zinc-400 hover:text-zinc-500'
                                    }`}
                                  >
                                    {opt}
                                    {editSalutation === opt && (
                                      <motion.div
                                        layoutId="edit-salutation-pill"
                                        className="absolute inset-0 bg-white rounded-lg border border-zinc-200/50 z-[-1] shadow-sm"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                      />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Vorname & Nachname */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-semibold text-zinc-500">Vorname</label>
                                <input
                                  type="text"
                                  value={editFirstName}
                                  onChange={(e) => setEditFirstName(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-semibold text-zinc-500">Nachname</label>
                                <input
                                  type="text"
                                  value={editLastName}
                                  onChange={(e) => setEditLastName(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                            </div>

                            {/* Geburtstag */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-semibold text-zinc-500">Geburtstag</label>
                              <input
                                type="date"
                                value={editBirthday}
                                onChange={(e) => setEditBirthday(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>

                            {/* Familienstand */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-semibold text-zinc-500">Familienstand</label>
                              <input
                                type="text"
                                value={editMaritalStatus}
                                onChange={(e) => setEditMaritalStatus(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Karte 2 Formular: Kontakt & Anschrift */}
                        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kontakt & Anschrift</h4>
                          
                          <div className="space-y-3.5">
                            {/* Telefon */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-semibold text-zinc-500">Telefon</label>
                              <input
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>

                            {/* E-Mail */}
                            <div className="space-y-1">
                              <label className="block text-[10px] font-semibold text-zinc-500">E-Mail</label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>

                            {/* Straße & Hausnummer */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2 space-y-1">
                                <label className="block text-[10px] font-semibold text-zinc-500">Straße</label>
                                <input
                                  type="text"
                                  value={editStreet}
                                  onChange={(e) => setEditStreet(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-semibold text-zinc-500">Hausnr.</label>
                                <input
                                  type="text"
                                  value={editHouseNumber}
                                  onChange={(e) => setEditHouseNumber(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                            </div>

                            {/* PLZ & Ort */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-semibold text-zinc-500">PLZ</label>
                                <input
                                  type="text"
                                  value={editZipCode}
                                  onChange={(e) => setEditZipCode(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <label className="block text-[10px] font-semibold text-zinc-500">Ort</label>
                                <input
                                  type="text"
                                  value={editCity}
                                  onChange={(e) => setEditCity(e.target.value)}
                                  className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rechte Spalte Formular: Lebensumstände & Anamnese */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lebensumstände & Anamnese</h4>
                          
                          {/* Beschäftigung */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-zinc-500">Derzeitige Beschäftigung</label>
                            <input
                              type="text"
                              value={editOccupation}
                              onChange={(e) => setEditOccupation(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                            />
                          </div>

                          {/* Medizinische Notizen */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-zinc-500">Praxisnotizen & Anamnese</label>
                            <textarea
                              rows={8}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2.5 font-semibold text-xs text-[#003527] outline-none resize-none transition-all min-h-[180px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE DISPLAY (2-Spalten-Layout mit 3 Kacheln) */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                      {/* Linke Spalte: Stammdaten und Kontakt gestapelt */}
                      <div className="space-y-6">
                        {/* Karte 1: Stammdaten */}
                        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                          <div className="flex justify-between items-start">
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                              Stammdaten
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 pt-1">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Vor- & Nachname</span>
                              <span className="block text-xs font-extrabold text-[#003527]">
                                {currentClient.salutation && currentClient.salutation !== 'Keine' ? `${currentClient.salutation} ` : ''}
                                {currentClient.name}
                              </span>
                            </div>
                            
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Geburtstag (Alter)</span>
                              <span className="block text-xs font-extrabold text-[#003527]">
                                {new Date(currentClient.birthday).toLocaleDateString('de-DE')} 
                                {currentClient.birthday && ` (${calculateAge(currentClient.birthday)} Jahre)`}
                              </span>
                            </div>

                            <div className="space-y-0.5 sm:col-span-2 border-t border-zinc-100 pt-2.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Familienstand</span>
                              <span className="block text-xs font-extrabold text-[#003527]">
                                {currentClient.maritalStatus || 'Keine Angabe'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Karte 2: Kontakt & Anschrift */}
                        <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] transition-all duration-300 relative group shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                          <div className="flex justify-between items-start">
                            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                              <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                              Kontakt & Anschrift
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 pt-1">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Telefon</span>
                              <span className="block text-xs font-extrabold text-[#003527] flex items-center gap-1.5">
                                {currentClient.phone || 'Keine Angabe'}
                                {currentClient.phone && (
                                  <a href={`tel:${currentClient.phone}`} className="p-1 rounded bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] transition-all">
                                    <Phone className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">E-Mail</span>
                              <span className="block text-xs font-extrabold text-[#003527] flex items-center gap-1.5 min-w-0 pr-2">
                                <span className="truncate" title={currentClient.email}>{currentClient.email}</span>
                                <a href={`mailto:${currentClient.email}`} className="p-1 rounded bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] transition-all flex-shrink-0">
                                  <Mail className="w-2.5 h-2.5" />
                                </a>
                              </span>
                            </div>

                            <div className="space-y-0.5 sm:col-span-2 border-t border-zinc-100 pt-2.5 flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-zinc-400 mt-1 flex-shrink-0" />
                              <div className="space-y-0.5">
                                <span className="block text-[10px] font-medium text-zinc-400">Anschrift</span>
                                <span className="block text-xs font-extrabold text-[#003527]">
                                  {currentClient.street || currentClient.city ? (
                                    <>
                                      {currentClient.street} {currentClient.houseNumber}
                                      {(currentClient.street || currentClient.houseNumber) && (currentClient.zipCode || currentClient.city) ? ', ' : ''}
                                      {currentClient.zipCode} {currentClient.city}
                                    </>
                                  ) : (
                                    currentClient.address || 'Keine Anschrift hinterlegt'
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rechte Spalte: Lebensumstände & Anamnese */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] relative group overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                              Lebensumstände & Anamnese
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-y-3.5 pt-1">
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Beschäftigung</span>
                              <span className="block text-xs font-extrabold text-[#003527]">
                                {currentClient.occupation || 'Keine Angabe'}
                              </span>
                            </div>

                            <div className="space-y-0.5 border-t border-zinc-100 pt-2.5">
                              <span className="block text-[10px] font-medium text-zinc-400">Praxisnotizen & Anamnese</span>
                              <p className="text-xs font-semibold leading-relaxed text-[#404944] mt-1 whitespace-pre-wrap">
                                {currentClient.notes || 'Keine medizinischen Notizen hinterlegt.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-rose-200/30 flex justify-between items-center text-left">
                    <div>
                      <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest">Gefahrenbereich</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Diesen Klienten unwiderruflich aus der Datenbank entfernen.</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Möchtest du diesen Klienten wirklich löschen?')) {
                          await deleteClient(currentClient.id);
                          setSelectedClientId(clients.find(c => c.id !== currentClient.id)?.id || '');
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/30 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Klient löschen
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'anamnesis' && (
                <CranioAnamnesisTab clientId={currentClient.id} />
              )}

              {activeTab === 'soap' && (
                <div className="space-y-6 text-left animate-fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-[#bfc9c3]/20">
                    <div>
                      <h4 className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-widest">Behandlungsverlauf</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Chronologischer Verlauf der Behandlungssitzungen.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const tempId = `app-${Date.now()}`;
                        createSoapNote(tempId, currentClient.id);
                        // Auto-expand the newly created SOAP note
                        setExpandedNoteIds(prev => ({ ...prev, [tempId]: true }));
                      }}
                      className="bg-[#003527] hover:bg-[#0b513d] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-sm border-none flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Eintrag anlegen
                    </button>
                  </div>

                  <div className="relative pl-0 sm:pl-8 space-y-4">
                    {/* Vertical timeline connector track */}
                    <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-[#bfc9c3]/40 z-0 hidden sm:block" />

                    {clientSoapNotes.length > 0 ? (
                      clientSoapNotes.map((note) => {
                        const isExpanded = !!expandedNoteIds[note.id] || soapEditId === note.id;

                        return (
                          <div 
                            key={note.id} 
                            className="bg-white border border-[#bfc9c3]/30 rounded-2xl overflow-hidden hover:border-[#bfc9c3]/50 transition-all duration-300 relative group shadow-[0_4px_20px_rgba(0,53,39,0.01)]"
                          >
                            {/* Timeline dot */}
                            <div className="absolute left-[-29px] top-[22px] w-3 h-3 rounded-full bg-[#003527] border-2 border-white z-10 hidden sm:block shadow-sm" />

                            {/* Accordion Header */}
                            <div 
                              onClick={() => toggleSoapNoteExpand(note.id)}
                              className="flex items-center justify-between p-4 bg-[#f9f9f8]/40 border-b border-zinc-100/50 cursor-pointer select-none hover:bg-[#f9f9f8] transition-colors"
                            >
                              <div className="flex items-center gap-3 overflow-hidden mr-4">
                                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/30 text-[#003527]">
                                  <CalendarIcon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-extrabold text-[#003527] uppercase tracking-wider">
                                    Eintrag vom {new Date(note.date).toLocaleDateString('de-DE')}
                                  </span>
                                  {!isExpanded && note.subjective && (
                                    <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px] sm:max-w-[400px] mt-0.5">
                                      {note.subjective.length > 80 ? `${note.subjective.slice(0, 80)}...` : note.subjective}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {soapEditId === note.id ? (
                                  <button 
                                    onClick={saveSoapNote} 
                                    className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                                  >
                                    Speichern
                                  </button>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => startEditSoap(note)} 
                                      className="text-[10px] font-extrabold text-zinc-500 hover:text-[#003527] flex items-center gap-1 cursor-pointer border border-[#bfc9c3]/30 bg-white hover:bg-zinc-50 px-2.5 py-1 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" /> Bearbeiten
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSoapNote(note.id)} 
                                      className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer border border-rose-100 bg-white px-2.5 py-1 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Löschen
                                    </button>
                                  </>
                                )}
                                
                                <div 
                                  onClick={() => toggleSoapNoteExpand(note.id)}
                                  className="p-1 rounded-lg hover:bg-zinc-200/50 transition-colors text-zinc-400 ml-1 cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Accordion Body */}
                            {isExpanded && (
                              <div className="p-5 border-t border-zinc-100/50 bg-white animate-fade-in">
                                {soapEditId === note.id ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003527]/70">Befinden & Symptome</label>
                                      <textarea 
                                        value={soapSubjective} 
                                        onChange={(e) => setSoapSubjective(e.target.value)} 
                                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-3 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[70px]" 
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003527]/70">Beobachtung & Befund</label>
                                      <textarea 
                                        value={soapObjective} 
                                        onChange={(e) => setSoapObjective(e.target.value)} 
                                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-3 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[70px]" 
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003527]/70">Einschätzung</label>
                                      <textarea 
                                        value={soapAssessment} 
                                        onChange={(e) => setSoapAssessment(e.target.value)} 
                                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-3 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[70px]" 
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#003527]/70">Ausblick & Empfehlung</label>
                                      <textarea 
                                        value={soapPlan} 
                                        onChange={(e) => setSoapPlan(e.target.value)} 
                                        className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-xl p-3 text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] outline-none transition-all resize-y min-h-[70px]" 
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-[#bfc9c3]/20 rounded-xl p-4 space-y-2 text-left bg-amber-50/5 hover:bg-amber-50/10 transition-colors">
                                      <span className="block text-[10px] font-extrabold tracking-widest text-[#003527]/60 uppercase">Befinden & Symptome</span>
                                      <p className="text-xs font-extrabold text-[#003527] leading-relaxed whitespace-pre-wrap italic">{note.subjective || 'Keine Angabe'}</p>
                                    </div>
                                    
                                    <div className="border border-[#bfc9c3]/20 rounded-xl p-4 space-y-2 text-left bg-blue-50/5 hover:bg-blue-50/10 transition-colors">
                                      <span className="block text-[10px] font-extrabold tracking-widest text-[#003527]/60 uppercase">Beobachtung & Befund</span>
                                      <p className="text-xs font-extrabold text-[#003527] leading-relaxed whitespace-pre-wrap">{note.objective || 'Keine Angabe'}</p>
                                    </div>

                                    <div className="border border-[#bfc9c3]/20 rounded-xl p-4 space-y-2 text-left bg-emerald-50/5 hover:bg-emerald-50/10 transition-colors">
                                      <span className="block text-[10px] font-extrabold tracking-widest text-[#003527]/60 uppercase">Einschätzung</span>
                                      <p className="text-xs font-extrabold text-[#003527] leading-relaxed whitespace-pre-wrap">{note.assessment || 'Keine Angabe'}</p>
                                    </div>

                                    <div className="border border-[#bfc9c3]/20 rounded-xl p-4 space-y-2 text-left bg-purple-50/5 hover:bg-purple-50/10 transition-colors">
                                      <span className="block text-[10px] font-extrabold tracking-widest text-[#003527]/60 uppercase">Ausblick & Empfehlung</span>
                                      <p className="text-xs font-extrabold text-[#003527] leading-relaxed whitespace-pre-wrap">{note.plan || 'Keine Angabe'}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-xs text-zinc-400 font-semibold italic bg-white border border-[#bfc9c3]/20 rounded-2xl shadow-[0_4px_20px_rgba(0,53,39,0.01)] sm:col-span-2">
                        Keine Behandlungsberichte für diesen Klienten vorhanden.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (() => {
                const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                const totalBilled = clientInvoices.reduce((acc, inv) => acc + inv.amount, 0);
                const totalPaid = clientInvoices.filter(i => i.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0);
                const totalOutstanding = clientInvoices.filter(i => i.status === 'open' || i.status === 'overdue').reduce((acc, inv) => acc + inv.amount, 0);

                return (
                  <div className="space-y-6 text-left animate-fade-in">
                    {/* KPI Umsatz-Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-4 text-left flex flex-col justify-between hover:border-[#bfc9c3]/50 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-wider">Gesamtforderung</span>
                        <span className="text-lg font-extrabold text-[#003527] mt-1">{totalBilled.toFixed(2)} €</span>
                      </div>
                      <div className="bg-[#003527]/2 rounded-2xl border border-emerald-200/20 p-4 text-left flex flex-col justify-between hover:border-emerald-200/40 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] bg-emerald-50/10">
                        <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">Bezahlt</span>
                        <span className="text-lg font-extrabold text-emerald-800 mt-1">{totalPaid.toFixed(2)} €</span>
                      </div>
                      <div className={`rounded-2xl border p-4 text-left flex flex-col justify-between transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                        totalOutstanding > 0 
                          ? 'border-amber-200/30 bg-amber-50/10 text-amber-800' 
                          : 'bg-white border-[#bfc9c3]/30 text-zinc-400'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ausstehend</span>
                        <span className={`text-lg font-extrabold mt-1 ${totalOutstanding > 0 ? 'text-amber-800' : 'text-zinc-400'}`}>
                          {totalOutstanding.toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    {/* Document Locker */}
                    <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                      <div className="flex justify-between items-start pb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#003527]">Dokumenten-Tresor</h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Rezepte, Befunde und Arztberichte sicher ablegen.</p>
                          </div>
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
                          className="text-[10px] font-bold text-[#003527] hover:text-[#0b513d] flex items-center gap-0.5 transition-colors cursor-pointer bg-zinc-100 hover:bg-[#003527]/5 border border-transparent rounded-md px-3 py-1.5"
                        >
                          + Datei hinzufügen
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(clientDocuments[currentClient.id] || []).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(clientDocuments[currentClient.id] || []).map((doc, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[#404944] bg-[#f9f9f8] border border-zinc-200/40 p-3 rounded-xl hover:border-zinc-200 transition-all">
                                <span className="flex items-center gap-2 min-w-0 pr-2">
                                  <FileText className="w-4 h-4 text-[#003527]/60 flex-shrink-0" />
                                  <span className="truncate" title={doc.name}>{doc.name}</span>
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-[10px] text-zinc-400 font-semibold">{doc.size}</span>
                                  <a href="#" className="text-[10px] font-extrabold text-[#003527] hover:underline">Ansehen</a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-zinc-400 font-semibold italic">
                            Keine Dokumente abgelegt.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invoices */}
                    <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 transition-all duration-300 hover:border-[#bfc9c3]/60 hover:shadow-[0_4px_20px_rgba(0,53,39,0.02)] shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                      <div className="flex justify-between items-start pb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#003527]">Rechnungsübersicht</h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Erstellte Abrechnungen und deren Zahlungsstatus.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const amountStr = prompt('Rechnungsbetrag in € eingeben (z.B. 90.00):');
                            if (amountStr) {
                              const amount = parseFloat(amountStr.replace(',', '.'));
                              if (!isNaN(amount) && amount > 0) {
                                const num = invoices.length + 1;
                                const invNum = `RE-2026-${num.toString().padStart(4, '0')}`;
                                const invoiceId = crypto.randomUUID();
                                supabase
                                  .from('invoices')
                                  .insert({
                                    id: invoiceId,
                                    user_id: therapistId,
                                    appointment_id: null,
                                    client_id: currentClient.id,
                                    invoice_number: invNum,
                                    amount: amount,
                                    date: new Date().toISOString().slice(0, 10),
                                    status: 'open'
                                  })
                                  .then(({ error }) => {
                                    if (error) {
                                      showToast(`Fehler beim Erstellen der Rechnung: ${error.message}`, 'error');
                                      return;
                                    }
                                    const newInv = {
                                      id: invoiceId,
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
                                  });
                              } else {
                                showToast('Ungültiger Betrag.', 'error');
                              }
                            }
                          }}
                          className="text-[10px] font-bold text-[#003527] hover:text-[#0b513d] flex items-center gap-0.5 transition-colors cursor-pointer bg-zinc-100 hover:bg-[#003527]/5 border border-transparent rounded-md px-3 py-1.5"
                        >
                          + Rechnung erstellen
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        {clientInvoices.length > 0 ? (
                          <table className="w-full text-left text-xs min-w-[500px]">
                            <thead>
                              <tr className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-100">
                                <th className="pb-2 font-semibold">Rechnungsnummer</th>
                                <th className="pb-2 font-semibold">Datum</th>
                                <th className="pb-2 font-semibold text-right">Betrag</th>
                                <th className="pb-2 font-semibold pl-4">Status</th>
                                <th className="pb-2 font-semibold text-right pr-2">Aktionen</th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#003527]">
                              {clientInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-[#003527]/3 transition-colors border-b border-zinc-100/60 last:border-b-0">
                                  <td className="py-3 text-xs">{inv.invoiceNumber}</td>
                                  <td className="py-3 text-xs text-zinc-400 font-semibold">{new Date(inv.date).toLocaleDateString('de-DE')}</td>
                                  <td className="py-3 text-xs text-right">{inv.amount.toFixed(2)} €</td>
                                  <td className="py-3 text-xs pl-4">
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                                      inv.status === 'paid'
                                        ? 'bg-emerald-50 border-emerald-200/50 text-emerald-700'
                                        : inv.status === 'overdue'
                                        ? 'bg-rose-50 border-rose-200/50 text-rose-600'
                                        : 'bg-amber-50 border-amber-200/50 text-amber-700'
                                    }`}>
                                      {inv.status === 'paid' ? 'Bezahlt' : inv.status === 'overdue' ? 'Überfällig' : 'Offen'}
                                    </span>
                                  </td>
                                  <td className="py-3 text-xs pr-2 flex items-center justify-end gap-1">
                                    {inv.status !== 'paid' && (
                                      <button
                                        onClick={() => markInvoicePaid(inv.id)}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer border border-emerald-200/30"
                                        title="Als bezahlt markieren"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => sendInvoiceEmail(inv)}
                                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer border border-blue-200/30"
                                      title="Rechnung per E-Mail senden"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => printInvoice(inv)}
                                      className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-all cursor-pointer border border-zinc-200/30"
                                      title="Rechnung drucken"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => downloadInvoicePdf(inv)}
                                      className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-all cursor-pointer border border-zinc-200/30"
                                      title="Rechnung als PDF herunterladen"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-zinc-400 font-semibold italic">
                            Keine Rechnungen vorhanden.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-[#003527]/5 rounded-2xl flex items-center justify-center text-[#003527] border border-[#bfc9c3]/20 shadow-sm animate-pulse">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#003527] uppercase tracking-wider font-mono">Noch keine Klienten angelegt</h3>
              <p className="text-xs text-[#404944] leading-relaxed max-w-sm">
                Erstelle deinen ersten Klienten, um Termine zu vergeben, Behandlungsberichte zu führen und Rechnungen zu erstellen.
              </p>
            </div>
            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="bg-[#003527] hover:bg-[#0b513d] text-white px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm border-none"
            >
              <Plus className="w-4 h-4" /> Ersten Klienten anlegen
            </button>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-[#003527] border border-zinc-200/40">
              <Search className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#003527] uppercase tracking-wider font-mono">Klient auswählen</h3>
              <p className="text-[11px] text-zinc-400">Wähle einen Klienten aus der Liste links aus, um seine Akte zu öffnen.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
