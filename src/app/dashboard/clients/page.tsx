'use client';

import React from 'react';
import { 
  Plus, Search, Mail, Calendar as CalendarIcon, Paperclip, FileText, 
  Edit2, Trash2, Star, Flag, ChevronLeft, ChevronRight, MoreVertical, User, Phone, Heart, Info,
  Check, Printer, Download, Briefcase, MapPin, Smile, ChevronDown, ChevronUp, Archive, RotateCcw, ShieldAlert,
  Activity, Brain, Target, ClipboardList, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { Client, SoapNote, Invoice } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import CranioAnamnesisTab from '../components/CranioAnamnesisTab';
import { formatGermanDate } from '@/lib/dateUtils';

interface SoapSubjectiveData {
  text: string;
  complaints: Array<{ description: string; painLevel: number }>;
}

function parseSoapSubjective(raw: string): SoapSubjectiveData {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && ('text' in parsed || 'complaints' in parsed)) {
      return {
        text: parsed.text || '',
        complaints: Array.isArray(parsed.complaints) ? parsed.complaints : []
      };
    }
  } catch (e) {
    // legacy text
  }
  return {
    text: raw || '',
    complaints: []
  };
}

function serializeSoapSubjective(text: string, complaints: Array<{ description: string; painLevel: number }>): string {
  return JSON.stringify({ text, complaints });
}

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
    <div className="relative overflow-hidden border-b border-[#bfc9c3]/20 select-none bg-white">
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
      className={`px-6 py-4 cursor-pointer flex items-center justify-between relative z-10 select-none transition-all group bg-white hover:bg-zinc-50 ${
          isSelected 
            ? 'text-[#003527] font-semibold' 
            : 'text-[#404944]'
        }`}
      >
        {isSelected && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#003527] z-20" />
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
          <p className="text-[10px] text-zinc-400 mt-0.5 text-left">Geb: {client.birthday ? formatGermanDate(client.birthday) : 'Keine Angabe'}</p>
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

interface DeleteClientConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  clientName: string;
}

function DeleteClientConfirmationModal({ isOpen, onClose, onConfirm, clientName }: DeleteClientConfirmationModalProps) {
  const [checked1, setChecked1] = React.useState(false);
  const [checked2, setChecked2] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!checked1 || !checked2) return;
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] pointer-events-auto"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white border border-[#bfc9c3]/30 w-full max-w-md rounded-2xl shadow-xl p-6 pointer-events-auto flex flex-col text-left space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-bold text-zinc-900">Patient endgültig löschen?</h3>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                Sie sind im Begriff, die Akte von <span className="text-[#003527] font-bold">{clientName}</span> unwiderruflich zu löschen.
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-[11px] text-rose-800 leading-relaxed font-semibold">
            Bitte beachten Sie die gesetzlichen Aufbewahrungsfristen. Alternativ können Sie die Akte auch einfach archiviert belassen.
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer select-none group text-left">
              <input
                type="checkbox"
                checked={checked1}
                onChange={(e) => setChecked1(e.target.checked)}
                className="mt-0.5 rounded border-[#bfc9c3]/50 text-[#003527] focus:ring-[#003527] w-4 h-4 cursor-pointer"
              />
              <span className="text-[10.5px] text-zinc-600 font-semibold leading-relaxed group-hover:text-zinc-800 transition-colors">
                Ich bestätige, dass die gesetzliche Aufbewahrungsfrist von 10 Jahren (§ 630f BGB & § 147 AO) für diesen Patienten abgelaufen ist.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none group text-left">
              <input
                type="checkbox"
                checked={checked2}
                onChange={(e) => setChecked2(e.target.checked)}
                className="mt-0.5 rounded border-[#bfc9c3]/50 text-[#003527] focus:ring-[#003527] w-4 h-4 cursor-pointer"
              />
              <span className="text-[10.5px] text-zinc-600 font-semibold leading-relaxed group-hover:text-zinc-800 transition-colors">
                Mir ist bewusst, dass alle Notizen, Termine und Dokumente permanent gelöscht werden und dies nicht rückgängig gemacht werden kann.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.99] border-none outline-none text-center"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirm}
              disabled={!checked1 || !checked2 || isDeleting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.99] border-none outline-none text-center shadow-md shadow-rose-600/10 flex items-center justify-center gap-1.5"
            >
              {isDeleting ? 'Lösche...' : 'Endgültig löschen'}
            </button>
          </div>
        </div>
      </div>
    </>
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
    archiveClient,
    restoreClient,
    updateClientDetails,
    markInvoicePaid,
    sendInvoiceEmail,
    printInvoice,
    downloadInvoicePdf,
    therapistId,
    appointments,
    invoices,
    setInvoices,
    isSmallBusiness,
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
    soapDate,
    setSoapDate,
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [clientToDelete, setClientToDelete] = React.useState<Client | null>(null);

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };
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
  const [isEditingAnamnesis, setIsEditingAnamnesis] = React.useState(false);
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
  const [editChildren, setEditChildren] = React.useState('');
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
    setEditChildren(currentClient.children || 'Keine Angabe');
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
      children: editChildren,
      notes: editNotes
    });
    if (success) {
      setIsEditingClient(false);
    }
  };

  // Reset editing mode when client changes
  React.useEffect(() => {
    setIsEditingClient(false);
    setIsEditingAnamnesis(false);
  }, [selectedClientId, activeTab]);

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
      <div className={`absolute lg:relative top-0 bottom-0 left-0 z-45 w-full md:w-80 bg-white border-r border-[#003527]/10 lg:border lg:border-[#bfc9c3]/30 rounded-r-[20px] lg:rounded-2xl flex flex-col flex-shrink-0 overflow-hidden h-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex ${
        !currentClient
          ? 'translate-x-0'
          : isSidebarOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 pt-8 space-y-4">
          <div className="flex justify-between items-center">
            {(() => {
              const count = clients
                .filter(c => {
                  if (clientFilter === 'archived') return c.isArchived;
                  return !c.isArchived;
                })
                .filter(c => {
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
                  <button
                    onClick={() => setClientFilter('archived')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      clientFilter === 'archived'
                        ? 'bg-[#003527] text-white'
                        : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                    }`}
                  >
                    Archiv
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
                if (clientFilter === 'archived') {
                  return c.isArchived;
                }
                return !c.isArchived;
              })
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
                  if (c.isArchived) {
                    setClientToDelete(c);
                    setIsDeleteConfirmOpen(true);
                  } else {
                    if (confirm(`Möchtest du ${c.name} wirklich archivieren?`)) {
                      await archiveClient(c.id);
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
            <div className="mx-4 md:mx-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent z-20 flex-shrink-0 text-left px-0">
              <div className="flex flex-col text-left">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-[#043F2D]">
                    {currentClient.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">Klient seit {formatGermanDate(currentClient.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Bearbeiten Buttons in Header */}
                {activeTab === 'overview' && (
                  <>
                    {isEditingClient ? (
                      <div className="flex gap-2 animate-fade-in">
                        <button
                          onClick={() => setIsEditingClient(false)}
                          className="bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700 px-3.5 py-2 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border border-[#bfc9c3]/40 shadow-sm active:scale-95"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={saveEditing}
                          className="bg-[#003527] hover:bg-[#0b513d] text-white px-3.5 py-2 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border-none shadow-sm active:scale-95"
                        >
                          Speichern
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={startEditing}
                        className="p-2 bg-white border border-[#bfc9c3]/50 rounded-xl hover:bg-zinc-50 text-[#003527] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                        title="Akte bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}

                {activeTab === 'anamnesis' && (
                  <button
                    onClick={() => setIsEditingAnamnesis(!isEditingAnamnesis)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                      isEditingAnamnesis
                        ? 'bg-[#003527] text-white border-[#003527] hover:bg-[#0b513d]'
                        : 'bg-white text-[#003527] border-[#bfc9c3]/50 hover:bg-zinc-50'
                    }`}
                    title={isEditingAnamnesis ? "Leseansicht" : "Anamnese bearbeiten"}
                  >
                    {isEditingAnamnesis ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setIsDetailsMenuOpen(!isDetailsMenuOpen)}
                    className="p-2 bg-white border border-[#bfc9c3]/50 rounded-xl hover:bg-zinc-50 text-[#003527] transition-all cursor-pointer flex items-center justify-center"
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
                            const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                            const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                            const firstInvId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                            const firstAppId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                            setSelectedMailInvoiceId(firstInvId);
                            setSelectedMailAppointmentId(firstAppId);
                            applyMailTemplate('custom', firstInvId, firstAppId, currentClient);
                            setIsMailModalOpen(true);
                          }}
                          className="px-4 py-2.5 text-xs text-[#003527] hover:bg-[#f3f4f3] font-bold text-left flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100/80"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#003527]/70" />
                          E-Mail senden
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
                                const dateVal = new Date().toISOString().slice(0, 10);
                                const dueVal = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                                const monthNames = [
                                  "Januar", "Februar", "März", "April", "Mai", "Juni", 
                                  "Juli", "August", "September", "Oktober", "November", "Dezember"
                                ];
                                const serviceDateVal = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

                                const clientSnapshot = {
                                  name: currentClient.name,
                                  email: currentClient.email,
                                  phone: currentClient.phone,
                                  address: currentClient.address || '',
                                  street: currentClient.street || '',
                                  houseNumber: currentClient.houseNumber || '',
                                  zipCode: currentClient.zipCode || '',
                                  city: currentClient.city || ''
                                };

                                const lineItems = [
                                  { id: '1', description: 'Therapeutische Behandlung / Physiotherapie', price: amount, taxRate: 0 }
                                ];

                                supabase
                                  .from('invoices')
                                  .insert({
                                    id: invoiceId,
                                    user_id: therapistId,
                                    appointment_id: null,
                                    client_id: currentClient.id,
                                    invoice_number: invNum,
                                    amount: amount,
                                    date: dateVal,
                                    status: 'open',
                                    due_date: dueVal,
                                    service_date: serviceDateVal,
                                    client_snapshot: clientSnapshot,
                                    line_items: lineItems,
                                    is_small_business: isSmallBusiness
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
                                      date: dateVal,
                                      status: 'open' as const,
                                      dueDate: dueVal,
                                      serviceDate: serviceDateVal,
                                      clientSnapshot: clientSnapshot,
                                      lineItems: lineItems,
                                      isSmallBusiness: isSmallBusiness
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
            <div className="flex gap-6 border-b border-[#bfc9c3]/30 mx-4 md:mx-6 bg-transparent select-none z-20 flex-shrink-0 px-0">
              {(['overview', 'anamnesis', 'soap', 'billing'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 text-xs font-bold transition-all relative cursor-pointer outline-none bg-transparent ${
                    activeTab === tab
                      ? 'text-[#003527]'
                      : 'text-zinc-400 hover:text-[#003527]'
                  }`}
                >
                  {tab === 'overview' && 'Stammdaten'}
                  {tab === 'anamnesis' && 'Anamnese'}
                  {tab === 'soap' && 'Behandlungsverlauf'}
                  {tab === 'billing' && 'Abrechnung & Dokumente'}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="clientTabLine" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#003527]" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable details content */}
            <div className="flex-grow overflow-y-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in text-left">
                  {isEditingClient ? (
                    /* EDIT MODE FORM */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      {/* Karte 1 Formular: Stammdaten (lg:col-span-1) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100/60">
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Stammdaten</h4>
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Basisangaben zur Person</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3.5">
                          {/* Salutation */}
                          <div className="space-y-1.5 text-left">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Anrede</label>
                            <div className="bg-zinc-100/80 p-0.5 rounded-xl border border-transparent flex relative overflow-hidden">
                              {(['Keine', 'Frau', 'Herr'] as const).map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setEditSalutation(opt)}
                                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg relative z-10 transition-colors cursor-pointer bg-transparent border-none ${
                                    editSalutation === opt ? 'text-[#003527]' : 'text-zinc-400 hover:text-[#003527]/50'
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
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Vorname</label>
                              <input
                                type="text"
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nachname</label>
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
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Geburtstag</label>
                            <input
                              type="date"
                              value={editBirthday}
                              onChange={(e) => setEditBirthday(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-bold text-xs text-[#003527] outline-none transition-all cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Karte 2 Formular: Kontakt & Anschrift (lg:col-span-1) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 lg:col-span-1">
                        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100/60">
                          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Kontakt & Anschrift</h4>
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Erreichbarkeit und Wohnort</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3.5">
                          {/* Telefon */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Telefon</label>
                            <input
                              type="tel"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                            />
                          </div>

                          {/* E-Mail */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">E-Mail</label>
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
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Straße</label>
                              <input
                                type="text"
                                value={editStreet}
                                onChange={(e) => setEditStreet(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Hausnr.</label>
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
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">PLZ</label>
                              <input
                                type="text"
                                value={editZipCode}
                                onChange={(e) => setEditZipCode(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              />
                            </div>
                            <div className="col-span-2 space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ort</label>
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

                      {/* Karte 3 Formular: Lebensumstände (lg:col-span-1) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 lg:col-span-1">
                        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100/60">
                          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Lebensumstände</h4>
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Berufliches und Privatleben</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3.5">
                          {/* Familienstand */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Familienstand</label>
                            <input
                              type="text"
                              value={editMaritalStatus}
                              onChange={(e) => setEditMaritalStatus(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                            />
                          </div>

                          {/* Beschäftigung */}
                          <div className="space-y-1 text-left">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Derzeitige Beschäftigung</label>
                            <input
                              type="text"
                              value={editOccupation}
                              onChange={(e) => setEditOccupation(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                            />
                          </div>

                          {/* Kinder */}
                          <div className="space-y-1 text-left">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kinder</label>
                            <input
                              type="text"
                              value={editChildren}
                              onChange={(e) => setEditChildren(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                              placeholder="z.B. Keine, 1 Kind, 2 Kinder"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Karte 4 Formular: Praxisnotizen & Anamnese (lg:col-span-3) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 col-span-1 md:col-span-3">
                        <div className="space-y-4 w-full">
                          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100/60">
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Praxisnotizen & Anamnese</h4>
                              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Medizinische Notizen und Vorgeschichte</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 text-left">
                            <textarea
                              rows={5}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2.5 font-semibold text-xs text-[#003527] outline-none resize-y transition-all min-h-[120px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE DISPLAY (3-Spalten Bento Grid) */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      {/* Karte 1: Stammdaten (lg:col-span-1) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 hover:border-[#bfc9c3]/60 transition-all duration-300 relative group">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                            Stammdaten
                          </span>
                        </div>
                        
                        <div className="space-y-3.5 pt-1">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Vor- & Nachname</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.salutation && currentClient.salutation !== 'Keine' ? `${currentClient.salutation} ` : ''}
                              {currentClient.name}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Geburtstag</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.birthday ? formatGermanDate(currentClient.birthday) : 'Keine Angabe'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Alter</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.birthday ? `${calculateAge(currentClient.birthday)} Jahre` : 'Keine Angabe'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Karte 2: Kontakt (lg:col-span-1) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 hover:border-[#bfc9c3]/60 transition-all duration-300 relative group lg:col-span-1">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                            Kontakt
                          </span>
                        </div>

                        <div className="space-y-3.5 pt-1">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Telefon</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.phone || 'Keine Angabe'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">E-Mail</span>
                            <span className="block text-xs font-extrabold text-[#003527] break-all">
                              {currentClient.email || 'Keine Angabe'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Anschrift</span>
                            {currentClient.street || currentClient.city ? (
                              <div className="space-y-0.5">
                                <span className="block text-xs font-extrabold text-[#003527]">
                                  {currentClient.street} {currentClient.houseNumber}
                                </span>
                                <span className="block text-[11px] font-bold text-[#003527]/80">
                                  {currentClient.zipCode} {currentClient.city}
                                </span>
                              </div>
                            ) : (
                              <span className="block text-xs font-extrabold text-[#003527]">
                                {currentClient.address || 'Keine Anschrift hinterlegt'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Karte 3: Lebensumstände (lg:col-span-1) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 hover:border-[#bfc9c3]/60 transition-all duration-300 relative group lg:col-span-1">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                            Lebensumstände
                          </span>
                        </div>

                        <div className="space-y-3.5 pt-1">
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Familienstand</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.maritalStatus || 'Keine Angabe'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Beschäftigung</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.occupation || 'Keine Angabe'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-medium text-zinc-400">Kinder</span>
                            <span className="block text-xs font-extrabold text-[#003527]">
                              {currentClient.children || 'Keine Angabe'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Karte 4: Praxisnotizen & Anamnese (lg:col-span-3) */}
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 hover:border-[#bfc9c3]/60 transition-all duration-300 relative group col-span-1 md:col-span-3">
                        <div className="space-y-4 w-full">
                          <div className="flex justify-between items-start">
                            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                              <ClipboardList className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500">
                              Praxisnotizen & Anamnese
                            </span>
                          </div>

                          <div className="space-y-1 text-left">
                            <p className="text-xs font-semibold text-[#003527] border-l-2 border-[#003527]/20 pl-3 leading-relaxed whitespace-pre-wrap italic mt-1.5">
                              {currentClient.notes || 'Keine medizinischen Notizen hinterlegt.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Danger Zone */}
                  {currentClient.isArchived ? (
                    <div className="pt-6 border-t border-rose-200/30 flex flex-col sm:flex-row gap-4 justify-between sm:items-center text-left">
                      <div>
                        <h4 className="text-[10px] font-bold text-rose-800 uppercase tracking-widest font-mono">Gefahrenbereich</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Diesen Klienten wiederherstellen oder endgültig aus der Datenbank entfernen.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <button
                          onClick={async () => {
                            await restoreClient(currentClient.id);
                          }}
                          className="bg-zinc-50 hover:bg-zinc-100 text-zinc-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Wiederherstellen
                        </button>
                        <button
                          onClick={() => {
                            setClientToDelete(currentClient);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/30 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Endgültig löschen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-6 border-t border-rose-200/30 flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-[10px] font-bold text-[#003527] uppercase tracking-widest font-mono">Klient archivieren</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Verschiebe diesen Klienten ins Archiv. Er kann dort jederzeit wiederhergestellt werden.</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm('Möchtest du diesen Klienten wirklich archivieren?')) {
                            await archiveClient(currentClient.id);
                          }
                        }}
                        className="bg-zinc-50 hover:bg-zinc-100 text-zinc-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 shadow-sm"
                      >
                        <Archive className="w-3.5 h-3.5 text-zinc-500" /> Archivieren
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'anamnesis' && (
                <CranioAnamnesisTab clientId={currentClient.id} isEditing={isEditingAnamnesis} setIsEditing={setIsEditingAnamnesis} />
              )}

              {activeTab === 'soap' && (
                <div className="text-left animate-fade-in">
                  <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-[#bfc9c3]/20 flex justify-between items-center bg-[#f9f9f8]/60">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#003527]/5 border border-[#bfc9c3]/30 text-[#003527]">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#003527]">Behandlungsverlauf</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Chronologische Dokumentation der Therapiesitzungen (SOAP).</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const tempId = `app-${Date.now()}`;
                          createSoapNote(tempId, currentClient.id);
                          // Auto-expand the newly created SOAP note
                          setExpandedNoteIds(prev => ({ ...prev, [tempId]: true }));
                        }}
                        className="bg-[#003527] hover:bg-[#0b513d] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer border-none shadow-sm flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Eintrag anlegen
                      </button>
                    </div>

                    {/* SOAP Notes List Table */}
                    <div className="overflow-x-auto">
                      {clientSoapNotes.length > 0 ? (
                        <table className="w-full text-left text-xs min-w-[600px]">
                          <thead>
                            <tr className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#bfc9c3]/20 bg-[#f9f9f8]/20">
                              <th className="py-3 pl-5 font-semibold">Datum</th>
                              <th className="py-3 font-semibold">Schmerz (VAS)</th>
                              <th className="py-3 font-semibold">Vorschau</th>
                              <th className="py-3 text-right pr-5 font-semibold">Aktionen</th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#003527]">
                            {clientSoapNotes.map((note) => {
                              const isExpanded = !!expandedNoteIds[note.id] || soapEditId === note.id;

                              return (
                                <React.Fragment key={note.id}>
                                  <tr 
                                    onClick={() => toggleSoapNoteExpand(note.id)}
                                    className={`hover:bg-[#003527]/3 transition-colors border-b border-zinc-100/60 last:border-b-0 cursor-pointer select-none group ${
                                      isExpanded ? 'bg-[#003527]/[0.02]' : ''
                                    }`}
                                  >
                                    {/* Date */}
                                    <td className="py-3 pl-5 text-xs">
                                      <span>
                                        {formatGermanDate(note.date)}
                                      </span>
                                    </td>

                                    {/* Schmerz (VAS) */}
                                    <td className="py-3 text-xs">
                                      {(() => {
                                        const sub = parseSoapSubjective(note.subjective);
                                        if (sub.complaints.length > 0) {
                                          const highestPain = Math.max(...sub.complaints.map(c => c.painLevel));
                                          return (
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase border whitespace-nowrap leading-none ${
                                              highestPain >= 8 
                                                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                                : highestPain >= 4 
                                                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            }`}>
                                              {highestPain}/10
                                            </span>
                                          );
                                        }
                                        return <span className="text-zinc-300 font-normal">—</span>;
                                      })()}
                                    </td>

                                    {/* Vorschau */}
                                    <td className="py-3 text-xs text-zinc-400 font-semibold max-w-[200px] sm:max-w-[400px] truncate">
                                      {(() => {
                                        const sub = parseSoapSubjective(note.subjective);
                                        const firstComp = sub.complaints[0]?.description;
                                        if (firstComp) {
                                          return firstComp + (sub.text ? ` - ${sub.text}` : '');
                                        }
                                        return sub.text || <span className="text-zinc-300 font-normal">Keine Notizen</span>;
                                      })()}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 pr-5 text-xs text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-2">
                                        {soapEditId === note.id ? (
                                          <button 
                                            onClick={saveSoapNote} 
                                            className="text-[10px] font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none shadow-sm"
                                          >
                                            Speichern
                                          </button>
                                        ) : (
                                          <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                                            <button 
                                              onClick={() => startEditSoap(note)} 
                                              className="text-[10px] font-extrabold text-zinc-500 hover:text-[#003527] flex items-center gap-1 cursor-pointer border border-[#bfc9c3]/30 bg-white hover:bg-zinc-50 px-2.5 py-1.5 rounded-xl transition-all shadow-sm"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" /> Bearbeiten
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteSoapNote(note.id)} 
                                              className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1 cursor-pointer border border-rose-100 bg-white px-2.5 py-1.5 rounded-xl transition-all shadow-sm"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" /> Löschen
                                            </button>
                                          </div>
                                        )}
                                        
                                        <div 
                                          onClick={() => toggleSoapNoteExpand(note.id)}
                                          className="p-1.5 rounded-xl hover:bg-zinc-200/50 transition-colors text-zinc-400 cursor-pointer"
                                        >
                                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>

                                  {isExpanded && (
                                    <tr onClick={(e) => e.stopPropagation()}>
                                      <td colSpan={4} className="bg-[#f9f9f8]/40 border-b border-zinc-100/60 p-5">
                                        {soapEditId === note.id ? (
                                          <div className="space-y-4">
                                            {/* Date Editor */}
                                            <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-4 max-w-[240px] text-left space-y-2">
                                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Datum des Eintrags</label>
                                              <input
                                                type="date"
                                                value={soapDate}
                                                onChange={(e) => setSoapDate(e.target.value)}
                                                className="w-full bg-[#f9f9f8] border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3.5 py-2 font-semibold text-xs text-[#003527] outline-none transition-all"
                                              />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs text-left">
                                            {/* Left Column */}
                                            {(() => {
                                              const sub = parseSoapSubjective(soapSubjective);
                                              return (
                                                <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4">
                                                  <div className="flex justify-between items-center pb-3 border-b border-zinc-100/60">
                                                    <div className="flex items-center gap-3">
                                                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                                                        <Activity className="w-4 h-4" />
                                                      </div>
                                                      <div className="text-left">
                                                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Befinden & Symptome</h4>
                                                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Symptome und Schmerzstärke verwalten</p>
                                                      </div>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const sub = parseSoapSubjective(soapSubjective);
                                                        const updated = [...sub.complaints, { description: '', painLevel: 5 }];
                                                        setSoapSubjective(serializeSoapSubjective(sub.text, updated));
                                                      }}
                                                      className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-[#003527] hover:bg-[#0b513d] text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none shadow-sm active:scale-95"
                                                    >
                                                      <Plus className="w-3.5 h-3.5" />
                                                      <span>Symptom</span>
                                                    </button>
                                                  </div>

                                                  <div className="space-y-3">
                                                    {sub.complaints.map((complaint, cIdx) => (
                                                      <div 
                                                        key={cIdx} 
                                                        className="p-3 bg-[#f9f9f8] border border-zinc-200/50 rounded-xl space-y-2.5 relative group/item"
                                                      >
                                                        <div className="flex items-center justify-between gap-2">
                                                          <input
                                                            type="text"
                                                            value={complaint.description}
                                                            onChange={(e) => {
                                                              const updated = sub.complaints.map((c, i) => i === cIdx ? { ...c, description: e.target.value } : c);
                                                              setSoapSubjective(serializeSoapSubjective(sub.text, updated));
                                                            }}
                                                            placeholder="z.B. Nackenschmerzen / Verspannung..."
                                                            className="w-full bg-white border border-[#bfc9c3]/30 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-3 py-2 font-bold text-xs text-[#003527] outline-none transition-all"
                                                          />
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              const updated = sub.complaints.filter((_, i) => i !== cIdx);
                                                              setSoapSubjective(serializeSoapSubjective(sub.text, updated));
                                                            }}
                                                            className="text-zinc-400 hover:text-rose-600 p-1.5 rounded border border-[#bfc9c3]/30 bg-white hover:bg-zinc-50 shadow-sm cursor-pointer transition-all active:scale-95"
                                                            title="Symptom entfernen"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3 bg-white border border-zinc-200/40 px-3 py-2 rounded-xl">
                                                          <span className="text-[10px] font-bold text-zinc-400 w-24">Schmerz (0-10):</span>
                                                          <input
                                                            type="range"
                                                            min="0"
                                                            max="10"
                                                            value={complaint.painLevel}
                                                            onChange={(e) => {
                                                              const updated = sub.complaints.map((c, i) => i === cIdx ? { ...c, painLevel: parseInt(e.target.value) } : c);
                                                              setSoapSubjective(serializeSoapSubjective(sub.text, updated));
                                                            }}
                                                            className="flex-grow accent-[#003527] h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
                                                          />
                                                          <span className="text-xs font-extrabold text-rose-600 w-6 text-right select-none">
                                                            {complaint.painLevel}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>

                                                  <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Weitere Anmerkungen</label>
                                                    <textarea 
                                                      rows={4}
                                                      value={sub.text} 
                                                      onChange={(e) => {
                                                        setSoapSubjective(serializeSoapSubjective(e.target.value, sub.complaints));
                                                      }} 
                                                      placeholder="Weitere Details zum Befinden des Klienten..."
                                                      className="w-full bg-[#f9f9f8] border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl p-3 text-xs text-[#003527] outline-none transition-all resize-y min-h-[90px]" 
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            })()}

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                              {/* Card 2: Beobachtung & Befund */}
                                              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-3">
                                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-100/60">
                                                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                                                    <ClipboardList className="w-4 h-4" />
                                                  </div>
                                                  <div className="text-left">
                                                    <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Beobachtung & Befund</h4>
                                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Tastbefunde & körperlicher Zustand</p>
                                                  </div>
                                                </div>
                                                <textarea 
                                                  rows={3}
                                                  value={soapObjective} 
                                                  onChange={(e) => setSoapObjective(e.target.value)} 
                                                  placeholder="Tastbefund, Blockaden, Verspannungen..."
                                                  className="w-full bg-[#f9f9f8] border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl p-3 text-xs text-[#003527] outline-none transition-all resize-y min-h-[80px]" 
                                                />
                                              </div>

                                              {/* Card 3: Klinische Einschätzung */}
                                              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-3">
                                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-100/60">
                                                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                                                    <Brain className="w-4 h-4" />
                                                  </div>
                                                  <div className="text-left">
                                                    <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Klinische Einschätzung</h4>
                                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Therapeutische Hypothese & Entwicklung</p>
                                                  </div>
                                                </div>
                                                <textarea 
                                                  rows={3}
                                                  value={soapAssessment} 
                                                  onChange={(e) => setSoapAssessment(e.target.value)} 
                                                  placeholder="Interpretation der Reaktionen, Gewebezustand..."
                                                  className="w-full bg-[#f9f9f8] border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl p-3 text-xs text-[#003527] outline-none transition-all resize-y min-h-[80px]" 
                                                />
                                              </div>

                                              {/* Card 4: Weiteres Vorgehen & Plan */}
                                              <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-3">
                                                <div className="flex items-center gap-3 pb-2 border-b border-zinc-100/60">
                                                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                                                    <Target className="w-4 h-4" />
                                                  </div>
                                                  <div className="text-left">
                                                    <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Weiteres Vorgehen & Plan</h4>
                                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Fokus der nächsten Termine & Empfehlungen</p>
                                                  </div>
                                                </div>
                                                <textarea 
                                                  rows={3}
                                                  value={soapPlan} 
                                                  onChange={(e) => setSoapPlan(e.target.value)} 
                                                  placeholder="Nächste Schritte, Übungen für Zuhause, Terminintervalle..."
                                                  className="w-full bg-[#f9f9f8] border border-zinc-200/50 focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl p-3 text-xs text-[#003527] outline-none transition-all resize-y min-h-[80px]" 
                                                />
                                              </div>
                                            </div>
                                          </div>
                                         </div>
                                        ) : (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                            {/* Card 1: Befinden & Symptome */}
                                            {(() => {
                                              const sub = parseSoapSubjective(note.subjective);
                                              return (
                                                <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60">
                                                  <div className="space-y-3.5 w-full">
                                                    <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-100">
                                                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/40 text-amber-700">
                                                        <Activity className="w-4 h-4" />
                                                      </div>
                                                      <div className="text-left">
                                                        <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Befinden & Symptome</h4>
                                                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Subjektives Empfinden & Schmerzangaben</p>
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Complaints tags */}
                                                    {sub.complaints.length > 0 && (
                                                      <div className="flex flex-wrap gap-1.5">
                                                        {sub.complaints.map((complaint, cIdx) => (
                                                          <div key={cIdx} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200/40 px-2.5 py-1 rounded-xl text-[10px]">
                                                            <span className="font-bold text-[#003527]">{complaint.description || 'Beschwerde'}</span>
                                                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border whitespace-nowrap ${
                                                              complaint.painLevel >= 8 
                                                                ? 'bg-rose-50 border-rose-200/50 text-rose-800' 
                                                                : complaint.painLevel >= 4 
                                                                  ? 'bg-amber-50 border-amber-200/50 text-amber-800' 
                                                                  : 'bg-emerald-50 border-emerald-200/50 text-emerald-800'
                                                            }`}>
                                                              VAS {complaint.painLevel}/10
                                                            </span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}

                                                    {sub.text.trim() && (
                                                      <p className="text-xs font-semibold text-[#003527] leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-amber-500/20 italic">
                                                        {sub.text}
                                                      </p>
                                                    )}

                                                    {!sub.text.trim() && sub.complaints.length === 0 && (
                                                      <p className="text-xs font-medium text-zinc-400 italic">Keine Angaben vorhanden.</p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                            
                                            {/* Card 2: Beobachtung & Befund */}
                                            <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60">
                                              <div className="space-y-3.5 w-full">
                                                <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-100">
                                                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/40 text-blue-700">
                                                    <ClipboardList className="w-4 h-4" />
                                                  </div>
                                                  <div className="text-left">
                                                    <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Beobachtung & Befund</h4>
                                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Objektiver Tastbefund & Körperspannung</p>
                                                  </div>
                                                </div>
                                                <p className="text-xs font-semibold text-[#003527] leading-relaxed whitespace-pre-wrap">
                                                  {note.objective?.trim() ? note.objective : 'Keine Angaben vorhanden.'}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Card 3: Klinische Einschätzung */}
                                            <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60">
                                              <div className="space-y-3.5 w-full">
                                                <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-100">
                                                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/40 text-emerald-700">
                                                    <Brain className="w-4 h-4" />
                                                  </div>
                                                  <div className="text-left">
                                                    <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Klinische Einschätzung</h4>
                                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Therapeutische Hypothese & Gewebequalität</p>
                                                  </div>
                                                </div>
                                                <p className="text-xs font-semibold text-[#003527] leading-relaxed whitespace-pre-wrap">
                                                  {note.assessment?.trim() ? note.assessment : 'Keine Angaben vorhanden.'}
                                                </p>
                                              </div>
                                            </div>

                                            {/* Card 4: Weiteres Vorgehen & Plan */}
                                            <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#bfc9c3]/60">
                                              <div className="space-y-3.5 w-full">
                                                <div className="flex items-center gap-3 pb-2.5 border-b border-zinc-100">
                                                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200/40 text-purple-700">
                                                    <Target className="w-4 h-4" />
                                                  </div>
                                                  <div className="text-left">
                                                    <h4 className="font-extrabold text-xs text-[#003527] uppercase tracking-wider">Weiteres Vorgehen & Plan</h4>
                                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Empfehlungen & Behandlungsfokus für Folgesitzung</p>
                                                  </div>
                                                </div>
                                                <p className="text-xs font-semibold text-[#003527] leading-relaxed whitespace-pre-wrap">
                                                  {note.plan?.trim() ? note.plan : 'Keine Angaben vorhanden.'}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 text-xs text-zinc-400 font-semibold italic">
                          Keine Behandlungsberichte für diesen Klienten vorhanden.
                        </div>
                      )}
                    </div>
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
                      <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-4 text-left flex flex-col justify-between hover:border-[#bfc9c3]/50 transition-all duration-300">
                        <span className="text-[10px] font-bold text-[#003527]/60 uppercase tracking-wider">Gesamtforderung</span>
                        <span className="text-lg font-extrabold text-[#003527] mt-1">{totalBilled.toFixed(2)} €</span>
                      </div>
                      <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/40 p-4 text-left flex flex-col justify-between hover:border-emerald-200/60 transition-all duration-300 text-emerald-800">
                        <span className="text-[10px] font-bold text-emerald-750 uppercase tracking-wider">Bezahlt</span>
                        <span className="text-lg font-extrabold text-emerald-800 mt-1">{totalPaid.toFixed(2)} €</span>
                      </div>
                      <div className={`rounded-2xl border p-4 text-left flex flex-col justify-between transition-all duration-300 ${
                        totalOutstanding > 0 
                          ? 'border-amber-200/40 bg-amber-50/40 text-amber-800' 
                          : 'bg-white border-[#bfc9c3]/30 text-zinc-400'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ausstehend</span>
                        <span className={`text-lg font-extrabold mt-1 ${totalOutstanding > 0 ? 'text-amber-800' : 'text-zinc-400'}`}>
                          {totalOutstanding.toFixed(2)} €
                        </span>
                      </div>
                    </div>

                    {/* Document Locker */}
                    <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 transition-all duration-300 hover:border-[#bfc9c3]/60">
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

                      {/* DSGVO Consent Status Banner */}
                      <div className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                        currentClient.gdprAccepted
                          ? 'bg-emerald-50/40 border-emerald-200/40 text-emerald-800'
                          : 'bg-amber-50/40 border-amber-200/40 text-amber-800'
                      }`}>
                        <div className="flex items-start gap-2.5 text-left">
                          {currentClient.gdprAccepted ? (
                            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-700 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="p-1 rounded-md bg-amber-100 text-amber-700 mt-0.5">
                              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-[#003527]">
                              {currentClient.gdprAccepted ? 'DSGVO-Patienteneinwilligung erteilt' : 'DSGVO-Patienteneinwilligung ausstehend'}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-semibold">
                              {currentClient.gdprAccepted 
                                ? 'Die datenschutzrechtliche Einwilligungserklärung liegt vor und wurde vom Klienten digital oder schriftlich unterzeichnet.' 
                                : 'Die schriftliche oder digitale Einwilligung zur Speicherung und Verarbeitung gesundheitsbezogener Daten fehlt.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (currentClient.gdprAccepted) {
                              toggleClientGdpr(currentClient.id);
                            } else {
                              openGdprModal(currentClient.id);
                            }
                          }}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex-shrink-0 active:scale-95 shadow-sm ${
                            currentClient.gdprAccepted
                              ? 'bg-white hover:bg-emerald-50 border-emerald-200/60 text-emerald-700'
                              : 'bg-[#003527] hover:bg-[#0b513d] text-white border-transparent'
                          }`}
                        >
                          {currentClient.gdprAccepted ? 'Widerrufen' : 'Jetzt unterzeichnen'}
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
                    <div className="bg-white rounded-2xl border border-[#bfc9c3]/30 p-5 space-y-4 transition-all duration-300 hover:border-[#bfc9c3]/60">
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
                                const dateVal = new Date().toISOString().slice(0, 10);
                                const dueVal = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                                const monthNames = [
                                  "Januar", "Februar", "März", "April", "Mai", "Juni", 
                                  "Juli", "August", "September", "Oktober", "November", "Dezember"
                                ];
                                const serviceDateVal = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;

                                const clientSnapshot = {
                                  name: currentClient.name,
                                  email: currentClient.email,
                                  phone: currentClient.phone,
                                  address: currentClient.address || '',
                                  street: currentClient.street || '',
                                  houseNumber: currentClient.houseNumber || '',
                                  zipCode: currentClient.zipCode || '',
                                  city: currentClient.city || ''
                                };

                                const lineItems = [
                                  { id: '1', description: 'Therapeutische Behandlung / Physiotherapie', price: amount, taxRate: 0 }
                                ];

                                supabase
                                  .from('invoices')
                                  .insert({
                                    id: invoiceId,
                                    user_id: therapistId,
                                    appointment_id: null,
                                    client_id: currentClient.id,
                                    invoice_number: invNum,
                                    amount: amount,
                                    date: dateVal,
                                    status: 'open',
                                    due_date: dueVal,
                                    service_date: serviceDateVal,
                                    client_snapshot: clientSnapshot,
                                    line_items: lineItems,
                                    is_small_business: isSmallBusiness
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
                                      date: dateVal,
                                      status: 'open' as const,
                                      dueDate: dueVal,
                                      serviceDate: serviceDateVal,
                                      clientSnapshot: clientSnapshot,
                                      lineItems: lineItems,
                                      isSmallBusiness: isSmallBusiness
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
                                  <td className="py-3 text-xs text-zinc-400 font-semibold">{formatGermanDate(inv.date)}</td>
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

      {clientToDelete && (
        <DeleteClientConfirmationModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => {
            setIsDeleteConfirmOpen(false);
            setClientToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          clientName={clientToDelete.name}
        />
      )}
    </div>
  );
}
