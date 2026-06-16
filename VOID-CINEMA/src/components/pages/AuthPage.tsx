import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '../ui/Toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname || '/';

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
        
        showToast('Successfully logged in', 'success');
        navigate(from, { replace: true });
        
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

        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen flex items-center justify-center pt-20 pb-10 px-4 pointer-events-auto">
      <motion.div 
        className="w-full max-w-md glass-panel p-8 border border-white/10 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            {isLogin ? 'Access Node' : 'Register Node'}
          </h2>
          <p className="text-gray-400 font-mono mt-2 tracking-widest text-xs uppercase">
            {isLogin ? 'Authenticate to continue' : 'Create your digital identity'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-red-400 text-xs font-mono tracking-wide">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-mono tracking-widest text-neon-cyan uppercase">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-10 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan transition-colors"
                  placeholder="cyber_punk_99"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono tracking-widest text-neon-cyan uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded px-10 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan transition-colors"
                placeholder="agent@void.cinema"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono tracking-widest text-neon-cyan uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded px-10 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 border border-neon-cyan text-neon-cyan hover:text-white transition-colors uppercase tracking-[0.3em] font-bold text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              isLogin ? 'Initialize Session' : 'Create Profile'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs font-mono text-gray-400 hover:text-white tracking-widest transition-colors uppercase border-b border-transparent hover:border-white/30 pb-1"
          >
            {isLogin ? 'Need an identity? Register here' : 'Already registered? Authenticate here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
