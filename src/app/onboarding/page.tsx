'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, Plus, X, 
  CheckCircle2, ArrowRight, UploadCloud, 
  Coins, Smartphone, Eye, CalendarRange
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  
  // Auth & DB States
  const [userId, setUserId] = useState<string | null>(null);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding Step State
  const [step, setStep] = useState(1);

  // Step 1: Branding
  const [practiceName, setPracticeName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Step 2: Categories / Specialties
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  
  const suggestedCategories = [
    'Physiotherapie', 'Ergotherapie', 'Logopädie', 
    'Osteopathie', 'Heilpraktik', 'Massage & Wellness', 'Coaching'
  ];

  // Step 3: First Service
  const [serviceTitle, setServiceTitle] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');

  // Floating label active states
  const [focusField, setFocusField] = useState<string | null>(null);

  // Load existing session info on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setTherapistId(session.user.id);
        const storedName = localStorage.getItem(`therapist_name_${session.user.id}`);
        if (storedName) setPracticeName(storedName);
      }
    });
  }, []);

  useEffect(() => {
    const defaultCat = categories.length > 0 ? categories[0] : 'Physiotherapie';
    if (!serviceCategory) {
      setServiceCategory(defaultCat);
    }
  }, [categories, serviceCategory]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      if (!serviceCategory) setServiceCategory(trimmed);
    }
  };

  const handleRemoveCategory = (catName: string) => {
    setCategories(categories.filter(c => c !== catName));
    if (serviceCategory === catName) {
      setServiceCategory(categories.find(c => c !== catName) || '');
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !practiceName.trim()) {
      alert('Bitte gib den Namen deiner Praxis oder deinen Namen an.');
      return;
    }
    if (step === 2 && categories.length === 0) {
      alert('Bitte füge mindestens einen Fachbereich hinzu.');
      return;
    }
    if (step === 3 && (!serviceTitle.trim() || !servicePrice.trim())) {
      alert('Bitte gib einen Titel und einen Preis für deine Leistung an.');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      const activeCat = serviceCategory || (previewCategories.length > 0 ? previewCategories[0] : 'Physiotherapie');
      const finalName = serviceTitle.trim();
      const finalPrice = parseFloat(servicePrice.trim().replace(',', '.'));

      const onboardingData = {
        practiceName,
        categories,
        firstService: {
          name: finalName,
          price: finalPrice,
          duration: parseInt(serviceDuration),
          category: activeCat,
          description: serviceDescription.trim(),
        }
      };
      localStorage.setItem('completed_onboarding_practice', JSON.stringify(onboardingData));

      if (userId) {
        localStorage.setItem(`therapist_name_${userId}`, practiceName);
        
        // 1. Upsert practice details in Supabase
        await supabase.from('practices').upsert({
          user_id: userId,
          name: practiceName,
          currency: 'EUR'
        });

        // 2. Create the first service in Supabase
        const serviceId = crypto.randomUUID();
        await supabase.from('services').insert({
          id: serviceId,
          user_id: userId,
          name: finalName,
          duration: parseInt(serviceDuration),
          price: finalPrice
        });
      }
      
      if (userId) {
        router.push('/dashboard');
      } else {
        router.push('/login?mode=signup');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Wie heißt deine Praxis?";
      case 2: return "Wähle deine Fachbereiche";
      case 3: return "Lege deine erste Leistung an";
      case 4: return "Deine Praxis ist startklar!";
      default: return "";
    }
  };

  const getStepDesc = () => {
    switch (step) {
      case 1: return "Der Name, den deine Klienten auf der Buchungsseite und auf Rechnungen sehen.";
      case 2: return "Wähle deine Schwerpunkte aus. Du kannst eigene Begriffe eintippen oder Vorschläge wählen.";
      case 3: return "Erstelle eine erste Behandlungsleistung, die Klienten online buchen können.";
      case 4: return "Dein Onboarding ist abgeschlossen. Du kannst nun deinen Kalender verwalten und Klienten einladen.";
      default: return "";
    }
  };

  const previewPracticeName = practiceName.trim() || "Meine Praxis";
  const previewCategories = categories.length > 0 ? categories : ['Physiotherapie', 'Osteopathie'];

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex flex-col lg:flex-row font-sans selection:bg-emerald-500/20 selection:text-[#003527] overflow-hidden">
      
      {/* LEFT COLUMN: CONFIGURATION */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 py-8 sm:px-16 lg:px-20 xl:px-24 bg-[#f9f9f8] relative min-h-[600px] lg:min-h-screen z-10">
        <div className="max-w-[420px] w-full mx-auto flex flex-col justify-between flex-grow">
          
          {/* Top Header */}
          <div className="flex justify-between items-center w-full">
            <Link 
              href={userId ? "/dashboard" : "/"} 
              className="flex items-center gap-2 text-xs font-bold text-[#404944] hover:text-[#003527] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {userId ? "Zurück zum Dashboard" : "Abbrechen"}
            </Link>
          </div>

          {/* Form Container */}
          <div className="w-full my-auto py-8">
            {/* Progress Indicator */}
            <div className="space-y-2 mb-8">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#404944] uppercase tracking-widest">
                <span>Schritt {step} von 4</span>
                <span>{Math.round((step / 4) * 100)}% abgeschlossen</span>
              </div>
              <div className="h-1.5 w-full bg-[#f3f4f3] rounded-full overflow-hidden border border-[#bfc9c3]/10">
                <motion.div 
                  className="h-full bg-[#003527]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-semibold font-serif text-[#043F2D] leading-tight tracking-tight mb-2">
                    {getStepTitle()}
                  </h2>
                  <p className="text-sm text-[#404944] leading-relaxed">
                    {getStepDesc()}
                  </p>
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div 
                      className={`relative border rounded-2xl px-4 pt-5 pb-2 transition-all duration-250 bg-white ${
                        focusField === 'practiceName' || practiceName
                          ? 'border-[#003527] ring-1 ring-[#003527]'
                          : 'border-[#bfc9c3]/50 hover:border-[#003527]/30'
                      }`}
                    >
                      <label 
                        htmlFor="practiceName" 
                        className={`absolute left-4 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                          focusField === 'practiceName' || practiceName
                            ? 'top-1.5 text-[10px] text-[#003527]'
                            : 'top-3.5 text-sm text-zinc-400 font-normal'
                        }`}
                      >
                        Praxisname oder dein Name
                      </label>
                      <input
                        id="practiceName"
                        type="text"
                        required
                        value={practiceName}
                        onFocus={() => setFocusField('practiceName')}
                        onBlur={() => setFocusField(null)}
                        onChange={(e) => setPracticeName(e.target.value)}
                        className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6"
                      />
                    </div>

                    <div className="border border-dashed border-[#bfc9c3] rounded-2xl p-6 bg-white flex flex-col items-center justify-center text-center group hover:border-[#003527]/60 transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {logoPreviewUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={logoPreviewUrl} 
                            alt="Logo Preview" 
                            className="h-16 w-16 object-contain rounded-lg border border-[#bfc9c3]/30 p-1"
                          />
                          <span className="text-xs font-bold text-[#003527]">Logo geladen</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-[#f3f4f3] rounded-xl flex items-center justify-center mb-3">
                            <UploadCloud className="h-5 w-5 text-[#003527]" />
                          </div>
                          <span className="text-xs font-bold text-[#003527] mb-1">Praxislogo hochladen (optional)</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div 
                      className={`flex border bg-white rounded-2xl overflow-hidden transition-all duration-250 ${
                        focusField === 'customCategory' || customCategory
                          ? 'border-[#003527] ring-1 ring-[#003527]'
                          : 'border-[#bfc9c3]/50 hover:border-[#003527]/30'
                      }`}
                    >
                      <div className="relative px-4 pt-5 pb-2 flex-grow">
                        <label 
                          htmlFor="customCategory" 
                          className={`absolute left-4 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                            focusField === 'customCategory' || customCategory
                              ? 'top-1.5 text-[10px] text-[#003527]'
                              : 'top-3.5 text-sm text-zinc-400 font-normal'
                          }`}
                        >
                          Fachbereich hinzufügen
                        </label>
                        <input
                          id="customCategory"
                          type="text"
                          value={customCategory}
                          onFocus={() => setFocusField('customCategory')}
                          onBlur={() => setFocusField(null)}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory(customCategory);
                              setCustomCategory('');
                            }
                          }}
                          className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleAddCategory(customCategory);
                          setCustomCategory('');
                        }}
                        className="bg-[#003527] hover:bg-[#0b513d] text-white px-5 flex items-center justify-center transition-colors shrink-0"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-6">
                      <AnimatePresence>
                        {categories.map(cat => (
                          <motion.span
                            key={cat}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="inline-flex items-center gap-1 bg-[#003527]/10 text-[#003527] px-3 py-1.5 rounded-full text-xs font-bold border border-[#003527]/10"
                          >
                            {cat}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCategory(cat)}
                              className="hover:bg-[#003527]/20 p-0.5 rounded-full transition-colors cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[#bfc9c3]/30">
                      <label className="text-[10px] font-bold text-[#404944] uppercase tracking-wider block">Vorschläge</label>
                      <div className="flex flex-wrap gap-2">
                        {suggestedCategories.map(cat => {
                          const isActive = categories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              disabled={isActive}
                              onClick={() => handleAddCategory(cat)}
                              className={`px-3 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                isActive 
                                  ? 'bg-zinc-100 text-zinc-400 border-zinc-200/50 cursor-default' 
                                  : 'bg-white text-[#003527] border-[#bfc9c3]/50 hover:border-[#003527]/40 hover:bg-[#f3f4f3]'
                              }`}
                            >
                              + {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div 
                      className={`relative border rounded-2xl px-4 pt-5 pb-2 transition-all duration-250 bg-white ${
                        focusField === 'serviceTitle' || serviceTitle
                          ? 'border-[#003527] ring-1 ring-[#003527]'
                          : 'border-[#bfc9c3]/50 hover:border-[#003527]/30'
                      }`}
                    >
                      <label 
                        htmlFor="serviceTitle" 
                        className={`absolute left-4 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                          focusField === 'serviceTitle' || serviceTitle
                            ? 'top-1.5 text-[10px] text-[#003527]'
                            : 'top-3.5 text-sm text-zinc-400 font-normal'
                        }`}
                      >
                        Bezeichnung der Leistung (z.B. Osteopathie Erstgespräch)
                      </label>
                      <input
                        id="serviceTitle"
                        type="text"
                        required
                        value={serviceTitle}
                        onFocus={() => setFocusField('serviceTitle')}
                        onBlur={() => setFocusField(null)}
                        onChange={(e) => setServiceTitle(e.target.value)}
                        className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`relative border rounded-2xl px-4 pt-5 pb-2 transition-all duration-250 bg-white ${
                          focusField === 'servicePrice' || servicePrice
                            ? 'border-[#003527] ring-1 ring-[#003527]'
                            : 'border-[#bfc9c3]/50 hover:border-[#003527]/30'
                        }`}
                      >
                        <label 
                          htmlFor="servicePrice" 
                          className={`absolute left-4 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                            focusField === 'servicePrice' || servicePrice
                              ? 'top-1.5 text-[10px] text-[#003527]'
                              : 'top-3.5 text-sm text-zinc-400 font-normal'
                          }`}
                        >
                          Preis in € (z.B. 80.00)
                        </label>
                        <input
                          id="servicePrice"
                          type="text"
                          required
                          value={servicePrice}
                          onFocus={() => setFocusField('servicePrice')}
                          onBlur={() => setFocusField(null)}
                          onChange={(e) => setServicePrice(e.target.value)}
                          className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6"
                        />
                      </div>

                      <div className="border border-[#bfc9c3]/50 rounded-2xl px-4 py-3 bg-white flex items-center h-14">
                        <select
                          value={serviceDuration}
                          onChange={(e) => setServiceDuration(e.target.value)}
                          className="block w-full border-0 p-0 text-sm text-[#003527] font-semibold focus:ring-0 focus:outline-none bg-transparent"
                        >
                          <option value="30">30 Minuten</option>
                          <option value="45">45 Minuten</option>
                          <option value="60">60 Minuten</option>
                          <option value="90">90 Minuten</option>
                        </select>
                      </div>
                    </div>

                    <div 
                      className={`relative border rounded-2xl px-4 pt-5 pb-2 transition-all duration-250 bg-white ${
                        focusField === 'serviceDescription' || serviceDescription
                          ? 'border-[#003527] ring-1 ring-[#003527]'
                          : 'border-[#bfc9c3]/50 hover:border-[#003527]/30'
                      }`}
                    >
                      <label 
                        htmlFor="serviceDescription" 
                        className={`absolute left-4 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                          focusField === 'serviceDescription' || serviceDescription
                            ? 'top-1.5 text-[10px] text-[#003527]'
                            : 'top-3.5 text-sm text-zinc-400 font-normal'
                        }`}
                      >
                        Kurze Beschreibung (optional)
                      </label>
                      <textarea
                        id="serviceDescription"
                        value={serviceDescription}
                        onFocus={() => setFocusField('serviceDescription')}
                        onBlur={() => setFocusField(null)}
                        onChange={(e) => setServiceDescription(e.target.value)}
                        className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-12 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-[#10b981]/5 border border-[#10b981]/20 p-5 rounded-2xl flex gap-3.5 items-start">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-[#043F2D] mb-1">Praxis eingerichtet</h4>
                        <p className="text-xs text-[#404944] leading-relaxed">
                          Deine Dienstleistungen wurden hinterlegt. Der Kalender und die Klientenakte stehen jetzt zur Verfügung.
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompleteOnboarding}
                      disabled={isLoading}
                      className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-4 rounded-2xl text-sm font-bold tracking-wide transition-all shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Speichert...' : 'Zum Dashboard'} 
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Step Navigation Buttons */}
            {step < 4 && (
              <div className="mt-8 pt-6 border-t border-[#bfc9c3]/30 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className={`px-5 py-3 text-xs font-bold text-[#003527] rounded-xl transition-all ${
                    step === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#f3f4f3]'
                  }`}
                  disabled={step === 1}
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#003527] hover:bg-[#0b513d] text-white px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  Weiter <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="w-full lg:w-1/2 bg-[#D1DCDB]/50 border-l border-[#bfc9c3]/30 flex items-center justify-center p-8">
        <div className="relative w-[300px] h-[600px] bg-black rounded-[45px] p-2 shadow-2xl">
          <div className="w-full h-full bg-[#f9f9f8] rounded-[38px] overflow-hidden flex flex-col relative">
            <div className="h-28 bg-[#003527] flex items-end p-4">
              <h2 className="text-xl font-bold text-white leading-none">{previewPracticeName}</h2>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
              <h3 className="text-xs font-extrabold text-[#003527]/50 uppercase tracking-widest">Leistungen</h3>
              <div className="space-y-2">
                {serviceTitle ? (
                  <div className="bg-white p-3 rounded-2xl border border-[#bfc9c3]/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-[#043F2D]">{serviceTitle}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{serviceDuration} Min.</p>
                    </div>
                    <span className="font-extrabold text-xs text-[#003527]">{servicePrice || '0.00'} €</span>
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-[#003527]/40 font-semibold italic">
                    Deine Leistungen werden hier gelistet...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
