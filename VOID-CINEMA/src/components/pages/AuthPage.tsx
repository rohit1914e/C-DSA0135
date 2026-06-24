import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, AlertCircle, Loader, Film, Ticket, Sparkles } from 'lucide-react';
import { useToast } from '../ui/Toast';

// ── Particle background (CSS-only, lightweight) ──
const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 3 === 0
              ? 'rgba(0, 243, 255, 0.4)'
              : p.id % 3 === 1
                ? 'rgba(191, 0, 255, 0.3)'
                : 'rgba(255, 255, 255, 0.15)',
            animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

// ── Floating cinematic icon ──
const FloatingIcon: React.FC<{
  icon: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ icon, className = '', delay = 0 }) => (
  <motion.div
    className={`absolute opacity-[0.08] ${className}`}
    animate={{
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    {icon}
  </motion.div>
);

// ── Animated floating label input ──
const FloatingInput: React.FC<{
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  minLength?: number;
}> = ({ id, type, value, onChange, label, icon, required, minLength }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative group">
      {/* Glow outline on focus */}
      <div
        className="absolute -inset-[1px] rounded-lg opacity-0 transition-opacity"
        style={{
          opacity: isFocused ? 1 : 0,
          background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.3), rgba(191, 0, 255, 0.2))',
          filter: 'blur(4px)',
          transitionDuration: 'var(--duration-normal)',
          transitionTimingFunction: 'var(--ease-premium)',
        }}
      />

      <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-lg overflow-hidden transition-premium hover:border-white/[0.15]"
        style={{
          borderColor: isFocused ? 'rgba(0, 243, 255, 0.4)' : undefined,
        }}
      >
        {/* Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-premium"
          style={{ color: isFocused ? '#00f3ff' : 'rgba(255,255,255,0.25)' }}
        >
          {icon}
        </div>

        {/* Floating label */}
        <label
          htmlFor={id}
          className="absolute left-12 transition-all pointer-events-none font-mono tracking-wider"
          style={{
            top: isActive ? '8px' : '50%',
            transform: isActive ? 'translateY(0)' : 'translateY(-50%)',
            fontSize: isActive ? '9px' : '13px',
            color: isActive ? '#00f3ff' : 'rgba(255,255,255,0.3)',
            letterSpacing: isActive ? '0.15em' : '0.08em',
            textTransform: 'uppercase' as const,
            transitionDuration: 'var(--duration-normal)',
            transitionTimingFunction: 'var(--ease-premium)',
          }}
        >
          {label}
        </label>

        {/* Input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent px-12 text-white font-mono text-sm focus:outline-none relative z-[1]"
          style={{
            paddingTop: '22px',
            paddingBottom: '10px',
          }}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'username'}
        />
      </div>
    </div>
  );
};

// ── Main AuthPage Component ──
const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const from = location.state?.from?.pathname || '/';

  // ── Auth handler (PRESERVED – identical logic) ──
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setShowSuccess(true);
        showToast('Successfully logged in', 'success');
        setTimeout(() => navigate(from, { replace: true }), 1200);

      } else {
        // Register
        if (!username.trim()) {
          throw new Error('Username is required');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
            }
          }
        });

        if (error) throw error;

        // Note: The Supabase trigger we wrote in the implementation plan
        // will automatically handle inserting into the `profiles` table
        // using the raw_user_meta_data.username we just passed.

        showToast('Registration successful! Initializing session...', 'success');

        // If Supabase didn't automatically establish the session, force login
        if (!data.session) {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (loginError) throw loginError;
        }

        setShowSuccess(true);
        setTimeout(() => navigate(from, { replace: true }), 1200);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error on mode toggle
  useEffect(() => {
    setError(null);
  }, [isLogin]);

  // ── Premium easing ──
  const premiumEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="relative z-10 w-full min-h-screen flex pointer-events-auto overflow-hidden">

      {/* ════════════════════════════════════════
          LEFT PANEL – Cinematic Branding
         ════════════════════════════════════════ */}
      <div className="hidden lg:flex w-[58%] relative items-center justify-center overflow-hidden">

        {/* Deep background */}
        <div className="absolute inset-0 bg-gradient-to-br from-void-black via-deep-navy to-deep-space" />

        {/* Radial spotlight */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 243, 255, 0.06) 0%, rgba(191, 0, 255, 0.03) 40%, transparent 70%)',
          }}
        />

        {/* Particle field */}
        <ParticleField />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating cinematic icons */}
        <FloatingIcon icon={<Film size={80} />} className="top-[15%] left-[10%]" delay={0} />
        <FloatingIcon icon={<Ticket size={64} />} className="bottom-[20%] right-[15%]" delay={2} />
        <FloatingIcon icon={<Sparkles size={48} />} className="top-[60%] left-[20%]" delay={4} />
        <FloatingIcon icon={<Film size={40} />} className="top-[25%] right-[20%]" delay={1} />

        {/* Main branding content */}
        <div className="relative z-10 max-w-lg px-12">
          {/* VOID CINEMA title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: premiumEase }}
          >
            <h1 className="text-7xl font-black uppercase tracking-[0.15em] leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/60">
                VOID
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00c4cc] text-glow-cyan-intense">
                CINEMA
              </span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: premiumEase }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-gradient-to-r from-neon-cyan to-transparent" />
              <span className="text-[10px] font-mono tracking-[0.4em] text-neon-cyan/70 uppercase">
                System v2.0
              </span>
            </div>
            <p className="text-xl font-display tracking-[0.15em] text-white/80 uppercase">
              Your Smart Ticket Booking Assistant
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: premiumEase }}
            className="mt-6 text-sm font-mono text-white/30 leading-relaxed tracking-wide"
          >
            Reserve seats. Generate digital tickets.
            <br />
            Experience the future of cinema.
          </motion.p>

          {/* Status line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: premiumEase }}
            className="mt-10 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-white/30 uppercase">
              System Online • Secure Connection
            </span>
          </motion.div>
        </div>

        {/* Vertical separator */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />
      </div>

      {/* ════════════════════════════════════════
          RIGHT PANEL – Authentication Card
         ════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-10 min-h-screen">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-deep-space via-void-black to-deep-navy lg:bg-gradient-to-bl" />

        {/* Subtle radial accent */}
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(191, 0, 255, 0.04), transparent 60%)',
          }}
        />

        {/* Auth Card */}
        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: premiumEase }}
        >
          {/* Card border glow wrapper */}
          <div className="relative">
            {/* Breathing glow behind the card */}
            <div
              className="absolute -inset-[1px] rounded-2xl animate-breathe-glow opacity-60"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.15), rgba(191, 0, 255, 0.1), rgba(0, 243, 255, 0.15))',
                backgroundSize: '200% 200%',
                animation: 'border-trace 6s ease infinite, breathe-glow 4s ease-in-out infinite',
                filter: 'blur(1px)',
              }}
            />

            {/* Main card */}
            <div className="relative glass-panel-deep p-8 md:p-10">

              {/* Top accent line */}
              <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

              {/* Header */}
              <div className="text-center mb-8">
                {/* Mobile-only branding */}
                <div className="lg:hidden mb-6">
                  <h1 className="text-3xl font-black tracking-[0.15em] text-white uppercase">
                    VOID <span className="text-neon-cyan text-glow-cyan">CINEMA</span>
                  </h1>
                </div>

                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: premiumEase }}
                >
                  <h2 className="text-2xl font-black tracking-[0.2em] text-white uppercase">
                    {isLogin ? 'Access Terminal' : 'Register Node'}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-4 h-[1px] bg-neon-cyan/40" />
                    <p className="text-[10px] font-mono text-white/30 tracking-[0.3em] uppercase">
                      {isLogin ? 'Identity Verification Required' : 'Create Digital Identity'}
                    </p>
                    <div className="w-4 h-[1px] bg-neon-cyan/40" />
                  </div>
                </motion.div>
              </div>

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3, ease: premiumEase }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-4 bg-red-500/[0.07] border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                      <p className="text-red-400/90 text-xs font-mono tracking-wide leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 rounded-2xl bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-16 h-16 rounded-full border-2 border-neon-cyan/50 flex items-center justify-center"
                      style={{ boxShadow: 'var(--glow-cyan)' }}
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-neon-cyan"
                      >
                        <Sparkles size={28} />
                      </motion.div>
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-mono tracking-[0.3em] text-neon-cyan uppercase">
                        Initializing Session
                      </p>
                      <div className="mt-3 w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form ref={formRef} onSubmit={handleAuth} className="space-y-5">
                {/* Username (Register only) */}
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: premiumEase }}
                      className="overflow-hidden"
                    >
                      <FloatingInput
                        id="auth-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Username"
                        icon={<User size={16} />}
                        required={!isLogin}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <FloatingInput
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email Address"
                  icon={<Mail size={16} />}
                  required
                />

                {/* Password */}
                <FloatingInput
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label="Password"
                  icon={<Lock size={16} />}
                  required
                  minLength={6}
                />

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || showSuccess}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full relative overflow-hidden py-4 mt-6 rounded-lg font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-premium group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.12), rgba(191, 0, 255, 0.08))',
                    border: '1px solid rgba(0, 243, 255, 0.3)',
                    color: '#00f3ff',
                    boxShadow: '0 0 20px rgba(0, 243, 255, 0.1)',
                  }}
                >
                  {/* Light sweep effect */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                      animation: 'light-sweep 2s ease-in-out infinite',
                    }}
                  />

                  {isLoading ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span className="relative z-[1]">
                        {isLogin ? 'Initialize Session' : 'Create Profile'}
                      </span>
                      <motion.span
                        className="relative z-[1] text-[10px] font-mono tracking-wider text-white/30"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ▸
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-[11px] font-mono text-white/30 hover:text-neon-cyan tracking-[0.15em] uppercase relative group py-1"
                  style={{
                    transition: 'color var(--duration-normal) var(--ease-premium)',
                  }}
                >
                  {isLogin ? 'Need an identity? Register here' : 'Already registered? Authenticate here'}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-neon-cyan/40 group-hover:w-full"
                    style={{
                      transition: 'width var(--duration-normal) var(--ease-premium)',
                    }}
                  />
                </button>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
