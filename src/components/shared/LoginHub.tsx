import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight, Fingerprint, RefreshCw, KeyRound, AlertCircle, ArrowLeft, X } from 'lucide-react';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface LoginHubProps {
  onSuccess: () => void;
  onClose?: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const LoginHub: React.FC<LoginHubProps> = ({ onSuccess, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || password.length < 6) {
      setError('Please provide a valid email and a password (min 6 chars).');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Check your inbox.');
      setTimeout(() => setMode('login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };





  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020805]/95 backdrop-blur-xl p-4 overflow-y-auto select-none">
      {/* Orbs background layer */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-700/8 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[160px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative w-full max-w-md bg-[#030a06]/95 border border-[#082212] rounded-3xl shadow-2xl shadow-black/80 backdrop-blur-2xl p-8 flex flex-col gap-6 overflow-hidden"
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white hover:bg-[#082212]/40 rounded-lg transition-colors cursor-pointer focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {/* Brand visual header */}
        <div className="flex flex-col items-center text-center gap-2 select-text">
          <div className="p-3.5 bg-gradient-to-br from-[#d4af37] via-[#10b981] to-[#e5c158] rounded-2xl text-black flex items-center justify-center shadow-lg shadow-emerald-950/20">
            <Fingerprint className="h-6 w-6 text-black animate-pulse" />
          </div>
          <div className="flex flex-col gap-0.5 mt-2">
            <h2 className="text-xl font-extrabold tracking-tight font-display text-white">
              EduForge Security Hub
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Secure Cloud Gate • Multi-Factor Portal
            </span>
          </div>
        </div>

        {/* Status diagnostic messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-2.5 p-3.5 border border-rose-500/20 bg-rose-950/15 rounded-xl text-rose-300 leading-normal"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <p className="text-xs font-semibold select-text">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic form wrapper */}
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLoginSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email / Username
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-emerald-700" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. administrator@eduforge.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030e07]/60 border border-emerald-950/80 focus:border-[#d4af37] rounded-xl text-slate-200 text-xs outline-none select-text transition-all focus:ring-1 focus:ring-[#d4af37]/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[10px] font-bold text-[#d4af37] hover:text-[#e5c158] cursor-pointer focus:outline-none"
                    tabIndex={-1}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-emerald-700" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030e07]/60 border border-emerald-950/80 focus:border-[#d4af37] rounded-xl text-slate-200 text-xs outline-none select-text transition-all focus:ring-1 focus:ring-[#d4af37]/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#10b981] hover:from-[#e5c158] hover:to-[#0d9f6e] border border-[#d4af37]/20 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>Sign In Securely</span>
                      <ArrowRight className="h-4 w-4 text-black" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="w-full py-2.5 mt-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors focus:outline-none"
                  disabled={isLoading}
                >
                  Need an account? Register Now
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignupSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-emerald-700" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030e07]/60 border border-emerald-950/80 focus:border-[#d4af37] rounded-xl text-slate-200 text-xs outline-none select-text transition-all focus:ring-1 focus:ring-[#d4af37]/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Create Password (min 6 chars)
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-emerald-700" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030e07]/60 border border-emerald-950/80 focus:border-[#d4af37] rounded-xl text-slate-200 text-xs outline-none select-text transition-all focus:ring-1 focus:ring-[#d4af37]/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#10b981] hover:from-[#e5c158] hover:to-[#0d9f6e] border border-[#d4af37]/20 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <Fingerprint className="h-4 w-4 text-black" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="w-full py-2.5 mt-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors focus:outline-none"
                  disabled={isLoading}
                >
                  Already registered? Back to Login
                </button>
              </div>
            </motion.form>
          )}

          {mode === 'forgot' && (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleForgotSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5 select-text">
                <h3 className="text-sm font-extrabold text-white font-display">
                  Forgotten Security Passcode?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  No worries. Enter your registered email address below, and our Cloud Gate will dispatch a 6-digit OTP code to verify your identity.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-emerald-700" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. administrator@eduforge.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030e07]/60 border border-emerald-950/80 focus:border-[#d4af37] rounded-xl text-slate-200 text-xs outline-none select-text transition-all focus:ring-1 focus:ring-[#d4af37]/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="flex items-center gap-1.5 px-4 py-3 bg-[#030a05] hover:bg-[#06140b] border border-emerald-950 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 text-[#d4af37]" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-grow py-3 bg-gradient-to-r from-[#d4af37] to-[#10b981] text-black font-extrabold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>Dispatch OTP</span>
                      <KeyRound className="h-4 w-4 text-black" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}


        </AnimatePresence>
      </motion.div>
    </div>,
    document.body
  );
};
