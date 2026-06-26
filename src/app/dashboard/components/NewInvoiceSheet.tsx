'use client';

import React from 'react';
import { 
  X, ZoomOut, ZoomIn, ChevronDown, Plus, Trash2, Check, Search 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};

export default function NewInvoiceSheet() {
  const {
    isNewInvoiceSheetOpen,
    setIsNewInvoiceSheetOpen,
    therapistName,
    address,
    phone,
    clients,
    invoices,
    setNewInvoiceClientId,
    newInvoiceClientId,
    newInvoiceAmount,
    setNewInvoiceAmount,
    newInvoiceDate,
    setNewInvoiceDate,
    newInvoiceNumber,
    setNewInvoiceNumber,
    newInvoiceStatus,
    setNewInvoiceStatus,
    newInvoiceAppointmentId,
    setNewInvoiceAppointmentId,
    appointments,
    handleCreateInvoice,
    setIsNewClientModalOpen,
    setNewClientName,
    showToast
  } = useDashboard();

  // Local state for line items in the invoice creator
  const [lineItems, setLineItems] = React.useState<{ id: string; description: string; price: number }[]>([]);

  // Local state for patient dropdown and invoice due date
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false);
  const [sidebarClientSearch, setSidebarClientSearch] = React.useState('');
  const [newInvoiceDueDate, setNewInvoiceDueDate] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Local state for canvas patient autocomplete search
  const [canvasClientSearch, setCanvasClientSearch] = React.useState('');
  const [isCanvasSearchFocused, setIsCanvasSearchFocused] = React.useState(false);

  // Local state for canvas zoom scale
  const [zoomScale, setZoomScale] = React.useState(100);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedClientForInvoice = clients.find(c => c.id === newInvoiceClientId);
  const filteredClientsForSidebar = clients.filter(c => 
    c.name.toLowerCase().includes(sidebarClientSearch.toLowerCase())
  );

  // Sync new client creation with invoice selection
  const prevClientsLength = React.useRef(clients.length);
  React.useEffect(() => {
    if (clients.length > prevClientsLength.current && isNewInvoiceSheetOpen) {
      const newestClient = clients[clients.length - 1];
      if (newestClient) {
        setNewInvoiceClientId(newestClient.id);
        setCanvasClientSearch(newestClient.name);
      }
    }
    prevClientsLength.current = clients.length;
  }, [clients, isNewInvoiceSheetOpen, setNewInvoiceClientId]);

  const calculateDefaultDueDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  };

  const getDaysDifference = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 14;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 14;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 14;
  };

  const formatDateGerman = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Synchronize newInvoiceDueDate and zoomScale when the invoice modal opens or newInvoiceDate changes
  React.useEffect(() => {
    if (isNewInvoiceSheetOpen) {
      setZoomScale(100);
      if (newInvoiceDate) {
        setNewInvoiceDueDate(calculateDefaultDueDate(newInvoiceDate));
      } else {
        const today = new Date().toISOString().slice(0, 10);
        setNewInvoiceDueDate(calculateDefaultDueDate(today));
      }
    }
  }, [isNewInvoiceSheetOpen, newInvoiceDate]);

  // Synchronize canvasClientSearch when newInvoiceClientId or clients changes
  React.useEffect(() => {
    const client = clients.find(c => c.id === newInvoiceClientId);
    setCanvasClientSearch(client ? client.name : '');
  }, [newInvoiceClientId, clients]);

  // Memoized inline suggestion for canvas autocomplete
  const inlineSuggestion = React.useMemo(() => {
    if (!canvasClientSearch || !isCanvasSearchFocused) return '';
    const match = clients.find(c => 
      c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase())
    );
    if (match && match.name.toLowerCase() !== canvasClientSearch.toLowerCase()) {
      return match.name;
    }
    return '';
  }, [canvasClientSearch, clients, isCanvasSearchFocused]);

  const handleCanvasSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight') {
      if (inlineSuggestion) {
        const match = clients.find(c => 
          c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase())
        );
        if (match) {
          e.preventDefault();
          setNewInvoiceClientId(match.id);
          setCanvasClientSearch(match.name);
          setIsCanvasSearchFocused(false);
        }
      }
    }
  };

  // Synchronize line items when the invoice modal opens
  React.useEffect(() => {
    if (isNewInvoiceSheetOpen) {
      if (newInvoiceAppointmentId) {
        const app = appointments.find(a => a.id === newInvoiceAppointmentId);
        if (app) {
          setLineItems([
            { id: '1', description: app.serviceName, price: app.price }
          ]);
          return;
        }
      }
      
      if (newInvoiceAmount) {
        setLineItems([
          { id: '1', description: 'Behandlung / Leistung', price: parseFloat(newInvoiceAmount.replace(',', '.')) || 0 }
        ]);
        return;
      }

      setLineItems([
        { id: '1', description: 'Physiotherapeutische Behandlung', price: 0 }
      ]);
    } else {
      setLineItems([]);
    }
  }, [isNewInvoiceSheetOpen, newInvoiceAppointmentId, newInvoiceAmount, appointments]);

  // Compute total dynamically
  const calculatedTotal = lineItems.reduce((sum, item) => sum + item.price, 0);

  // Sync computed total back to context newInvoiceAmount state
  React.useEffect(() => {
    setNewInvoiceAmount(calculatedTotal.toFixed(2));
  }, [calculatedTotal, setNewInvoiceAmount]);

  if (!isNewInvoiceSheetOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="fixed inset-0 bg-[#f9f9f8] z-[150] flex flex-col overflow-hidden text-left font-sans"
    >
      <form onSubmit={handleCreateInvoice} className="h-full w-full flex flex-col overflow-hidden">
        {/* Split Workspace */}
        <div className="flex-grow flex min-h-0 overflow-hidden relative">
          {/* Floating exit button */}
          <button
            type="button"
            onClick={() => setIsNewInvoiceSheetOpen(false)}
            className="absolute top-6 left-6 w-9 h-9 rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer z-20 border-none"
            title="Abbrechen"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Side Container: DINA4 Document Canvas Workspace */}
          <div className="flex-grow bg-[#f3f4f3] relative flex flex-col min-h-0">
            {/* Scrollable Canvas Viewport */}
            <div className="flex-grow overflow-y-auto p-12 flex justify-center items-start min-h-0">
              
              {/* DIN A4 Canvas Sheet Wrapper for Zooming */}
              <div
                style={{
                  transform: `scale(${zoomScale / 100})`,
                  transformOrigin: 'top center',
                  width: '100%',
                  maxWidth: '800px',
                  marginBottom: `${(zoomScale / 100 - 1) * 1130}px`
                }}
                className="transition-all duration-200 flex justify-center"
              >
                {/* DIN A4 Canvas Sheet */}
                <div className="bg-white shadow-2xl rounded-lg p-16 border border-[#bfc9c3]/30 w-full min-h-[1130px] flex flex-col justify-between text-[#003527] font-sans relative my-4">
                  
                  {/* DINA4 Header: Letterhead */}
                  <div>
                    <div className="flex justify-between items-start border-b border-[#bfc9c3]/20 pb-8 mb-10">
                      <div className="text-left space-y-1">
                        <h4 className="text-base font-extrabold text-[#003527] tracking-tight">{therapistName}</h4>
                        <p className="text-[10px] text-zinc-400 font-semibold">{address}</p>
                        <p className="text-[10px] text-zinc-400 font-semibold">Tel: {phone}</p>
                      </div>
                      <div className="text-right">
                        <h1 className="text-xl font-bold tracking-widest text-[#003527]/40 font-serif">RECHNUNG</h1>
                      </div>
                    </div>

                    {/* Recipient on the left, details on the right split layout */}
                    <div className="grid grid-cols-2 gap-8 border-b border-[#bfc9c3]/20 pb-8 mb-10 text-[#003527]">
                      {/* Left: Recipient */}
                      <div className="text-left space-y-2 relative">
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Rechnungsempfänger</p>
                        
                        {/* Autocomplete Search input */}
                        <div className="relative w-full flex items-center">
                          {/* Underlay text for suggestion */}
                          {inlineSuggestion && (
                            <div className="absolute left-0 right-0 px-2 py-1 pointer-events-none font-extrabold text-sm select-none text-zinc-300 whitespace-pre flex items-center">
                              <span className="opacity-0">{canvasClientSearch}</span>
                              <span>{inlineSuggestion.slice(canvasClientSearch.length)}</span>
                            </div>
                          )}
                          
                          <input
                            type="text"
                            value={canvasClientSearch}
                            onFocus={() => setIsCanvasSearchFocused(true)}
                            onBlur={() => {
                              setTimeout(() => setIsCanvasSearchFocused(false), 200);
                            }}
                            onKeyDown={handleCanvasSearchKeyDown}
                            onChange={(e) => {
                              setCanvasClientSearch(e.target.value);
                              // If user clears name, clear ID
                              if (!e.target.value) {
                                setNewInvoiceClientId('');
                              }
                            }}
                            placeholder="Name des Klienten..."
                            className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 px-2 py-1 outline-none font-extrabold text-sm text-[#003527] transition-all rounded-lg z-10"
                          />
                        </div>

                        {/* Recipient Details display below input */}
                        {(() => {
                          const client = clients.find(c => c.id === newInvoiceClientId);
                          if (client) {
                            return (
                              <div className="space-y-0.5 text-xs text-zinc-400 font-semibold pl-2 transition-all animate-in fade-in duration-200">
                                <p className="text-[11px]">{client.email}</p>
                                <p className="text-[11px]">{client.phone}</p>
                              </div>
                            );
                          }
                          
                          if (inlineSuggestion) {
                            const match = clients.find(c => c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase()));
                            if (match) {
                              return (
                                <div className="space-y-0.5 text-xs text-zinc-300/55 font-semibold pl-2 transition-all animate-in fade-in duration-200">
                                  <p className="text-[11px]">{match.email} (Vorschau)</p>
                                  <p className="text-[11px]">{match.phone} (Vorschau)</p>
                                </div>
                              );
                            }
                          }
                          if (canvasClientSearch && !clients.some(c => c.name.toLowerCase().startsWith(canvasClientSearch.toLowerCase()))) {
                            return (
                              <div className="pl-2 pt-1 animate-in fade-in duration-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewClientName(canvasClientSearch);
                                    setIsNewClientModalOpen(true);
                                  }}
                                  className="text-[10.5px] text-[#003527] hover:text-[#0b513d] font-bold hover:underline cursor-pointer flex items-center gap-1.5 transition-all border-none bg-transparent"
                                >
                                  <Plus className="w-3.5 h-3.5" /> "{canvasClientSearch}" als neuen Klienten anlegen
                                </button>
                              </div>
                            );
                          }

                          return (
                            <p className="text-[10px] text-amber-600 font-semibold pl-2 italic">
                              Bitte Namen eingeben, um Klienten auszuwählen.
                            </p>
                          );
                        })()}
                      </div>

                      {/* Right: Details (Rechnungsdaten) */}
                      <div className="flex flex-col items-end justify-start text-right">
                        <div className="w-full max-w-[240px] space-y-2 text-xs font-bold">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Rechnungs-Nr.</span>
                            <input
                              type="text"
                              required
                              value={newInvoiceNumber}
                              onChange={(e) => setNewInvoiceNumber(e.target.value)}
                              className="w-32 bg-transparent border border-transparent hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Datum</span>
                            <input
                              type="date"
                              required
                              value={newInvoiceDate}
                              onChange={(e) => setNewInvoiceDate(e.target.value)}
                              className="w-32 bg-transparent border border-transparent hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg animate-none"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Zahlungsziel</span>
                            <div className="flex items-center gap-1.5 justify-end">
                              <span className="text-[10px] text-zinc-400 font-semibold pr-1">
                                ({getDaysDifference(newInvoiceDate || new Date().toISOString().slice(0, 10), newInvoiceDueDate)} Tage)
                              </span>
                              <input
                                type="date"
                                required
                                value={newInvoiceDueDate}
                                onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                                className="w-32 bg-transparent border border-transparent hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 px-2 py-1 outline-none font-bold text-xs text-right text-[#003527] transition-all rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-4">
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider border-b border-[#bfc9c3]/20 pb-2">Rechnungspositionen</p>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-zinc-400 font-bold uppercase tracking-wider text-[9px] border-b border-[#bfc9c3]/20">
                            <th className="py-2 w-12 font-bold">Pos.</th>
                            <th className="py-2 font-bold">Leistungsbeschreibung</th>
                            <th className="py-2 text-right w-28 font-bold">Betrag</th>
                            <th className="py-2 text-right w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, idx) => (
                            <tr key={item.id} className="border-b border-[#bfc9c3]/10 group/row font-bold text-[#003527]">
                              <td className="py-3.5 font-mono text-zinc-400 text-left">{idx + 1}</td>
                              <td className="py-2">
                                <input
                                  type="text"
                                  required
                                  value={item.description}
                                  onChange={(e) => {
                                    const updated = lineItems.map(li => li.id === item.id ? { ...li, description: e.target.value } : li);
                                    setLineItems(updated);
                                  }}
                                  className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 focus:ring-0 px-2 py-1 outline-none font-bold text-xs text-[#003527] transition-all text-left rounded-lg"
                                  placeholder="z.B. Osteopathische Behandlung"
                                />
                              </td>
                              <td className="py-2 text-right">
                                <div className="inline-flex items-center justify-end">
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={item.price || ''}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      const updated = lineItems.map(li => li.id === item.id ? { ...li, price: val } : li);
                                      setLineItems(updated);
                                    }}
                                    className="w-20 bg-transparent border border-transparent hover:border-zinc-200 focus:border-[#003527] focus:bg-[#003527]/5 focus:ring-0 px-2 py-1 outline-none font-bold text-right text-xs text-[#003527] transition-all rounded-lg"
                                    placeholder="0,00"
                                  />
                                  <span className="ml-1 text-zinc-400 font-bold">€</span>
                                </div>
                              </td>
                              <td className="py-2 text-right">
                                {lineItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLineItems(lineItems.filter(li => li.id !== item.id));
                                    }}
                                    className="text-rose-600 hover:text-rose-700 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer p-1 border-none bg-transparent"
                                    title="Position löschen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Add item button */}
                      <button
                        type="button"
                        onClick={() => {
                          setLineItems([
                            ...lineItems,
                            { id: `li-${Date.now()}`, description: 'Neue Leistung', price: 0 }
                          ]);
                        }}
                        className="w-full mt-4 border border-dashed border-[#003527]/20 hover:border-[#003527]/40 bg-[#003527]/5 hover:bg-[#003527]/10 text-[#003527] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" /> Position hinzufügen
                      </button>
                    </div>
                  </div>

                  {/* DINA4 Footer & Total Block */}
                  <div className="mt-16 space-y-12">
                    {/* Total Sum */}
                    <div className="flex justify-end items-baseline gap-4 border-t border-[#bfc9c3]/20 pt-6">
                      <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Gesamtsumme:</span>
                      <span className="text-2xl font-extrabold text-[#003527] font-serif">{calculatedTotal.toFixed(2)} €</span>
                    </div>

                    {/* Bottom Payment Terms details */}
                    <div className="border-t border-[#bfc9c3]/20 pt-6 space-y-3">
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                        Bitte überweisen Sie den Rechnungsbetrag von <strong className="text-[#003527]">{calculatedTotal.toFixed(2)} €</strong> bis zum <strong className="text-[#003527]">{formatDateGerman(newInvoiceDueDate)}</strong> (innerhalb von {getDaysDifference(newInvoiceDate || new Date().toISOString().slice(0, 10), newInvoiceDueDate)} Tagen) unter Angabe der Rechnungsnummer <strong className="text-[#003527]">{newInvoiceNumber}</strong> auf das unten aufgeführte Praxiskonto.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-[9px] text-zinc-400 font-semibold border-t border-[#bfc9c3]/10 pt-3">
                        <div className="space-y-0.5">
                          <p>Inhaber: {therapistName}</p>
                          <p>Steuernummer: 12/345/67890</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p>IBAN: DE89 5003 0000 1234 5678 90</p>
                          <p>BIC: WELADED1XXX</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Floating Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-zinc-200/80 px-4 py-2 rounded-full shadow-lg flex items-center gap-3 z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.max(70, prev - 10))}
                disabled={zoomScale <= 70}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0 border-none bg-transparent"
                title="Verkleinern"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-extrabold text-[#003527] w-12 text-center select-none">
                {zoomScale}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.min(130, prev + 10))}
                disabled={zoomScale >= 130}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 disabled:opacity-40 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0 border-none bg-transparent"
                title="Vergrößern"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Side: Sidebar Panel */}
          <aside className="w-80 bg-white border-l border-[#bfc9c3]/30 p-6 flex flex-col justify-between overflow-y-auto flex-shrink-0">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-wider mb-4 border-b border-[#bfc9c3]/20 pb-2">Rechnungsdaten</h4>
              </div>

              <div className="space-y-5 text-left">
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Klient auswählen</label>
                  
                  {/* Custom Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientDropdownOpen(!isClientDropdownOpen);
                      setSidebarClientSearch('');
                    }}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-2.5 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] hover:border-zinc-300 transition-all cursor-pointer flex items-center justify-between gap-2 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {selectedClientForInvoice ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                            {getInitials(selectedClientForInvoice.name)}
                          </div>
                          <span className="truncate">{selectedClientForInvoice.name}</span>
                        </>
                      ) : (
                        <span className="text-zinc-400">Klient auswählen...</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  </button>

                  {/* Custom Dropdown Menu */}
                  {isClientDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[300px]">
                      {/* Search Input Container */}
                      <div className="p-2.5 bg-zinc-50/60 border-b border-zinc-100">
                        <div className="relative flex items-center">
                          <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                          <input
                            type="text"
                            value={sidebarClientSearch}
                            onChange={(e) => setSidebarClientSearch(e.target.value)}
                            placeholder="Klienten suchen..."
                            autoFocus
                            className="w-full bg-white border border-zinc-200/60 focus:border-zinc-300 rounded-lg pl-9 pr-3 py-1.5 font-bold text-xs text-[#003527] outline-none transition-all"
                          />
                        </div>
                      </div>
                      
                      {/* Patient Options List */}
                      <div className="overflow-y-auto py-1 flex-grow">
                        {filteredClientsForSidebar.length > 0 ? (
                          filteredClientsForSidebar.map(client => {
                            const isSelected = client.id === newInvoiceClientId;
                            return (
                              <button
                                type="button"
                                key={client.id}
                                onClick={() => {
                                  setNewInvoiceClientId(client.id);
                                  setIsClientDropdownOpen(false);
                                  setSidebarClientSearch('');
                                }}
                                className={`w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer text-left border-none bg-transparent ${
                                  isSelected 
                                    ? 'bg-[#003527]/10 text-[#003527]' 
                                    : 'text-[#003527] hover:bg-[#003527]/5 hover:text-[#003527]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                                    isSelected ? 'bg-[#003527]/20 text-[#003527]' : 'bg-zinc-100 text-zinc-500'
                                  }`}>
                                    {getInitials(client.name)}
                                  </div>
                                  <span className="truncate">{client.name}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-[#003527] flex-shrink-0 ml-2" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-3 text-xs text-zinc-400 font-semibold italic text-center">
                            Keine Klienten gefunden
                          </div>
                        )}
                      </div>

                      {/* Persistent Customer Add Button */}
                      <div className="border-t border-zinc-100 p-1.5 bg-zinc-50/40">
                        <button
                          type="button"
                          onClick={() => {
                            if (sidebarClientSearch) {
                              setNewClientName(sidebarClientSearch);
                            }
                            setIsNewClientModalOpen(true);
                            setIsClientDropdownOpen(false);
                          }}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold text-[#003527] hover:bg-[#003527]/5 hover:text-[#0b513d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-none bg-transparent"
                        >
                          <Plus className="w-3.5 h-3.5" /> Klient hinzufügen
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Rechnungsnummer</label>
                  <input
                    type="text"
                    required
                    value={newInvoiceNumber}
                    onChange={(e) => setNewInvoiceNumber(e.target.value)}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Rechnungsdatum</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceDate}
                    onChange={(e) => setNewInvoiceDate(e.target.value)}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest">Zahlungsstatus</label>
                  <select
                    required
                    value={newInvoiceStatus}
                    onChange={(e) => setNewInvoiceStatus(e.target.value as 'open' | 'paid' | 'overdue')}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                  >
                    <option value="open">Offen</option>
                    <option value="paid">Bezahlt</option>
                    <option value="overdue">Überfällig</option>
                  </select>
                </div>

                <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 p-4 rounded-2xl text-[10px] text-zinc-400 font-bold space-y-1">
                  <p className="text-[#003527] uppercase tracking-wider text-[8px] mb-1">Berechneter Gesamtbetrag</p>
                  <p className="text-base font-extrabold text-[#003527]">{calculatedTotal.toFixed(2)} €</p>
                  <p className="font-semibold text-zinc-400">({lineItems.length} Position(en))</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-[#bfc9c3]/20">
              <button
                type="submit"
                className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-none border-none"
              >
                <Check className="w-4 h-4" /> Rechnung speichern
              </button>
              <button
                type="button"
                onClick={() => setIsNewInvoiceSheetOpen(false)}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
              >
                Abbrechen
              </button>
            </div>
          </aside>
        </div>
      </form>
    </motion.div>
  );
}
