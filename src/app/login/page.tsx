'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for showing the professional success screen
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);

  // States to keep track of active input focus
  const [focusField, setFocusField] = useState<string | null>(null);

  const checkPasswordStrength = (pw: string) => {
    const requirements = {
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      lowercase: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = 'Sehr schwach';
    let color = 'bg-rose-500';
    let width = 'w-1/5';
    
    if (pw.length === 0) {
      label = 'Passwort eingeben';
      color = 'bg-zinc-200';
      width = 'w-0';
    } else if (score === 2) {
      label = 'Schwach';
      color = 'bg-orange-400';
      width = 'w-2/5';
    } else if (score === 3) {
      label = 'Mittel';
      color = 'bg-amber-400';
      width = 'w-3/5';
    } else if (score === 4) {
      label = 'Gut';
      color = 'bg-emerald-400';
      width = 'w-4/5';
    } else if (score === 5) {
      label = 'Stark (Empfohlen)';
      color = 'bg-[#003527]';
      width = 'w-full';
    }

    const isValid = requirements.length && requirements.uppercase && requirements.lowercase && requirements.number && requirements.special;

    return { requirements, score, label, color, width, isValid };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'signup') {
        setActiveMode('signup');
      }
      
      const stored = localStorage.getItem('completed_onboarding_practice');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.practiceName) {
            setRestaurantName(data.practiceName);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Redirect to dashboard if user is already logged in (guarded against redirect loops)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const count = parseInt(sessionStorage.getItem('login_redirect_count') || '0', 10);
        if (count > 3) {
          console.error("Potential redirect loop detected in getSession. Signing out.");
          sessionStorage.removeItem('login_redirect_count');
          supabase.auth.signOut();
        } else {
          sessionStorage.setItem('login_redirect_count', (count + 1).toString());
          router.push('/dashboard');
        }
      } else {
        sessionStorage.removeItem('login_redirect_count');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const count = parseInt(sessionStorage.getItem('login_redirect_count') || '0', 10);
        if (count > 3) {
          console.error("Potential redirect loop detected in onAuthStateChange. Signing out.");
          sessionStorage.removeItem('login_redirect_count');
          supabase.auth.signOut();
        } else {
          sessionStorage.setItem('login_redirect_count', (count + 1).toString());
          router.push('/dashboard');
        }
      } else {
        sessionStorage.removeItem('login_redirect_count');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/login`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Fehler beim Google-Login.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (activeMode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Fehler beim Anmelden.');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      if (!restaurantName) {
        setError('Bitte gib den Namen deiner Praxis oder deinen Namen an.');
        setIsLoading(false);
        return;
      }

      // Secure password check
      const strength = checkPasswordStrength(password);
      if (!strength.isValid) {
        setError('Bitte wähle ein sichereres Passwort, das alle Kriterien erfüllt.');
        setIsLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || 'Fehler bei der Registrierung.');
        setIsLoading(false);
        return;
      }

      const user = signUpData.user;
      if (user) {
        const { error: restError } = await supabase.from('practices').insert({
          user_id: user.id,
          name: restaurantName,
          currency: 'EUR',
        });

        if (restError) {
          console.error('Praxis-Eintrag konnte nicht erstellt werden:', restError);
        }

        // Insert first service from onboarding if it exists in local storage
        const stored = localStorage.getItem('completed_onboarding_practice');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.firstService) {
              await supabase.from('services').insert({
                id: crypto.randomUUID(),
                user_id: user.id,
                name: data.firstService.name,
                duration: data.firstService.duration,
                price: data.firstService.price
              });
            }
          } catch (e) {
            console.error('Konnte Onboarding-Service nicht anlegen:', e);
          }
        }

        if (signUpData.session) {
          router.push('/dashboard');
        } else {
          // Trigger the new success screen instead of a small box message
          setIsSuccessScreen(true);
        }
      }
    }
  };

  const isButtonDisabled = isLoading || (
    activeMode === 'login' 
      ? (!email || !password) 
      : (!email || !restaurantName || !checkPasswordStrength(password).isValid)
  );

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex flex-col lg:flex-row font-sans selection:bg-emerald-500/20 selection:text-[#003527] overflow-y-auto">
      
      {/* LEFT COLUMN: LOGIN INTERFACE (50% with padding and back button) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-20 xl:px-24 bg-[#f9f9f8] relative min-h-screen">
        
        {/* Back Link */}
        <div className="absolute top-8 left-8">
          <Link 
            href="/" 
            className="flex items-center text-xs font-semibold text-[#404944] hover:text-[#003527] transition-colors"
          >
            <span className="mr-1.5">&larr;</span> Zurück zur Website
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[380px] w-full mx-auto mt-8"
        >
          {isSuccessScreen ? (
            // --- PROFESSIONAL SUCCESS SCREEN ---
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center py-6"
            >
              {/* Flat, clean icon container matching home page tiles */}
              <div className="w-20 h-20 bg-[#f3f4f3] rounded-[2rem] flex items-center justify-center mb-10">
                <Mail className="h-8 w-8 text-[#003527]" strokeWidth={1.5} />
              </div>
              
              <div className="space-y-4 max-w-[320px]">
                <h2 className="text-3xl font-bold font-sans text-[#003527] tracking-tight">
                  E-Mail bestätigen
                </h2>
                <p className="text-sm text-[#404944] leading-relaxed">
                  Wir haben dir einen Link an <br />
                  <span className="font-semibold text-[#003527] bg-[#f3f4f3] px-2 py-1 rounded-md mt-1 inline-block">{email || 'deine E-Mail'}</span><br /> 
                  gesendet. Bitte aktiviere dein Konto über den Link.
                </p>
              </div>
              
              <div className="w-full pt-10">
                <button
                  onClick={() => {
                    setIsSuccessScreen(false);
                    setActiveMode('login');
                    setEmail('');
                    setPassword('');
                  }}
                  className="w-full py-4 text-[#003527] text-sm font-bold tracking-wide hover:bg-[#f3f4f3] rounded-2xl transition-all cursor-pointer"
                >
                  Zurück zum Login
                </button>
              </div>
            </motion.div>
          ) : (
            // --- STANDARD LOGIN / SIGNUP FORM ---
            <div className="space-y-8">
              {/* Toggle Tab Header: Login / Sign Up */}
              <div className="flex justify-center">
                <div className="inline-flex bg-[#f3f4f3] p-1 rounded-full border border-zinc-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('login');
                      setError('');
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeMode === 'login'
                        ? 'bg-white text-[#003527] shadow-none'
                        : 'text-[#404944] hover:text-[#003527]'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('signup');
                      setError('');
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeMode === 'signup'
                        ? 'bg-white text-[#003527] shadow-none'
                        : 'text-[#404944] hover:text-[#003527]'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-semibold font-sans text-[#003527] tracking-tight">
                  {activeMode === 'login' ? 'Willkommen!' : 'Konto erstellen'}
                </h2>
                <p className="text-xs text-[#404944]">
                  {activeMode === 'login' 
                    ? 'Bitte gib deine Zugangsdaten ein, um dich anzumelden.' 
                    : 'Erstelle jetzt dein kostenloses Praxis-Konto.'}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-sans">
                    {error}
                  </div>
                )}

                {/* Practice Name Field (Sign Up Mode) */}
                {activeMode === 'signup' && (
                  <div 
                    className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                      focusField === 'restaurantName' || restaurantName
                        ? 'border-[#003527] ring-1 ring-[#003527]'
                        : 'border-zinc-200'
                    }`}
                  >
                    <label 
                      htmlFor="restaurantName" 
                      className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                        focusField === 'restaurantName' || restaurantName
                          ? 'top-1.5 text-[10px] text-[#003527]'
                          : 'top-2.5 text-xs text-zinc-400 font-normal'
                      }`}
                    >
                      Name der Praxis / Name des Therapeuten
                    </label>
                    <input
                      id="restaurantName"
                      type="text"
                      required
                      value={restaurantName}
                      autoComplete="organization"
                      onFocus={() => setFocusField('restaurantName')}
                      onBlur={() => setFocusField(null)}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6"
                    />
                  </div>
                )}

                {/* Email Field with Stripe-Style Floating Label */}
                <div 
                  className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                    focusField === 'email' || email
                      ? 'border-[#003527] ring-1 ring-[#003527]'
                      : 'border-zinc-200'
                  }`}
                >
                  <label 
                    htmlFor="email" 
                    className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                      focusField === 'email' || email
                        ? 'top-1.5 text-[10px] text-[#003527]'
                        : 'top-2.5 text-xs text-zinc-400 font-normal'
                    }`}
                  >
                    E-Mail-Adresse
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    autoComplete="email"
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6"
                  />
                </div>

                {/* Password Field with Stripe-Style Floating Label */}
                <div 
                  className={`relative border rounded-xl px-3.5 pt-5 pb-2 transition-all duration-200 bg-white ${
                    focusField === 'password' || password
                      ? 'border-[#003527] ring-1 ring-[#003527]'
                      : 'border-zinc-200'
                  }`}
                >
                  <label 
                    htmlFor="password" 
                    className={`absolute left-3.5 transition-all duration-200 font-sans pointer-events-none font-semibold ${
                      focusField === 'password' || password
                        ? 'top-1.5 text-[10px] text-[#003527]'
                        : 'top-2.5 text-xs text-zinc-400 font-normal'
                    }`}
                  >
                    Passwort
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    autoComplete={activeMode === 'login' ? 'current-password' : 'new-password'}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full border-0 p-0 text-sm text-zinc-950 focus:ring-0 focus:outline-none bg-transparent h-6 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-zinc-400 hover:text-[#003527] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>

                {/* Password Strength Indicator (Sign Up Mode only) */}
                {activeMode === 'signup' && (password.length > 0 || focusField === 'password') && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2.5 pt-1 overflow-hidden"
                  >
                    {/* Strength Bar */}
                    {(() => {
                      const { label, color, width } = checkPasswordStrength(password);
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-zinc-400">Passwortstärke:</span>
                            <span className="text-[#003527]">{label}</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                            <div className={`h-full ${color} ${width} transition-all duration-300 rounded-full`} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Requirements Checklist */}
                    {(() => {
                      const { requirements } = checkPasswordStrength(password);
                      const reqList = [
                        { key: 'length', text: 'Mindestens 8 Zeichen' },
                        { key: 'uppercase', text: 'Großbuchstabe (A-Z)' },
                        { key: 'lowercase', text: 'Kleinbuchstabe (a-z)' },
                        { key: 'number', text: 'Zahl (0-9)' },
                        { key: 'special', text: 'Sonderzeichen (@, !)' }
                      ];

                      return (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-medium text-zinc-500 bg-[#f3f4f3]/40 border border-[#bfc9c3]/20 rounded-xl p-3">
                          {reqList.map((req) => {
                            const isMet = requirements[req.key as keyof typeof requirements];
                            return (
                              <div key={req.key} className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                                  isMet ? 'bg-[#003527]' : 'bg-zinc-300'
                                }`} />
                                <span className={`transition-colors ${isMet ? 'text-[#003527] font-semibold' : 'text-zinc-400'}`}>
                                  {req.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Forgot password (only in login mode) */}
                {activeMode === 'login' && (
                  <div className="text-left">
                    <a href="#" className="text-xs text-[#003527] hover:underline font-bold">
                      Passwort vergessen?
                    </a>
                  </div>
                )}

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between py-1 border-t border-zinc-100 pt-4">
                  <span className="text-xs text-[#404944] font-medium">Anmeldedetails merken</span>
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-200"
                  >
                    <motion.span
                      animate={{ x: rememberMe ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-none border border-[#bfc9c3]/50 ring-0"
                      style={{
                        backgroundColor: rememberMe ? '#003527' : '#ffffff'
                      }}
                    />
                  </button>
                </div>

                {/* Main Log In Action */}
                <div className="pt-2">
                  <motion.button
                    whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isButtonDisabled}
                    className="w-full bg-[#003527] hover:bg-[#0b513d] text-white py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-none cursor-pointer disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:hover:bg-zinc-200"
                  >
                    {isLoading 
                      ? (activeMode === 'login' ? 'Melde an...' : 'Registriere...') 
                      : (activeMode === 'login' ? 'Anmelden' : 'Registrieren')}
                  </motion.button>
                </div>
              </form>

              {/* Social Sign In Providers Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-4 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">oder</span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>

              {/* Social Providers */}
              <div>
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#f3f4f3] hover:bg-zinc-100 rounded-full text-xs font-bold text-[#003527] flex items-center justify-center gap-3 transition-all cursor-pointer border border-[#bfc9c3]/30 shadow-none disabled:opacity-50"
                >
                  <Image 
                    src="/google-icon-logo.svg" 
                    alt="Google Logo" 
                    width={16} 
                    height={16} 
                    className="w-4 h-4" 
                  />
                  Mit Google anmelden
                </button>
              </div>

              {/* Alternate redirect */}
              <div className="text-center pt-2">
                <span className="text-xs text-[#404944]">
                  {activeMode === 'login' ? 'Noch kein Konto?' : 'Bereits ein Konto?'}{' '}
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveMode(activeMode === 'login' ? 'signup' : 'login');
                      setError('');
                    }} 
                    className="text-[#003527] hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                  >
                    {activeMode === 'login' ? 'Registrieren' : 'Anmelden'}
                  </button>
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* RIGHT COLUMN: BRAND & IMAGE SHOWCASE (50% with inner border margin, testimonial overlay) */}
      <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-end min-h-[500px] lg:min-h-screen relative overflow-hidden">
        
        {/* Rounded editorial image wrapper with margin spacing */}
        <div className="absolute inset-6 rounded-[2.5rem] overflow-hidden">
          <Image
            src="/praxis_login_bg.png"
            alt="Modern Cafe Atmosphere"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle overlay gradient over image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        {/* Floating Testimonial/Badge Content over Image */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 p-8 max-w-xl text-white space-y-4"
        >
          <p className="text-2xl font-semibold font-sans leading-snug tracking-tight">
            „Mit PraxisManager haben wir unsere Praxisorganisation komplett digitalisiert. Termine und SOAP-Notes sind an einem Ort.“
          </p>
          <div className="flex justify-between items-end">
            <div>
              <h4 className="font-bold text-sm text-white">Dr. Michael Ruether</h4>
              <p className="text-xs text-zinc-300">Physiotherapeut • Praxis Ruether</p>
            </div>
            {/* Pagination indicators */}
            <div className="flex gap-4 text-white/70">
              <button className="hover:text-white transition-colors cursor-pointer text-sm font-bold">&larr;</button>
              <button className="hover:text-white transition-colors cursor-pointer text-sm font-bold">&rarr;</button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
