'use client';

import React, { useState, useRef, use, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, ShieldAlert, Sparkles, FileText, ChevronRight, RotateCcw, PenTool } from 'lucide-react';
import Image from 'next/image';

interface VerifyParams {
  token: string;
}

export default function GdprVerifyPage({ params }: { params: Promise<VerifyParams> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  // States
  const [step, setStep] = useState<'gate' | 'document' | 'success' | 'error'>('gate');
  const [birthday, setBirthday] = useState('');
  const [clientName, setClientName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Rate limiting (attempts count)
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiosk-specific states
  const [isKioskMode, setIsKioskMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;

    const searchParams = new URLSearchParams(window.location.search);
    const hasKioskParam = searchParams.get('kiosk') === 'true';

    if (hasKioskParam) {
      setIsVerifying(true);
      // Verify if therapist is actually logged in on this browser (security check)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          setIsKioskMode(true);
          try {
            // Fetch client name & birthday using token
            const { data, error } = await supabase
              .from('clients')
              .select('name, birthday')
              .eq('gdpr_token', token)
              .single();

            if (error) throw error;
            if (data) {
              setClientName(data.name);
              setBirthday(data.birthday); // Save the birthday so it can be passed to submit_gdpr_signature
              setStep('document');
            } else {
              setErrorMessage('Klient konnte nicht gefunden werden.');
            }
          } catch (err: any) {
            console.error('Kiosk auto-verification failed:', err);
            setErrorMessage('Automatische Verifizierung fehlgeschlagen. Bitte manuell verifizieren.');
          } finally {
            setIsVerifying(false);
          }
        } else {
          // No session - fall back to normal verification gate
          setIsVerifying(false);
        }
      });
    }
  }, [token]);

  // Lockout Timer
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimeRemaining]);

  // Handle Birthdate Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthday || isLocked) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      // Call Supabase RPC
      const { data, error } = await supabase.rpc('verify_gdpr_birthday', {
        token_val: token,
        birthday_val: birthday
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check if we got a valid response (array or single object)
      const result = Array.isArray(data) ? data[0] : data;

      if (result && result.is_valid) {
        setClientName(result.client_name);
        setStep('document');
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setIsLocked(true);
          setLockTimeRemaining(900); // 15 minutes lockout
          setErrorMessage('Zu viele Fehlversuche. Der Link wurde aus Sicherheitsgründen für 15 Minuten gesperrt.');
        } else {
          setErrorMessage(`Verifizierung fehlgeschlagen. Bitte überprüfen Sie Ihr Geburtsdatum (Versuch ${nextAttempts} von 5).`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Verbindung zum Server fehlgeschlagen. Der Link ist möglicherweise abgelaufen oder ungültig.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Canvas Drawing Methods
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Scale coordinates accurately to match display size vs internal canvas drawing resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#003527'; // Primary forest green color
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Handle GDPR Submission
  const handleSubmitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const signatureDataUrl = canvas.toDataURL('image/png');

      const { data: success, error } = await supabase.rpc('submit_gdpr_signature', {
        token_val: token,
        birthday_val: birthday,
        signature_val: signatureDataUrl
      });

      if (error) {
        throw new Error(error.message);
      }

      if (success) {
        setStep('success');
      } else {
        setStep('error');
        setErrorMessage('Ihre Anfrage konnte nicht verarbeitet werden. Möglicherweise ist dieser Link bereits entwertet.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Fehler beim Speichern der Unterschrift. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Lock Time (MM:SS)
  const formatLockTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')} Min.`;
  };

  return (
    <div className="min-h-screen bg-[#eef0ed] font-sans text-[#191c1c] flex flex-col justify-between selection:bg-[#003527]/20 antialiased relative overflow-hidden">
      
      {/* Background Decorative Blob Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D1DCDB]/40 blur-[120px] pointer-events-none -z-10 animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#003527]/5 blur-[100px] pointer-events-none -z-10 animate-blob" style={{ animationDelay: '3s' }} />

      {/* Header */}
      <header className="px-6 py-6 max-w-4xl mx-auto w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#003527] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            P
          </div>
          <span className="font-extrabold text-sm text-[#003527] tracking-tight">Praxis Ruether</span>
        </div>
        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#bfc9c3]/30 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-[#003527]/70 uppercase tracking-wide">End-to-End verschlüsselt</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow flex items-center justify-center p-4 lg:p-6 w-full max-w-lg mx-auto z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: BIRTHDATE GATE */}
          {step === 'gate' && (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[#bfc9c3]/40 rounded-3xl p-6 lg:p-8 w-full shadow-[0_10px_30px_rgba(0,53,39,0.03)] space-y-6 text-left"
            >
              <div className="space-y-2">
                <div className="p-3 bg-[#003527]/5 text-[#003527] rounded-2xl w-fit">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[#003527] tracking-tight pt-1">Klienten-Verifizierung</h2>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  Um Ihre sensiblen gesundheitsbezogenen Dokumente zu schützen, geben Sie bitte Ihr Geburtsdatum ein.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label htmlFor="birthday" className="block text-[10px] font-bold uppercase tracking-widest text-[#003527]/70">
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    required
                    disabled={isLocked}
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full bg-[#f9f9f8] border border-[#bfc9c3]/40 focus:border-[#003527] focus:ring-1 focus:ring-[#003527] rounded-xl px-4 py-3 font-bold text-sm text-[#003527] outline-none transition-all placeholder-zinc-400 disabled:opacity-50"
                  />
                </div>

                {errorMessage && (
                  <div className="flex gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying || isLocked || !birthday}
                  className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer border-none outline-none"
                >
                  {isVerifying ? (
                    'Verifiziere...'
                  ) : isLocked ? (
                    `Gesperrt (noch ${formatLockTime(lockTimeRemaining)})`
                  ) : (
                    <>
                      Dokument freischalten <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: GDPR DOCUMENT & SIGNATURE */}
          {step === 'document' && (
            <motion.div
              key="document"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[#bfc9c3]/40 rounded-3xl p-6 lg:p-8 w-full shadow-[0_10px_30px_rgba(0,53,39,0.03)] space-y-6 text-left"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                    Verifiziert
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold">
                    Klient: <strong className="text-[#003527]">{clientName}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#003527] tracking-tight pt-1">Datenschutzerklärung</h2>
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                  Bitte lesen Sie die folgende Einwilligungserklärung sorgfältig durch und unterzeichnen Sie im Feld unten.
                </p>
              </div>

              {/* Scrollable GDPR Text Box */}
              <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-4 text-[11px] text-[#404944] font-medium leading-relaxed max-h-[160px] overflow-y-auto space-y-3.5 custom-scrollbar">
                <p className="font-extrabold text-[#003527] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#003527]/60" /> Einwilligung in die Verarbeitung von Gesundheitsdaten (Art. 9 Abs. 2 lit. a DSGVO)
                </p>
                <p>
                  Ich willige hiermit ausdrücklich ein, dass die <strong>Praxis Ruether</strong> meine personenbezogenen Daten, insbesondere meine gesundheitsbezogenen Daten (wie Diagnosen, Befunde, Behandlungsberichte, SOAP-Notes, Rezeptinformationen und Anamneseberichte), zum Zweck der therapeutischen Befunderhebung, Behandlungsdokumentation und Abrechnung verarbeitet und speichert.
                </p>
                <p>
                  Die Verarbeitung dieser Daten ist rechtlich zwingend erforderlich, um eine fachgerechte therapeutische Behandlung durchzuführen und zu dokumentieren.
                </p>
                <p>
                  <strong>Widerrufsrecht:</strong> Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft ganz oder teilweise widerrufen. Durch den Widerruf wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt. Im Falle eines Widerrufs kann eine weitere Behandlung in der Praxis jedoch ggf. nicht fortgesetzt werden.
                </p>
                <p>
                  <strong>Datenspeicherung:</strong> Nach Abschluss der Behandlung werden Ihre Daten gemäß den gesetzlichen Aufbewahrungsfristen für medizinische Dokumente (i.d.R. 10 Jahre) gespeichert und anschließend DSGVO-konform gelöscht.
                </p>
              </div>

              {/* Signature Draw Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#003527]/70 flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-[#003527]/60" /> Digitale Unterschrift
                  </label>
                  {hasSigned && (
                    <button
                      onClick={clearCanvas}
                      className="text-[10px] font-extrabold text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 outline-none"
                    >
                      <RotateCcw className="w-3 h-3" /> Zurücksetzen
                    </button>
                  )}
                </div>

                <div className="border border-[#bfc9c3]/50 rounded-2xl overflow-hidden bg-[#f9f9f8] relative">
                  {/* Dotted Baseline & Indicator for Premium Touch Signature Fields */}
                  <div className="absolute bottom-[28%] left-6 right-6 border-b border-dashed border-zinc-200/80 pointer-events-none select-none" />
                  <div className="absolute bottom-[26%] left-6 text-zinc-300 font-bold text-[13px] pointer-events-none select-none font-mono">
                    X
                  </div>

                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full block cursor-crosshair touch-none relative z-10"
                  />
                  {!hasSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-zinc-300 font-bold text-[11px] uppercase tracking-widest gap-1.5 z-20">
                      Hier mit Finger oder Maus unterschreiben
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="flex gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleSubmitSignature}
                disabled={isSubmitting || !hasSigned}
                className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer border-none outline-none"
              >
                {isSubmitting ? (
                  'Speichert Unterschrift...'
                ) : (
                  <>
                    Zustimmen & Unterschreiben <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS VIEW */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[#bfc9c3]/40 rounded-3xl p-8 w-full shadow-[0_10px_30px_rgba(0,53,39,0.03)] space-y-6 text-center"
            >
              <div className="space-y-3 flex flex-col items-center">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full w-fit shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-[#003527] tracking-tight pt-1">Einwilligung erteilt!</h2>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed max-w-xs mx-auto">
                  Vielen Dank, <strong className="text-[#003527]">{clientName}</strong>. Ihre Datenschutzerklärung wurde sicher und gesetzeskonform gespeichert.
                </p>
              </div>

              <div className="bg-[#f9f9f8] border border-[#bfc9c3]/30 rounded-2xl p-4 text-[10px] text-zinc-400 font-semibold leading-relaxed space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-700 font-extrabold">Aktiv (DSGVO Konform)</span>
                </div>
                <div className="flex justify-between">
                  <span>Zeitpunkt:</span>
                  <span className="text-[#003527] font-bold">{new Date().toLocaleString('de-DE')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sicherheits-Token:</span>
                  <span className="font-mono text-zinc-400 font-bold truncate max-w-[150px]">{token}</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-300 font-semibold">
                Der Verifizierungslink wurde entwertet. Sie können dieses Browserfenster jetzt schließen.
              </p>

              {isKioskMode && (
                <div className="pt-2">
                  <button
                    onClick={() => window.close()}
                    className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-[0.99] shadow-md cursor-pointer border-none outline-none"
                  >
                    Kiosk-Modus beenden (Fenster schließen)
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: ERROR / GENERAL ERROR */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[#bfc9c3]/40 rounded-3xl p-8 w-full shadow-[0_10px_30px_rgba(0,53,39,0.03)] space-y-6 text-center"
            >
              <div className="space-y-3 flex flex-col items-center">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-full w-fit shadow-inner">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-rose-800 tracking-tight pt-1">Fehler aufgetreten</h2>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed max-w-xs mx-auto">
                  {errorMessage || 'Der Link ist abgelaufen oder ungültig. Bitte wenden Sie sich direkt an die Praxis.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setStep('gate')}
                  className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-[0.99] shadow-md cursor-pointer border-none outline-none"
                >
                  Erneut versuchen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-4xl mx-auto w-full text-center text-[10px] text-zinc-400 font-semibold space-y-1 z-10">
        <p>© {new Date().getFullYear()} Praxis Ruether. Alle Rechte vorbehalten.</p>
        <p className="text-zinc-300">
          Entwickelt gemäß Artikel 9 und 13 der EU-Datenschutz-Grundverordnung (DSGVO).
        </p>
      </footer>
    </div>
  );
}
