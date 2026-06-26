'use client';

import React from 'react';
import { X, Mail, Tablet, Upload, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboard } from '../context';

export default function GdprConsentModal() {
  const {
    isGdprModalOpen,
    setIsGdprModalOpen,
    gdprClientId,
    setGdprClientId,
    clients,
    toggleClientGdpr,
    generateGdprLink,
    applyMailTemplate,
    setIsMailModalOpen,
    showToast
  } = useDashboard();

  if (!isGdprModalOpen || !gdprClientId) return null;

  const client = clients.find(c => c.id === gdprClientId);
  if (!client) return null;

  const clientEmail = client.email || 'patient@email.de';

  const closeGdprModal = () => {
    setIsGdprModalOpen(false);
    setGdprClientId(null);
  };

  const handleSendLink = async () => {
    // Generate token and save it to the DB
    const token = await generateGdprLink(client.id);
    if (token) {
      // Apply the 'dsgvo' mail template
      applyMailTemplate('dsgvo', undefined, undefined, client);
      // Open the email modal
      setIsMailModalOpen(true);
      closeGdprModal();
    }
  };

  const handleSignOnDevice = () => {
    showToast(`Kiosk-Modus für ${client.name} gestartet... (Patienten-Tablet freigeschaltet)`, 'info');
    toggleClientGdpr(client.id);
    closeGdprModal();
  };

  const handleManualUpload = () => {
    showToast(`Dokumenten-Upload für ${client.name} geöffnet.`, 'success');
    toggleClientGdpr(client.id);
    closeGdprModal();
  };

  const handlePrintForm = () => {
    showToast(`Druckansicht für leeres DSGVO-Formular wird geladen...`, 'info');
    closeGdprModal();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeGdprModal}
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200]"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white border border-[#bfc9c3]/30 w-full max-w-md rounded-2xl shadow-xl p-6 pointer-events-auto flex flex-col text-left space-y-5"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-bold text-[#003527]">Datenschutz-Einwilligung einholen</h3>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                Wähle die Methode, um die Einwilligung für <span className="text-[#003527] font-bold">{client.name}</span> zu erfassen.
              </p>
            </div>
            <button 
              onClick={closeGdprModal}
              className="p-1.5 rounded-xl hover:bg-zinc-50 text-[#003527] transition-all cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options Body */}
          <div className="space-y-3">
            {/* Primary Action: Send Link */}
            <button
              onClick={handleSendLink}
              className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between border-none shadow-none text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-extrabold">Link an Patient senden</span>
                  <span className="block text-[9px] text-[#bfc9c3] font-semibold truncate max-w-[200px] sm:max-w-[240px]">
                    E-Mail an {clientEmail}
                  </span>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-extrabold shrink-0 uppercase tracking-wide">
                Empfohlen
              </span>
            </button>

            {/* Secondary Action: Sign on tablet */}
            <button
              onClick={handleSignOnDevice}
              className="w-full bg-zinc-100/60 hover:bg-zinc-100 text-[#003527] py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.99] flex items-center gap-3 border border-[#bfc9c3]/20 shadow-none text-left"
            >
              <div className="p-1.5 bg-[#003527]/5 rounded-lg text-[#003527]">
                <Tablet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[11px] font-extrabold">Jetzt auf diesem Gerät unterschreiben</span>
                <span className="block text-[9px] text-zinc-400 font-semibold">
                  Öffnet Kiosk-Modus für Tablet/iPad
                </span>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#bfc9c3]/20"></div>
            <span className="flex-shrink mx-3 text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Fallback</span>
            <div className="flex-grow border-t border-[#bfc9c3]/20"></div>
          </div>

          {/* Fallback Text-Links */}
          <div className="flex justify-around items-center pt-1 text-[10px]">
            <button
              onClick={handleManualUpload}
              className="flex items-center gap-1.5 font-bold text-zinc-400 hover:text-[#003527] transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>Manuell hochladen</span>
            </button>
            
            <div className="w-px h-3 bg-zinc-200" />

            <button
              onClick={handlePrintForm}
              className="flex items-center gap-1.5 font-bold text-zinc-400 hover:text-[#003527] transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Formular drucken</span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
