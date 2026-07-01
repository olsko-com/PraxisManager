'use client';

import React from 'react';
import { X, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';
import { formatGermanDate } from '@/lib/dateUtils';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
};

export default function MailModal() {
  const {
    isMailModalOpen,
    setIsMailModalOpen,
    clients,
    selectedClientId,
    invoices,
    appointments,
    mailTopic,
    mailSubject,
    setMailSubject,
    mailBody,
    setMailBody,
    selectedMailInvoiceId,
    setSelectedMailInvoiceId,
    selectedMailAppointmentId,
    setSelectedMailAppointmentId,
    applyMailTemplate,
    handleSendMail,
    showToast
  } = useDashboard();

  const [isMailCenterActive, setIsMailCenterActive] = React.useState(false);
  const [alsoSendSms, setAlsoSendSms] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sentMethods = ['E-Mail'];
    if (alsoSendSms && currentClient?.phone) {
      sentMethods.push('SMS');
    }
    showToast(`Nachricht an ${currentClient?.name} per ${sentMethods.join(' & ')} wurde erfolgreich gesendet!`, 'success');
    setIsMailModalOpen(false);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMailCenterActive(localStorage.getItem('addon_mail-center') === 'true');
    }
  }, [isMailModalOpen]);

  const currentClient = clients.find(c => c.id === selectedClientId);

  if (!isMailModalOpen || !currentClient) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsMailModalOpen(false)}
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[120]"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-white border-l border-[#bfc9c3]/30 shadow-none z-[130] p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div>
          <div className="flex justify-between items-center border-b border-[#bfc9c3]/30 pb-4 mb-6">
            <h3 className="text-lg font-bold text-[#043F2D]">E-Mail an {currentClient.name}</h3>
            <button 
              onClick={() => setIsMailModalOpen(false)}
              className="p-1 rounded-full hover:bg-zinc-100 text-[#003527] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 mb-5">
            <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Vorlage</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyMailTemplate('custom', undefined, undefined, currentClient)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mailTopic === 'custom'
                    ? 'bg-[#003527] text-white'
                    : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                }`}
              >
                Ohne
              </button>
              <button
                type="button"
                onClick={() => {
                  const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                  const invId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                  applyMailTemplate('rechnung', invId, undefined, currentClient);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mailTopic === 'rechnung'
                    ? 'bg-[#003527] text-white'
                    : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                }`}
              >
                Rechnung
              </button>
              <button
                type="button"
                onClick={() => {
                  const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                  const appId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                  applyMailTemplate('bestaetigung', undefined, appId, currentClient);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mailTopic === 'bestaetigung'
                    ? 'bg-[#003527] text-white'
                    : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                }`}
              >
                Terminbestätigung
              </button>
              <button
                type="button"
                onClick={() => {
                  const clientAppointments = appointments.filter(a => a.clientId === currentClient.id);
                  const appId = clientAppointments.length > 0 ? clientAppointments[0].id : '';
                  applyMailTemplate('stornierung', undefined, appId, currentClient);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mailTopic === 'stornierung'
                    ? 'bg-[#003527] text-white'
                    : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                }`}
              >
                Terminabsage
              </button>
              <button
                type="button"
                onClick={() => {
                  const clientInvoices = invoices.filter(i => i.clientId === currentClient.id);
                  const invId = clientInvoices.length > 0 ? clientInvoices[0].id : '';
                  applyMailTemplate('mahnung', invId, undefined, currentClient);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  mailTopic === 'mahnung'
                    ? 'bg-[#003527] text-white'
                    : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                }`}
              >
                Zahlungserinnerung
              </button>

              {isMailCenterActive && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      applyMailTemplate('erinnerung', undefined, undefined, currentClient);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mailTopic === 'erinnerung'
                        ? 'bg-[#003527] text-white'
                        : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                    }`}
                  >
                    Terminerinnerung
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyMailTemplate('fragebogen', undefined, undefined, currentClient);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mailTopic === 'fragebogen'
                        ? 'bg-[#003527] text-white'
                        : 'bg-[#f3f4f3] text-[#404944] hover:bg-[#003527]/5 hover:text-[#003527]'
                    }`}
                  >
                    Anamnesebogen
                  </button>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(mailTopic === 'rechnung' || mailTopic === 'mahnung') && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zugehörige Rechnung auswählen</label>
                <select
                  value={selectedMailInvoiceId}
                  onChange={(e) => {
                    setSelectedMailInvoiceId(e.target.value);
                    applyMailTemplate(mailTopic, e.target.value, undefined, currentClient);
                  }}
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                >
                  {invoices.filter(i => i.clientId === currentClient.id).map(i => (
                    <option key={i.id} value={i.id}>
                      Rechnung {i.invoiceNumber} vom {formatGermanDate(i.date)} ({i.amount.toFixed(2)} €)
                    </option>
                  ))}
                  {invoices.filter(i => i.clientId === currentClient.id).length === 0 && (
                    <option value="">Keine Rechnungen vorhanden</option>
                  )}
                </select>
              </div>
            )}

            {(mailTopic === 'stornierung' || mailTopic === 'bestaetigung') && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Zugehörigen Termin auswählen</label>
                <select
                  value={selectedMailAppointmentId}
                  onChange={(e) => {
                    setSelectedMailAppointmentId(e.target.value);
                    applyMailTemplate(mailTopic, undefined, e.target.value, currentClient);
                  }}
                  className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all cursor-pointer"
                >
                  {appointments.filter(a => a.clientId === currentClient.id).map(a => {
                    const dateStr = formatGermanDate(a.startTime);
                    const timeStr = new Date(a.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <option key={a.id} value={a.id}>
                        {a.serviceName} - {dateStr} um {timeStr} Uhr
                      </option>
                    );
                  })}
                  {appointments.filter(a => a.clientId === currentClient.id).length === 0 && (
                    <option value="">Keine Termine vorhanden</option>
                  )}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Empfänger</label>
              <div className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-left select-none">
                <div className="w-6 h-6 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                  {getInitials(currentClient.name)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#003527] truncate">{currentClient.name}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold truncate">{currentClient.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">Betreff</label>
              <input
                type="text"
                required
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
                placeholder="z.B. Ihre Rechnung zur Behandlung"
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-[#003527]/70 uppercase tracking-widest text-left">E-Mail Text</label>
              <textarea
                rows={8}
                required
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                placeholder="Sehr geehrte Damen und Herren..."
                className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 font-bold text-xs text-[#003527] outline-none resize-none h-64 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all text-left"
              />
            </div>

            {currentClient.phone && (
              <div className="flex items-center gap-2 mt-4 select-none">
                <input
                  type="checkbox"
                  id="alsoSendSms"
                  checked={alsoSendSms}
                  onChange={(e) => setAlsoSendSms(e.target.checked)}
                  className="rounded border-zinc-300 text-[#003527] focus:ring-[#003527]/30 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="alsoSendSms" className="text-[11px] font-bold text-zinc-600 cursor-pointer">
                  Auch als SMS senden an {currentClient.phone}
                </label>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsMailModalOpen(false)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-[#003527] py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
              >
                E-Mail senden
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
