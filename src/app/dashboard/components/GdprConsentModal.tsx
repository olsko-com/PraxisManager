'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Tablet, Upload, Printer, QrCode, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../context';
import { QRCodeSVG } from 'qrcode.react';

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

  const [activeTab, setActiveTab] = useState<'device' | 'qrcode' | 'email'>('device');

  const client = clients.find(c => c.id === gdprClientId);
  const clientEmail = client?.email || 'klient@email.de';

  // Automatically pre-generate the GDPR token if missing or expired when the modal opens
  useEffect(() => {
    if (isGdprModalOpen && gdprClientId) {
      const activeClient = clients.find(c => c.id === gdprClientId);
      if (activeClient && (!activeClient.gdprToken || new Date(activeClient.gdprTokenExpiresAt || '') < new Date())) {
        generateGdprLink(activeClient.id);
      }
    }
  }, [isGdprModalOpen, gdprClientId, clients, generateGdprLink]);

  if (!isGdprModalOpen || !gdprClientId || !client) return null;

  const closeGdprModal = () => {
    setIsGdprModalOpen(false);
    setGdprClientId(null);
  };

  const handleSendLink = async () => {
    const token = client.gdprToken || await generateGdprLink(client.id);
    if (token) {
      applyMailTemplate('dsgvo', undefined, undefined, client);
      setIsMailModalOpen(true);
      closeGdprModal();
    }
  };

  const handleSignOnDevice = async () => {
    const token = client.gdprToken || await generateGdprLink(client.id);
    if (token) {
      window.open(`/verify/${token}?kiosk=true`, '_blank');
      closeGdprModal();
    } else {
      showToast('Fehler beim Generieren des Signatur-Links.', 'error');
    }
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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const verifyLink = `${origin}/verify/${client.gdprToken || 'loading_token'}`;

  const tabs = [
    { id: 'device', label: 'Dieses Gerät', icon: Tablet },
    { id: 'qrcode', label: 'QR-Code', icon: QrCode },
    { id: 'email', label: 'E-Mail', icon: Mail },
  ] as const;

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

          {/* Segmented Control Tabs */}
          <div className="flex bg-zinc-100 p-1 rounded-xl relative border border-zinc-200/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all relative z-10 cursor-pointer border-none bg-transparent outline-none ${
                    isActive ? 'text-[#003527]' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-gdpr-tab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 border border-zinc-200/20"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content area based on selected tab */}
          <div className="min-h-[160px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeTab === 'device' && (
                <motion.div
                  key="device"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 text-center py-2"
                >
                  <div className="text-left space-y-1.5">
                    <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                      Lasse den Klienten die Erklärung direkt auf diesem Gerät (z.B. iPad oder Touchscreen) lesen und digital unterschreiben.
                    </p>
                    <div className="text-[9px] text-[#003527]/70 font-semibold bg-emerald-50 border border-emerald-100/50 p-2 rounded-lg flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>
                        <strong>Sicherer Kiosk-Modus:</strong> Öffnet ein separates Fenster ohne Navigation oder Zugriff auf deine restlichen Praxisdaten.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOnDevice}
                    className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 border-none shadow-none"
                  >
                    <Tablet className="w-4 h-4" />
                    <span>Jetzt auf diesem Gerät unterschreiben</span>
                  </button>
                </motion.div>
              )}

              {activeTab === 'qrcode' && (
                <motion.div
                  key="qrcode"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center text-center space-y-3 py-1"
                >
                  <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                    Scanne den QR-Code mit dem Smartphone des Klienten oder einem separaten Tablet, um dort direkt zu unterschreiben.
                  </p>
                  
                  <div className="bg-white border border-zinc-200 p-3 rounded-xl shadow-sm inline-block">
                    {client.gdprToken ? (
                      <QRCodeSVG
                        value={verifyLink}
                        size={120}
                        level="M"
                        includeMargin={false}
                      />
                    ) : (
                      <div className="w-[120px] h-[120px] flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                        Erzeuge Token...
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-zinc-50 border border-zinc-200/60 rounded-lg p-2 text-center overflow-x-auto whitespace-nowrap scrollbar-none max-w-sm">
                    <span className="text-[9px] font-mono text-zinc-400 font-semibold select-all">{verifyLink}</span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 text-center py-2"
                >
                  <div className="text-left space-y-1.5">
                    <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                      Sende dem Klienten den Link per E-Mail zu, damit er das Formular in Ruhe zu Hause ausfüllen kann.
                    </p>
                    <p className="text-[9px] text-zinc-400 font-medium truncate">
                      Empfänger: <strong className="text-[#003527]">{clientEmail}</strong>
                    </p>
                  </div>

                  <button
                    onClick={handleSendLink}
                    className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 border-none shadow-none"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Link per E-Mail senden</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
