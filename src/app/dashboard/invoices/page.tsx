'use client';

import React, { useState } from 'react';
import { 
  Plus, Search, Mail, Download, Printer, Check, Clock, Trash2, ChevronRight, 
  MoreVertical, CheckCircle2, Activity, TrendingUp, Receipt, 
  AlertCircle, Bell, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { Invoice } from '@/lib/types';

export default function InvoicesPage() {
  const {
    invoices,
    appointments,
    clients,
    invoiceFilter,
    setInvoiceFilter,
    invoiceSearch,
    setInvoiceSearch,
    invoiceSubTab,
    setInvoiceSubTab,
    hoveredBarIndex,
    setHoveredBarIndex,
    activeInvoiceActionMenuId,
    setActiveInvoiceActionMenuId,
    openNewInvoiceSheet,
    isInvoiceMenuOpen,
    setIsInvoiceMenuOpen,
    exportInvoicesCsv,
    sendInvoiceEmail,
    downloadInvoicePdf,
    printInvoice,
    markInvoicePaid,
    sendInvoiceReminder,
    cancelInvoice,
    handleOpenMahnung,
    handleInvoiceContextMenu,
    showToast
  } = useDashboard();

  // Timeframe state
  const [timeframe, setTimeframe] = useState('YTD');

  // Selection state
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Filter invoices for list view
  const displayedInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesFilter = invoiceFilter === 'all' || inv.status === invoiceFilter;
    return matchesSearch && matchesFilter;
  });

  const isAllSelected = displayedInvoices.length > 0 && displayedInvoices.every(inv => selectedInvoiceIds.includes(inv.id));
  const isSomeSelected = displayedInvoices.length > 0 && displayedInvoices.some(inv => selectedInvoiceIds.includes(inv.id)) && !isAllSelected;

  // Filter invoices based on selected timeframe
  const filteredInvoicesByTime = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    const refDate = new Date('2026-06-01'); // Base context date
    if (timeframe === '30T') {
      const thirtyDaysAgo = new Date(refDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      return invDate >= thirtyDaysAgo && invDate <= refDate;
    }
    if (timeframe === 'YTD') {
      const startOfYear = new Date(refDate.getFullYear(), 0, 1);
      return invDate >= startOfYear && invDate <= refDate;
    }
    if (timeframe === '1J') {
      const oneYearAgo = new Date(refDate.getFullYear() - 1, refDate.getMonth(), refDate.getDate());
      return invDate >= oneYearAgo && invDate <= refDate;
    }
    return true; // Max
  });

  // Dynamic calculations for Financial Analytics (calculated from filtered list)
  const totalBilled = filteredInvoicesByTime.reduce((sum, inv) => sum + inv.amount, 0);
  const paidTotal = filteredInvoicesByTime.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidTotal = totalBilled - paidTotal;
  const collectionRate = totalBilled > 0 ? (paidTotal / totalBilled) * 100 : 0;
  const paidCount = filteredInvoicesByTime.filter(inv => inv.status === 'paid').length;
  const avgInvoiceAmount = filteredInvoicesByTime.length > 0 ? totalBilled / filteredInvoicesByTime.length : 0;

  // For Bento Card 2: Ausstehend & Risiko details
  const openTotal = filteredInvoicesByTime.filter(i => i.status === 'open').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueTotal = filteredInvoicesByTime.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueCount = filteredInvoicesByTime.filter(i => i.status === 'overdue').length;

  const getChartData = () => {
    const refDate = new Date('2026-06-01');
    if (timeframe === '30T') {
      // 4 weeks leading up to June 1st
      const data = [];
      for (let i = 3; i >= 0; i--) {
        const endWeek = new Date(refDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const startWeek = new Date(endWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
        const label = `W${4 - i}`;
        
        const weekInvoices = invoices.filter(inv => {
          const d = new Date(inv.date);
          return d >= startWeek && d < endWeek;
        });
        const total = weekInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paid = weekInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
        const unpaid = total - paid;
        data.push({ label, total, paid, unpaid });
      }
      return data;
    } else if (timeframe === '1J') {
      // 12 months
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('de-DE', { month: 'short' });
        const label = `${monthName}`;
        
        const monthlyInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.date);
          return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
        });
        const total = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paid = monthlyInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
        const unpaid = total - paid;
        data.push({ label, total, paid, unpaid });
      }
      return data;
    } else {
      // YTD or Max: 6 months
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('de-DE', { month: 'short' });
        const label = `${monthName}`;
        
        const monthlyInvoices = invoices.filter(inv => {
          const invDate = new Date(inv.date);
          return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
        });
        const total = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paid = monthlyInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
        const unpaid = total - paid;
        data.push({ label, total, paid, unpaid });
      }
      return data;
    }
  };

  const chartData = getChartData();

  const getServiceRevenueData = (filteredInvs: Invoice[]) => {
    const serviceMap: Record<string, { name: string; amount: number; count: number }> = {};
    filteredInvs.forEach(inv => {
      const app = appointments.find(a => a.id === inv.appointmentId);
      const serviceName = app ? app.serviceName : 'Sonstige Leistungen';
      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = { name: serviceName, amount: 0, count: 0 };
      }
      serviceMap[serviceName].amount += inv.amount;
      serviceMap[serviceName].count += 1;
    });
    return Object.values(serviceMap).sort((a, b) => b.amount - a.amount);
  };

  const serviceData = getServiceRevenueData(filteredInvoicesByTime);

  const getTopClients = (filteredInvs: Invoice[]) => {
    const clientMap: Record<string, { name: string; amount: number; count: number }> = {};
    filteredInvs.forEach(inv => {
      if (!clientMap[inv.clientName]) {
        clientMap[inv.clientName] = { name: inv.clientName, amount: 0, count: 0 };
      }
      clientMap[inv.clientName].amount += inv.amount;
      clientMap[inv.clientName].count += 1;
    });
    return Object.values(clientMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  };

  const topClients = getTopClients(filteredInvoicesByTime);
  const outstandingInvoices = filteredInvoicesByTime.filter(inv => inv.status === 'open' || inv.status === 'overdue');

  // SVG Area Chart drawing coordinates helpers
  const maxVal = Math.max(...chartData.map(d => d.total), 100);
  const chartWidth = 500;
  const chartHeight = 200;
  const paddingLeft = 40;
  const paddingRight = 480;
  const activeWidth = paddingRight - paddingLeft;
  const activeHeight = 140; // y goes from 40 to 180
  
  const getX = (index: number) => {
    if (chartData.length <= 1) return paddingLeft;
    return paddingLeft + index * (activeWidth / (chartData.length - 1));
  };
  
  const getY = (val: number) => {
    return 180 - (val / maxVal) * activeHeight;
  };

  const getBezierPath = (points: {x: number; y: number}[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i+1];
      
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const totalPoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.total) }));
  const totalLinePath = getBezierPath(totalPoints);
  const totalAreaPath = chartData.length > 0 
    ? `${totalLinePath} L ${getX(chartData.length - 1)},180 L ${getX(0)},180 Z` 
    : '';

  const paidPoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.paid) }));
  const paidLinePath = getBezierPath(paidPoints);
  const paidAreaPath = chartData.length > 0 
    ? `${paidLinePath} L ${getX(chartData.length - 1)},180 L ${getX(0)},180 Z` 
    : '';

  return (
    <div className="relative flex-grow bg-[#eef0ed] rounded-none lg:rounded-[24px] border-0 lg:border border-[#003527]/10 m-0 lg:my-4 lg:mr-4 lg:ml-4 flex flex-col h-[calc(100vh-64px)] lg:h-[calc(100vh-32px)] overflow-hidden shadow-none transition-all duration-300">
      {/* Header Layout (Dashboard Style) */}
      <div className="flex justify-between items-start w-full relative pl-6 lg:pl-8 pr-6 lg:pr-8 pt-6 lg:pt-10 pb-2 bg-transparent flex-shrink-0">
        <div className="text-left space-y-1.5 pt-0">
          <h1 className="text-[26px] font-bold text-[#003527] tracking-tight">Abrechnung</h1>
        </div>

        {/* Quick Add Button */}
        <div className="relative">
          <button 
            onClick={openNewInvoiceSheet}
            className="p-2 rounded-xl border border-[#bfc9c3]/50 bg-white text-[#003527] hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-none"
            title="Rechnung erstellen"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation (Sticky tabs inside Card) */}
      <div className="px-6 lg:px-8 bg-transparent flex-shrink-0 flex justify-between items-end border-b border-[#bfc9c3]/20 pb-0 select-none h-[42px] overflow-x-auto hide-scrollbar whitespace-nowrap">
        <div className="flex gap-4">
          <button
            onClick={() => setInvoiceSubTab('list')}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              invoiceSubTab === 'list' 
                ? 'text-[#003527]' 
                : 'text-zinc-400 hover:text-[#003527]'
            }`}
          >
            Rechnungen
            {invoiceSubTab === 'list' && (
              <motion.div 
                layoutId="invoiceSubTabLine" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003527]" 
              />
            )}
          </button>
          <button
            onClick={() => setInvoiceSubTab('analytics')}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              invoiceSubTab === 'analytics' 
                ? 'text-[#003527]' 
                : 'text-zinc-400 hover:text-[#003527]'
            }`}
          >
            Analysen
            {invoiceSubTab === 'analytics' && (
              <motion.div 
                layoutId="invoiceSubTabLine" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003527]" 
              />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-grow overflow-y-auto px-4 lg:px-8 py-6 space-y-6 pb-24 lg:pb-6">
        {/* Dropdown Backdrop */}
        {activeInvoiceActionMenuId && (
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setActiveInvoiceActionMenuId(null)}
          />
        )}

      {invoiceSubTab === 'list' ? (
        /* Rechnungsliste tab content wrapper with white container styling */
        <div className="bg-white border border-[#bfc9c3]/50 rounded-2xl p-4 lg:p-8 shadow-none space-y-6 relative">
          {/* Controls: Interactive Legend Filters & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-x-6 gap-y-3 text-xs border-b border-[#bfc9c3]/20 pb-3.5 -mx-4 lg:-mx-8 px-4 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-4 md:gap-x-5 gap-y-2.5">
              {/* Filter: Alle */}
              <button
                onClick={() => setInvoiceFilter('all')}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none text-left"
              >
                <span className={invoiceFilter === 'all' ? 'text-[#003527] font-bold underline decoration-2 underline-offset-8' : 'text-[#003527]/70 font-semibold hover:text-[#003527]'}>
                  Gesamt
                </span>
                <span className="font-extrabold text-[#003527] bg-[#003527]/5 border border-[#003527]/10 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                  {invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)} €
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  ({invoices.length})
                </span>
              </button>

              <div className="w-px h-3 bg-[#bfc9c3]/40 hidden md:block" />

              {/* Filter: Bezahlt */}
              <button
                onClick={() => setInvoiceFilter('paid')}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none text-left"
              >
                <span className={invoiceFilter === 'paid' ? 'text-[#003527] font-bold underline decoration-2 underline-offset-8' : 'text-[#003527]/70 font-semibold hover:text-[#003527]'}>
                  Bezahlt
                </span>
                <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                  {invoices
                    .filter(inv => inv.status === 'paid')
                    .reduce((sum, inv) => sum + inv.amount, 0)
                    .toFixed(2)}{' '}
                  €
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  ({invoices.filter(inv => inv.status === 'paid').length})
                </span>
              </button>
              
              <div className="w-px h-3 bg-[#bfc9c3]/40 hidden md:block" />
              
              {/* Filter: Offen */}
              <button
                onClick={() => setInvoiceFilter('open')}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none text-left"
              >
                <span className={invoiceFilter === 'open' ? 'text-[#003527] font-bold underline decoration-2 underline-offset-8' : 'text-[#003527]/70 font-semibold hover:text-[#003527]'}>
                  Offen
                </span>
                <span className="font-extrabold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                  {invoices
                    .filter(inv => inv.status === 'open')
                    .reduce((sum, inv) => sum + inv.amount, 0)
                    .toFixed(2)}{' '}
                  €
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  ({invoices.filter(inv => inv.status === 'open').length})
                </span>
              </button>
              
              <div className="w-px h-3 bg-[#bfc9c3]/40 hidden md:block" />
              
              {/* Filter: Überfällig */}
              <button
                onClick={() => setInvoiceFilter('overdue')}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none text-left"
              >
                <span className={invoiceFilter === 'overdue' ? 'text-[#003527] font-bold underline decoration-2 underline-offset-8' : 'text-[#003527]/70 font-semibold hover:text-[#003527]'}>
                  Überfällig
                </span>
                <span className="font-extrabold text-rose-800 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5 text-[11px] font-sans">
                  {invoices
                    .filter(inv => inv.status === 'overdue')
                    .reduce((sum, inv) => sum + inv.amount, 0)
                    .toFixed(2)}{' '}
                  €
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  ({invoices.filter(inv => inv.status === 'overdue').length})
                </span>
              </button>
            </div>

            {/* Right side: Search & Options */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechnung suchen..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/40 rounded-xl pl-9 pr-4 py-2 font-bold text-xs text-[#003527] focus:ring-1 focus:ring-[#003527] focus:border-[#003527] outline-none transition-all text-left"
                />
              </div>
            </div>
          </div>

          {/* Inline Bulk Actions Accordion */}
          <AnimatePresence initial={false}>
            {selectedInvoiceIds.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden border-b border-[#bfc9c3]/20 pb-3 -mx-4 lg:-mx-8 px-4 lg:px-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-[#003527] bg-[#f9f9f8]/50 border border-[#bfc9c3]/30 rounded-xl px-4 py-3 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#003527]/5 border border-[#003527]/10 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-sans font-extrabold text-[#003527]">
                      {selectedInvoiceIds.length}
                    </span>
                    <span>ausgewählt</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        selectedInvoiceIds.forEach(id => {
                          const inv = invoices.find(i => i.id === id);
                          if (inv && inv.status !== 'paid') markInvoicePaid(id);
                        });
                        setSelectedInvoiceIds([]);
                        showToast('Ausgewählte Rechnungen wurden als bezahlt markiert.');
                      }}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Als bezahlt markieren
                    </button>

                    <button
                      onClick={() => {
                        selectedInvoiceIds.forEach(id => {
                          const inv = invoices.find(i => i.id === id);
                          if (inv) sendInvoiceEmail(inv);
                        });
                        setSelectedInvoiceIds([]);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#bfc9c3]/50 text-[#003527] hover:bg-zinc-50 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> E-Mail senden
                    </button>

                    <button
                      onClick={() => {
                        selectedInvoiceIds.forEach(id => {
                          const inv = invoices.find(i => i.id === id);
                          if (inv) downloadInvoicePdf(inv);
                        });
                      }}
                      className="px-3 py-1.5 bg-white border border-[#bfc9c3]/50 text-[#003527] hover:bg-zinc-50 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF laden
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`${selectedInvoiceIds.length} Rechnungen wirklich stornieren?`)) {
                          selectedInvoiceIds.forEach(id => {
                            cancelInvoice(id);
                          });
                          setSelectedInvoiceIds([]);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Stornieren
                    </button>
                    
                    <button
                      onClick={() => setSelectedInvoiceIds([])}
                      className="px-3 py-1.5 bg-transparent text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Aufheben
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invoice List Table */}
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-xs border-separate border-spacing-y-0">
              <thead>
                <tr className="text-zinc-400 text-[11px] font-semibold">
                  <th className="pb-3 pt-1 pl-5 pr-3 text-left border-b border-zinc-100 w-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAllSelected) {
                          setSelectedInvoiceIds([]);
                        } else {
                          setSelectedInvoiceIds(displayedInvoices.map(inv => inv.id));
                        }
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer outline-none bg-transparent ${
                        isAllSelected 
                          ? 'border-[#003527] bg-[#003527] text-white' 
                          : isSomeSelected
                          ? 'border-[#003527] bg-white text-[#003527]'
                          : 'border-[#bfc9c3]/60 hover:border-[#003527]'
                      }`}
                    >
                      {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      {isSomeSelected && <div className="w-2 h-0.5 bg-[#003527] rounded-sm" />}
                    </button>
                  </th>
                  <th className="pb-3 pt-1 px-3 text-left border-b border-zinc-100">Rechnungs-Nr.</th>
                  <th className="pb-3 pt-1 px-3 text-left border-b border-zinc-100">Datum</th>
                  <th className="pb-3 pt-1 px-3 text-left border-b border-zinc-100">Empfänger</th>
                  <th className="pb-3 pt-1 px-3 text-left border-b border-zinc-100">Betrag</th>
                  <th className="pb-3 pt-1 px-3 text-left border-b border-zinc-100">Status</th>
                  <th className="pb-3 pt-1 pl-3 pr-5 text-right border-b border-zinc-100">Aktionen</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                {displayedInvoices.map((inv) => {
                  const isSelected = selectedInvoiceIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      onContextMenu={(e) => handleInvoiceContextMenu(e, inv)}
                      onClick={() => {
                        setSelectedInvoiceIds(prev => 
                          prev.includes(inv.id) 
                            ? prev.filter(id => id !== inv.id) 
                            : [...prev, inv.id]
                        );
                      }}
                      className={`text-[#003527] group cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#003527]/5' : ''
                      }`}
                    >
                      <td className="py-3.5 pl-5 pr-3 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left w-10">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer outline-none bg-transparent ${
                            isSelected 
                              ? 'border-[#003527] bg-[#003527] text-white' 
                              : 'border-[#bfc9c3]/60 hover:border-[#003527]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-3 font-semibold text-zinc-400 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">{new Date(inv.date).toLocaleDateString('de-DE')}</td>
                      <td className="py-3.5 px-3 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">{inv.clientName}</td>
                      <td className="py-3.5 px-3 font-semibold text-xs border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">{inv.amount.toFixed(2)} €</td>
                      <td className="py-3.5 px-3 border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors text-left">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          {inv.status === 'paid' && 'Bezahlt'}
                          {inv.status === 'overdue' && 'Überfällig'}
                          {inv.status === 'open' && 'Offen'}
                        </span>
                      </td>
                      <td className="py-3.5 pl-3 pr-5 text-right relative border-b border-zinc-100 group-last:border-b-0 group-hover:bg-[#003527]/3 transition-colors">
                        <div className="flex items-center justify-end gap-1 relative">
                          {/* Direct Actions */}
                          {inv.status !== 'paid' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markInvoicePaid(inv.id);
                              }}
                              title="Als bezahlt markieren"
                              className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-[28px] h-[28px]" />
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sendInvoiceEmail(inv);
                            }}
                            title="Per E-Mail senden"
                            className="p-1.5 rounded-lg bg-white border border-[#bfc9c3]/50 text-[#003527]/70 hover:bg-zinc-50 hover:text-[#003527] transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadInvoicePdf(inv);
                            }}
                            title="PDF laden"
                            className="p-1.5 rounded-lg bg-white border border-[#bfc9c3]/50 text-[#003527]/70 hover:bg-zinc-50 hover:text-[#003527] transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Dropdown for other actions */}
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveInvoiceActionMenuId(
                                  activeInvoiceActionMenuId === inv.id ? null : inv.id
                                );
                              }}
                              title="Weitere Aktionen"
                              className="p-1.5 rounded-lg text-[#003527]/50 hover:bg-[#003527]/5 hover:text-[#003527] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            
                            <AnimatePresence>
                              {activeInvoiceActionMenuId === inv.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                  className="absolute right-0 mt-2 w-48 bg-white border border-[#bfc9c3]/50 rounded-2xl shadow-xl overflow-hidden py-1.5 flex flex-col z-50 text-left"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveInvoiceActionMenuId(null);
                                      printInvoice(inv);
                                    }}
                                    className="px-4 py-2 text-left text-xs font-bold text-[#003527] hover:bg-[#f3f4f3] transition-colors flex items-center gap-2 w-full cursor-pointer border-none bg-transparent"
                                  >
                                    <Printer className="w-3.5 h-3.5 text-[#003527]/60" /> Drucken
                                  </button>
            
                                  {(inv.status === 'open' || inv.status === 'overdue') && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveInvoiceActionMenuId(null);
                                        sendInvoiceReminder(inv);
                                      }}
                                      className="px-4 py-2 text-left text-xs font-bold text-amber-700 hover:bg-[#f3f4f3] transition-colors flex items-center gap-2 w-full cursor-pointer border-none bg-transparent"
                                    >
                                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Mahnung senden
                                    </button>
                                  )}
            
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveInvoiceActionMenuId(null);
                                      cancelInvoice(inv.id);
                                    }}
                                    className="px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-zinc-100 flex items-center gap-2 w-full cursor-pointer border-none bg-transparent"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Stornieren
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
          /* FINANCIAL ANALYTICS PANEL */
          <div className="space-y-8 text-left animate-fade-in">


            {/* Bento Grid: 3 KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bento Card 1: Gesamtumsatz */}
              <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">Gesamtumsatz</span>
                  <div className="p-2 bg-[#003527]/5 border border-[#003527]/10 rounded-lg">
                    <Activity className="w-4 h-4 text-[#003527]/70" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-[#003527] font-sans">{totalBilled.toFixed(2)} €</h2>
                  
                  {/* Custom Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#003527]">{collectionRate.toFixed(0)}% Bezahlt</span>
                      <span className="text-zinc-400">Offen</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200/50 rounded-full overflow-hidden flex border border-[#bfc9c3]/10">
                      <div className="h-full bg-[#003527] rounded-full" style={{ width: `${collectionRate}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-zinc-400 pt-0.5">
                      <span>Bezahlt: {paidTotal.toFixed(0)} €</span>
                      <span>Offen: {unpaidTotal.toFixed(0)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Ausstehend & Risiko */}
              <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">Ausstehend</span>
                  <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                    <Clock className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-amber-800 font-sans">{unpaidTotal.toFixed(2)} €</h2>
                  
                  <div className="mt-5 flex gap-2">
                    <div className="flex-1 bg-[#f9f9f8] p-3 rounded-xl border border-[#bfc9c3]/20 text-left">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">Offen (Im Ziel)</p>
                      <p className="text-xs font-bold text-[#003527]">{openTotal.toFixed(2)} €</p>
                    </div>
                    <div className="flex-1 bg-rose-50/50 p-3 rounded-xl border border-rose-200/50 text-left">
                      <p className="text-[9px] text-rose-800/60 uppercase font-bold mb-1">Mahnbar ({overdueCount})</p>
                      <p className="text-xs font-bold text-rose-600">{overdueTotal.toFixed(2)} €</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 3: Performance Metrics */}
              <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">Performance</span>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
                <div className="space-y-5 text-left">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Ø Rechnungswert</p>
                    <div className="flex items-baseline space-x-1">
                      <h3 className="text-xl font-extrabold text-[#003527] font-sans">{avgInvoiceAmount.toFixed(2)} €</h3>
                      <span className="text-[9px] text-zinc-400 font-bold">/ {filteredInvoicesByTime.length} Rechnungen</span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-[#bfc9c3]/20" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Zahlungsquote</p>
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-xl font-extrabold text-[#003527] font-sans">{collectionRate.toFixed(1)}%</h3>
                      <span className="text-[9px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded">
                        Ø 4.8 Tage
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: SVG Stacked Area Chart & Service Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Custom SVG Stacked Area Chart (Col-span 2) */}
              <div className="lg:col-span-2 bg-white border border-[#bfc9c3]/30 rounded-2xl p-6 relative flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#003527] uppercase tracking-widest mb-6">Umsatzentwicklung</h4>
                </div>
                <div className="relative h-56 w-full flex items-end">
                  {chartData.length > 0 ? (
                    <>
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1="40" y1="40" x2="480" y2="40" stroke="#bfc9c3" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                        <line x1="40" y1="110" x2="480" y2="110" stroke="#bfc9c3" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                        <line x1="40" y1="180" x2="480" y2="180" stroke="#bfc9c3" strokeWidth="0.5" opacity="0.5" />

                        {/* Area Gradients */}
                        <defs>
                          <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#003527" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#003527" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>

                        {/* Paths */}
                        <path d={totalAreaPath} fill="url(#colorTotal)" className="transition-all duration-300" />
                        <path d={paidAreaPath} fill="url(#colorPaid)" className="transition-all duration-300" />
                        <path d={totalLinePath} fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />
                        <path d={paidLinePath} fill="none" stroke="#003527" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300" />

                        {/* Hover Overlay Columns */}
                        {chartData.map((d, index) => {
                          const x = getX(index);
                          const colWidth = activeWidth / (chartData.length - 1 || 1);
                          return (
                            <rect
                              key={index}
                              x={x - colWidth / 2}
                              y="10"
                              width={colWidth}
                              height="180"
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredBarIndex(index)}
                              onMouseLeave={() => setHoveredBarIndex(null)}
                            />
                          );
                        })}

                        {/* Hover Vertical Line */}
                        {hoveredBarIndex !== null && chartData[hoveredBarIndex] && (
                          <line x1={getX(hoveredBarIndex)} y1="20" x2={getX(hoveredBarIndex)} y2="180" stroke="#bfc9c3" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                        )}
                      </svg>

                      {/* HTML Dynamic Circular Dots (Guaranteed perfectly circular since they are normal divs!) */}
                      {chartData.map((d, i) => {
                        const leftPct = (getX(i) / 500) * 100;
                        const totalBottomPct = ((200 - getY(d.total)) / 200) * 100;
                        const paidBottomPct = ((200 - getY(d.paid)) / 200) * 100;
                        
                        return (
                          <React.Fragment key={i}>
                            <div 
                              className="absolute w-2 h-2 rounded-full bg-white border border-[#d97706] -translate-x-1/2 translate-y-1/2 pointer-events-none transition-all duration-300 z-10"
                              style={{
                                left: `${leftPct}%`,
                                bottom: `${totalBottomPct}%`
                              }}
                            />
                            <div 
                              className="absolute w-2 h-2 rounded-full bg-white border border-[#003527] -translate-x-1/2 translate-y-1/2 pointer-events-none transition-all duration-300 z-10"
                              style={{
                                left: `${leftPct}%`,
                                bottom: `${paidBottomPct}%`
                              }}
                            />
                          </React.Fragment>
                        );
                      })}

                      {/* Hover active dot highlights */}
                      {hoveredBarIndex !== null && chartData[hoveredBarIndex] && (() => {
                        const leftPct = (getX(hoveredBarIndex) / 500) * 100;
                        const totalBottomPct = ((200 - getY(chartData[hoveredBarIndex].total)) / 200) * 100;
                        const paidBottomPct = ((200 - getY(chartData[hoveredBarIndex].paid)) / 200) * 100;
                        return (
                          <>
                            <div 
                              className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#d97706] -translate-x-1/2 translate-y-1/2 pointer-events-none z-20"
                              style={{
                                left: `${leftPct}%`,
                                bottom: `${totalBottomPct}%`
                              }}
                            />
                            <div 
                              className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#003527] -translate-x-1/2 translate-y-1/2 pointer-events-none z-20"
                              style={{
                                left: `${leftPct}%`,
                                bottom: `${paidBottomPct}%`
                              }}
                            />
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-zinc-400 text-xs italic text-center w-full py-12">Keine Umsatzdaten vorhanden</div>
                  )}

                  {/* Glassmorphism Tooltip */}
                  <AnimatePresence>
                    {hoveredBarIndex !== null && chartData[hoveredBarIndex] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bg-white/95 backdrop-blur-xl border border-[#bfc9c3]/50 rounded-2xl p-4 shadow-xl z-30 pointer-events-none text-xs font-bold text-[#003527] text-left"
                        style={{
                          left: `${(getX(hoveredBarIndex) / chartWidth) * 100}%`,
                          transform: 'translateX(-50%)',
                          bottom: '90px',
                          minWidth: '160px'
                        }}
                      >
                        <div className="text-[10px] text-zinc-400 font-bold mb-1.5 border-b border-[#bfc9c3]/20 pb-1.5 uppercase tracking-widest">
                          {chartData[hoveredBarIndex].label}
                        </div>
                        <div className="flex justify-between items-center gap-4 text-zinc-600">
                          <span>Gesamt:</span>
                          <span>{chartData[hoveredBarIndex].total.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-[#003527] mt-1.5">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#003527] rounded-full" /> Bezahlt:</span>
                          <span>{chartData[hoveredBarIndex].paid.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-amber-800 mt-1.5">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500" /> Offen:</span>
                          <span>{chartData[hoveredBarIndex].unpaid.toFixed(2)} €</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Chart Axis Labels */}
                <div className="flex justify-between items-center px-8 text-[9px] font-bold text-zinc-400 mt-3">
                  {chartData.map((d, idx) => (
                    <span key={idx} style={{ width: `${100 / chartData.length}%` }} className="text-center truncate">
                      {d.label}
                    </span>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 justify-center text-[10px] font-bold">
                  <span className="flex items-center gap-1.5 text-[#003527]"><span className="w-2.5 h-2.5 bg-[#003527] rounded-sm" /> Bezahlt</span>
                  <span className="flex items-center gap-1.5 text-amber-800"><span className="w-2.5 h-2.5 bg-[#d97706]/20 rounded-sm border border-[#d97706]/40" /> Ausstehend</span>
                </div>
              </div>

              {/* Card 2: Umsatz nach Leistung */}
              <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 flex flex-col justify-start">
                <div className="mb-4 text-left">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#003527]/70 uppercase">Umsatz nach Leistung</span>
                </div>

                <div className="flex-grow space-y-4 overflow-y-auto max-h-[220px] pr-1">
                  {serviceData.map((service, idx) => {
                    const share = totalBilled > 0 ? (service.amount / totalBilled) * 100 : 0;
                    return (
                      <div key={idx} className="relative text-left">
                        <div className="flex justify-between items-end mb-1.5">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-xs font-bold text-[#003527] truncate" title={service.name}>{service.name}</p>
                            <p className="text-[9px] text-zinc-400 font-bold">{service.count} Rechnungen</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-[#003527]">
                              {service.amount.toFixed(2)} €
                            </p>
                            <p className="text-[9px] text-zinc-400 font-bold">{share.toFixed(0)}% Anteil</p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-zinc-200/50 rounded-full overflow-hidden border border-[#bfc9c3]/10">
                          <div className="h-full bg-[#003527] rounded-full" style={{ width: `${share}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {serviceData.length === 0 && (
                    <div className="text-zinc-400 text-xs italic text-center py-12">Keine Umsätze verbucht.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Action Required & Top Patients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Zahlungserinnerungen (Aktion Nötig) */}
              <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl overflow-hidden text-left flex flex-col justify-between">
                <div>
                  <div className="px-6 pt-6 pb-4 border-b border-[#bfc9c3]/20 flex justify-between items-center bg-[#f9f9f8]">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-extrabold tracking-widest text-[#003527]/70 uppercase">Aktion Nötig</span>
                    </div>
                    <span className="text-[8px] font-bold text-zinc-400 bg-white px-2 py-1 rounded border border-[#bfc9c3]/30">
                      {outstandingInvoices.length} Einträge
                    </span>
                  </div>

                  <div className="divide-y divide-[#bfc9c3]/20 overflow-y-auto max-h-[260px]">
                    {outstandingInvoices.map((item) => {
                      const dueDate = new Date(item.date);
                      const refDate = new Date('2026-06-01');
                      const diffTime = Math.abs(refDate.getTime() - dueDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={item.id} className="p-4 hover:bg-[#003527]/3 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className={`p-2.5 rounded-xl shrink-0 border ${
                              item.status === 'overdue' 
                                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                : 'bg-amber-50 border-amber-200 text-amber-500'
                            }`}>
                              {item.status === 'overdue' ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <Bell className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-xs font-bold text-[#003527]">{item.clientName}</p>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase border ${
                                  item.status === 'overdue' 
                                    ? 'bg-rose-100/50 border-rose-200 text-rose-800' 
                                    : 'bg-amber-100/50 border-amber-200 text-amber-800'
                                }`}>
                                  {item.status === 'overdue' ? 'Überfällig' : 'Offen'}
                                </span>
                              </div>
                              <p className="text-[9px] text-zinc-400 font-bold">
                                {item.invoiceNumber} • Erstellt vor {diffDays} Tag(en)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-14 sm:pl-0">
                            <span className="text-xs font-extrabold text-[#003527]">{item.amount.toFixed(2)} €</span>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100">
                              <button
                                onClick={() => markInvoicePaid(item.id)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer flex items-center justify-center w-7 h-7"
                                title="Zahlung erhalten"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenMahnung(item)}
                                className="p-1.5 bg-[#003527] hover:bg-[#0b513d] text-white rounded-lg cursor-pointer flex items-center justify-center w-7 h-7 shadow-none"
                                title="Erinnerung schreiben"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {outstandingInvoices.length === 0 && (
                      <div className="p-8 text-center text-xs text-zinc-400 font-bold italic">Alle Rechnungen bezahlt! 🎉</div>
                    )}
                  </div>
                </div>


              </div>

              {/* Card 2: Top-Patienten */}
              <div className="bg-white border border-[#bfc9c3]/30 rounded-2xl overflow-hidden flex flex-col justify-between text-left">
                <div>
                  <div className="px-6 pt-6 pb-4 border-b border-[#bfc9c3]/20 flex justify-between items-center bg-[#f9f9f8]">
                    <span className="text-[10px] font-extrabold tracking-widest text-[#003527]/70 uppercase">Top-Patienten</span>
                    {topClients.length > 0 && (
                      <span className="text-[8px] font-bold text-zinc-400 bg-white px-2 py-1 rounded border border-[#bfc9c3]/30">
                        Umsatzanteil: {((topClients.reduce((sum, c) => sum + c.amount, 0) / (totalBilled || 1)) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-[#bfc9c3]/20 overflow-y-auto max-h-[260px]">
                    {topClients.map((client, idx) => {
                      const initials = client.name.split(' ').map(n => n[0]).join('');
                      const colors = [
                        'bg-blue-50 border-blue-200 text-blue-800',
                        'bg-emerald-50 border-emerald-200 text-emerald-800',
                        'bg-purple-50 border-purple-200 text-purple-800'
                      ];
                      const colorClass = colors[idx % colors.length];

                      return (
                        <div key={idx} className="p-4 hover:bg-[#003527]/3 transition-colors cursor-pointer group flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${colorClass}`}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#003527]">{client.name}</p>
                              <div className="flex items-center text-[9px] text-zinc-400 font-bold mt-0.5 space-x-1">
                                <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                                <span>{client.count} Rechnungen</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs font-extrabold text-[#003527]">{client.amount.toFixed(2)} €</span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-[#003527] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                    {topClients.length === 0 && (
                      <div className="p-8 text-center text-xs text-zinc-400 font-bold italic">Keine Patientendaten vorhanden.</div>
                    )}
                  </div>
                </div>




              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
