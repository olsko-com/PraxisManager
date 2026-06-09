'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Printer, Download, Plus, Settings, Sparkles, Mail, Trash2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

export default function ContextMenu() {
  const router = useRouter();
  const {
    contextMenu,
    setContextMenu,
    invoices,
    appointments,
    printInvoice,
    downloadInvoicePdf,
    setSelectedAppointment,
    setSheetMode,
    setIsSheetOpen,
    clients,
    setSelectedClientId,
    createSoapNote,
    setSelectedMailAppointmentId,
    setSelectedMailInvoiceId,
    applyMailTemplate,
    setIsMailModalOpen,
    setAppointments,
    openNewInvoiceSheetWithPrefill,
    showToast
  } = useDashboard();

  if (!contextMenu) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: `${contextMenu.y + 250 > window.innerHeight ? Math.max(10, contextMenu.y - 250) : contextMenu.y}px`,
        left: `${contextMenu.x + 224 > window.innerWidth ? Math.max(10, contextMenu.x - 224) : contextMenu.x}px`,
        zIndex: 9999,
      }}
      className="w-56 bg-white/80 backdrop-blur-xl border border-[#bfc9c3]/30 rounded-2xl shadow-xl p-1.5 flex flex-col font-sans text-xs text-[#003527] divide-y divide-[#bfc9c3]/15 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider select-none text-left">
        {contextMenu.appointment.clientName}
      </div>

      <div className="py-1 flex flex-col">
        {(() => {
          const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment.id);
          if (invoice) {
            return (
              <>
                <button
                  onClick={() => {
                    setContextMenu(null);
                    router.push('/dashboard/invoices');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Rechnung anzeigen
                </button>
                <button
                  onClick={() => {
                    setContextMenu(null);
                    printInvoice(invoice);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Rechnung drucken
                </button>
                <button
                  onClick={() => {
                    setContextMenu(null);
                    downloadInvoicePdf(invoice);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <Download className="w-3.5 h-3.5" />
                  Als PDF laden
                </button>
              </>
            );
          } else {
            return (
              <button
                onClick={() => {
                  setContextMenu(null);
                  openNewInvoiceSheetWithPrefill({
                    clientId: contextMenu.appointment.clientId,
                    amount: contextMenu.appointment.price,
                    appointmentId: contextMenu.appointment.id,
                    clientName: contextMenu.appointment.clientName,
                    date: contextMenu.appointment.startTime.slice(0, 10)
                  });
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold text-emerald-700 transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                Rechnung erstellen
              </button>
            );
          }
        })()}
      </div>

      <div className="py-1 flex flex-col">
        <button
          onClick={() => {
            setContextMenu(null);
            setSelectedAppointment(contextMenu.appointment);
            setSheetMode('edit');
            setIsSheetOpen(true);
          }}
          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
        >
          <Settings className="w-3.5 h-3.5" />
          Termin bearbeiten
        </button>
        
        <button
          onClick={() => {
            setContextMenu(null);
            const client = clients.find(c => c.id === contextMenu.appointment.clientId);
            if (client) {
              setSelectedClientId(client.id);
              createSoapNote(contextMenu.appointment.id, client.id);
              router.push('/dashboard/clients');
            }
          }}
          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
        >
          <Sparkles className="w-3.5 h-3.5" />
          SOAP-Bericht erstellen
        </button>

        <button
          onClick={() => {
            setContextMenu(null);
            const client = clients.find(c => c.id === contextMenu.appointment.clientId);
            if (client) {
              setSelectedClientId(client.id);
              setSelectedMailAppointmentId(contextMenu.appointment.id);
              const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment.id);
              if (invoice) {
                setSelectedMailInvoiceId(invoice.id);
                applyMailTemplate('rechnung', invoice.id, contextMenu.appointment.id, client);
              } else {
                applyMailTemplate('bestaetigung', undefined, contextMenu.appointment.id, client);
              }
              setIsMailModalOpen(true);
            }
          }}
          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
        >
          <Mail className="w-3.5 h-3.5" />
          E-Mail schreiben
        </button>
      </div>

      <div className="py-1 flex flex-col">
        <button
          onClick={() => {
            setContextMenu(null);
            if (confirm(`Möchtest du den Termin für ${contextMenu.appointment.clientName} wirklich löschen?`)) {
              setAppointments(prev => prev.filter(a => a.id !== contextMenu.appointment.id));
              showToast('Termin gelöscht.', 'info');
            }
          }}
          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          Termin löschen
        </button>
      </div>
    </motion.div>
  );
}
