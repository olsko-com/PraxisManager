'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Printer, Download, Plus, Settings, Sparkles, Mail, Trash2, Calendar as CalendarIcon,
  Check, Clock
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
    markInvoicePaid,
    sendInvoiceReminder,
    cancelInvoice,
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
    deleteAppointment,
    openNewInvoiceSheetWithPrefill,
    showToast,
    setNewAppDate,
    setNewAppHour,
    setNewAppClientId,
    setNewAppServiceId,
    services,
    sendInvoiceEmail
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
        {contextMenu.type === 'client' 
          ? (contextMenu.client?.name || 'Klient') 
          : contextMenu.type === 'invoice'
          ? (`Rechnung ${contextMenu.invoice?.invoiceNumber || ''}`)
          : (contextMenu.appointment?.clientName || contextMenu.appointment?.serviceName || 'Termin')}
      </div>

      {contextMenu.type === 'client' && (
        <div className="py-1 flex flex-col">
          <button
            onClick={() => {
              setContextMenu(null);
              const client = contextMenu.client;
              if (client) {
                setSelectedClientId(client.id);
                router.push('/dashboard/clients');
              }
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
          >
            <FileText className="w-3.5 h-3.5" />
            Akte öffnen
          </button>
          
          <button
            onClick={() => {
              setContextMenu(null);
              const client = contextMenu.client;
              if (client) {
                setSheetMode('new');
                setNewAppDate(new Date().toISOString().slice(0, 10));
                setNewAppHour(9);
                setNewAppClientId(client.id);
                if (services.length > 0) setNewAppServiceId(services[0].id);
                setIsSheetOpen(true);
              }
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Termin vereinbaren
          </button>

          <button
            onClick={() => {
              setContextMenu(null);
              const client = contextMenu.client;
              if (client) {
                setSelectedClientId(client.id);
                const clientInvoices = invoices.filter(i => i.clientId === client.id);
                const clientAppointments = appointments.filter(a => a.clientId === client.id);
                const firstInvId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                const firstAppId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                setSelectedMailInvoiceId(firstInvId);
                setSelectedMailAppointmentId(firstAppId);
                applyMailTemplate('custom', firstInvId, firstAppId, client);
                setIsMailModalOpen(true);
              }
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
          >
            <Mail className="w-3.5 h-3.5" />
            E-Mail schreiben
          </button>
        </div>
      )}

      {contextMenu.type === 'appointment' && (
        <>
          <div className="py-1 flex flex-col">
            {(() => {
              const app = contextMenu.appointment;
              if (!app) return null;
              const invoice = invoices.find(inv => inv.appointmentId === app.id);
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
              } else if (app.clientId) {
                return (
                  <button
                    onClick={() => {
                      setContextMenu(null);
                      openNewInvoiceSheetWithPrefill({
                        clientId: app.clientId || '',
                        amount: app.price,
                        appointmentId: app.id,
                        clientName: app.clientName,
                        date: app.startTime.slice(0, 10)
                      });
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold text-emerald-700 transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Rechnung erstellen
                  </button>
                );
              }
              return null;
            })()}
          </div>

          <div className="py-1 flex flex-col">
            <button
              onClick={() => {
                if (contextMenu.appointment) {
                  setContextMenu(null);
                  setSelectedAppointment(contextMenu.appointment);
                  setSheetMode('edit');
                  setIsSheetOpen(true);
                }
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
            >
              <Settings className="w-3.5 h-3.5" />
              Termin bearbeiten
            </button>
            
            {contextMenu.appointment?.clientId && (
              <>
                <button
                  onClick={() => {
                    setContextMenu(null);
                    const client = clients.find(c => c.id === contextMenu.appointment?.clientId);
                    if (client && contextMenu.appointment) {
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
                    const client = clients.find(c => c.id === contextMenu.appointment?.clientId);
                    if (client && contextMenu.appointment) {
                      setSelectedClientId(client.id);
                      setSelectedMailAppointmentId(contextMenu.appointment.id);
                      const invoice = invoices.find(inv => inv.appointmentId === contextMenu.appointment?.id);
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
              </>
            )}
          </div>

          <div className="py-1 flex flex-col">
            <button
              onClick={async () => {
                if (contextMenu.appointment) {
                  setContextMenu(null);
                  const displayName = contextMenu.appointment.clientName || contextMenu.appointment.serviceName || 'diesen Termin';
                  if (confirm(`Möchtest du den Termin für "${displayName}" wirklich löschen?`)) {
                    await deleteAppointment(contextMenu.appointment.id);
                  }
                }
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Termin löschen
            </button>
          </div>
        </>
      )}

      {contextMenu.type === 'invoice' && (
        <div className="py-1 flex flex-col">
          <button
            onClick={() => {
              setContextMenu(null);
              const invoice = contextMenu.invoice;
              if (invoice) sendInvoiceEmail(invoice);
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
          >
            <Mail className="w-3.5 h-3.5" />
            Per E-Mail senden
          </button>

          <button
            onClick={() => {
              setContextMenu(null);
              const invoice = contextMenu.invoice;
              if (invoice) downloadInvoicePdf(invoice);
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
          >
            <Download className="w-3.5 h-3.5" />
            PDF herunterladen
          </button>

          <button
            onClick={() => {
              setContextMenu(null);
              const invoice = contextMenu.invoice;
              if (invoice) printInvoice(invoice);
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
          >
            <Printer className="w-3.5 h-3.5" />
            Drucken
          </button>

          {contextMenu.invoice?.status !== 'paid' && (
            <button
              onClick={() => {
                setContextMenu(null);
                const invoice = contextMenu.invoice;
                if (invoice) markInvoicePaid(invoice.id);
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold text-emerald-700 transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent border-t border-zinc-100"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Als bezahlt markieren
            </button>
          )}

          {(contextMenu.invoice?.status === 'open' || contextMenu.invoice?.status === 'overdue') && (
            <button
              onClick={() => {
                setContextMenu(null);
                const invoice = contextMenu.invoice;
                if (invoice) {
                  // Direct to warning or send email reminder
                  sendInvoiceReminder(invoice);
                }
              }}
              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#003527]/5 font-bold text-amber-700 transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Mahnung senden
            </button>
          )}

          <button
            onClick={() => {
              setContextMenu(null);
              const invoice = contextMenu.invoice;
              if (invoice) cancelInvoice(invoice.id);
            }}
            className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition-all flex items-center gap-2 cursor-pointer border-none bg-transparent border-t border-zinc-100"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Stornieren
          </button>
        </div>
      )}
    </motion.div>
  );
}
