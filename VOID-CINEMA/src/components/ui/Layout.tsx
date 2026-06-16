import React from 'react';
import Navigation from './Navigation';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const { session, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  // Fallback for guest
  const userProfile = useStore(state => state.userProfile);

  const displayUsername = profile?.username || userProfile.name;
  const displayMemberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : userProfile.memberSince;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full pointer-events-none z-50 flex flex-col">
      {/* Top Bar Navigation */}
      <header className="w-full p-6 flex justify-between items-center pointer-events-auto z-50 backdrop-blur-xl bg-black/35 border-b border-white/10 shadow-lg">
        <div 
          className="text-3xl font-black tracking-[0.2em] text-glow-cyan text-white cursor-pointer select-none"
          onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
        >
          VOID <span className="text-neon-cyan">CINEMA</span>
        </div>
        
        <Navigation />
        
        <div className="flex items-center gap-6 pointer-events-auto">
          {session ? (
            <>
              <div className="text-right hidden md:block cursor-pointer" onClick={() => document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' })}>
                <div className="text-sm font-bold text-white tracking-widest">{displayUsername}</div>
                <div className="text-xs text-neon-purple tracking-widest uppercase">Member {displayMemberSince}</div>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full glass-panel-neon flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors border-2 border-neon-cyan relative group overflow-hidden"
                  onClick={() => document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="absolute inset-0 bg-neon-cyan/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                  <span className="text-neon-cyan font-black tracking-widest z-10">{displayUsername.substring(0,2).toUpperCase()}</span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
                  title="Disconnect"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-6 py-2 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors uppercase tracking-widest text-xs font-bold rounded-sm"
            >
              <UserIcon size={16} />
              Access Node
            </button>
          )}
        </div>
      </header>
      
      {/* Cinematic Borders */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none -z-10"></div>
      
      {/* Scanline overlay for aesthetic (fixed to viewport) */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] pointer-events-none mix-blend-overlay z-[999] opacity-30"></div>
    </div>
  );
};

export default Layout;
