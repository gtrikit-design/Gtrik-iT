import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Lock, Zap, Mail, User, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [step, setStep] = useState<'start' | 'email' | 'details'>('start');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isDev, setIsDev] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Check if the email is the specific developer email
  useEffect(() => {
    if (email.trim().toLowerCase() === 'gtrikit@gmail.com') {
      setIsDev(true);
    } else {
      setIsDev(false);
    }
  }, [email]);

  // Focus input when step changes
  useEffect(() => {
    if (step === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [step]);

  const handleGoogleClick = () => {
    setStep('email');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setStep('details');
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDev) {
       if (!password) return;
       onLogin({
         email: email,
         name: 'Developer',
         plan: 'Admin Access',
         credits: 'Unlimited',
         role: 'developer'
       });
    } else {
       // Use name or fallback to email prefix
       const finalName = name.trim() || email.split('@')[0];
       onLogin({
         email: email,
         name: finalName,
         plan: 'Free Access',
         credits: 'Unlimited',
         role: 'student'
       });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#0B0E14] relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0F1623] border border-gray-800 shadow-2xl relative z-10 animate-fade-in">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 select-none mb-6 transform hover:scale-105 transition-transform duration-300">
              {/* Icon Logo (Custom Image or Styled Zap Fallback) */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden border border-white/10">
                  {!logoError ? (
                      <img 
                          src="logo.png" 
                          alt="GTRIK" 
                          className="w-full h-full object-cover"
                          onError={() => setLogoError(true)}
                      />
                  ) : (
                      <Zap size={32} className="text-white fill-white" />
                  )}
              </div>
              <div className="flex flex-col items-start">
                  <div className="flex items-center text-4xl font-black italic tracking-tighter leading-none">
                      <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">GTRIK</span>
                      <span className="text-cyan-400 ml-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">iT</span>
                  </div>
                  <div className="flex items-center mt-2">
                      <Zap size={14} className="text-cyan-400 mr-2 fill-current animate-pulse" />
                      <span className="text-[12px] font-bold text-cyan-400 tracking-[0.25em] uppercase">METAGEN AI</span>
                  </div>
              </div>
          </div>
          
          {step === 'start' && (
            <>
              <h1 className="text-2xl font-bold text-white">Welcome</h1>
              <p className="text-gray-400 text-sm mt-2 text-center">Sign in to generate unlimited metadata</p>
            </>
          )}
          {step === 'email' && (
            <h1 className="text-xl font-bold text-white">Sign in</h1>
          )}
          {step === 'details' && (
             <h1 className="text-xl font-bold text-white">{isDev ? 'Verify Access' : 'Finish Setup'}</h1>
          )}
        </div>

        {/* STEP 1: Initial View with Google Button */}
        {step === 'start' && (
            <div className="space-y-4 animate-fade-in">
                <button 
                    onClick={handleGoogleClick}
                    className="w-full bg-white text-gray-900 font-medium py-3.5 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-800"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">Gtrik iT Secure Login</span>
                    <div className="flex-grow border-t border-gray-800"></div>
                </div>
            </div>
        )}

        {/* STEP 2: Email Input */}
        {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6 animate-fade-in">
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-500" />
                        </div>
                        <input 
                        ref={emailInputRef}
                        type="email" 
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@gmail.com"
                        className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        required
                        autoComplete="username email"
                        />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setStep('start')}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      >
                          <ArrowLeft size={20} />
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Next <ArrowRight size={18} />
                      </button>
                  </div>
            </form>
        )}

        {/* STEP 3: Details (Name or Password) */}
        {step === 'details' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in">
                {/* Show Email (Read Only) */}
                <button 
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-full flex items-center justify-between bg-[#151e2e] p-3 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors group"
                >
                    <div className="flex items-center text-gray-300 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3 shadow-md">
                             {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-400 font-medium">{isDev ? 'Developer Account' : 'Student Account'}</span>
                            <span>{email}</span>
                        </div>
                    </div>
                    <span className="text-cyan-500 text-xs group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity mr-2">Change</span>
                </button>

                {isDev ? (
                    <div className="animate-slide-up">
                        <label className="block text-xs font-medium text-purple-400 mb-2 uppercase tracking-wider flex items-center ml-1">
                            <Lock size={12} className="mr-1" /> Developer Password
                        </label>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-purple-500" />
                            </div>
                            <input 
                                type="password" 
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full bg-[#1F2937] border border-purple-900/50 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                required
                                autoFocus
                                autoComplete="current-password"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="animate-slide-up">
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-500" />
                            </div>
                            <input 
                                type="text" 
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                required
                                autoFocus
                                autoComplete="name"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 ml-1">
                            This name will be used for your profile and generated credits.
                        </p>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setStep('email')}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      >
                          <ArrowLeft size={20} />
                      </button>
                      <button 
                        type="submit"
                        className={`flex-1 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5
                        ${isDev 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white' 
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                        }`}
                      >
                        {isDev ? "Login to Dashboard" : "Start App"} <ArrowRight size={18} />
                      </button>
                </div>
            </form>
        )}

        {error && (
            <div className="mt-6 text-red-400 text-xs text-center bg-red-900/20 p-3 rounded-lg border border-red-900/30 animate-fade-in flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
              {error}
            </div>
        )}
        
        <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-600">
                By continuing, you agree to Gtrik iT's <span className="text-gray-500 underline cursor-pointer hover:text-cyan-500">Terms of Service</span> and <span className="text-gray-500 underline cursor-pointer hover:text-cyan-500">Privacy Policy</span>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;