import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './Navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const { session, profile, user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  let displayUsername = 'GUEST';
  if (user) {
    if (user.user_metadata?.username) {
      displayUsername = user.user_metadata.username;
    } else if (user.email) {
      displayUsername = user.email.split('@')[0];
    }
  }

  const createdDateStr = user?.created_at || profile?.created_at;
  const displayMemberSince = createdDateStr ? new Date(createdDateStr).getFullYear() : '2026';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Scroll-aware transparency (throttled to avoid frame drops)
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return (
    <div className="fixed top-0 left-0 w-full pointer-events-none z-50 flex flex-col">
      {/* Top Bar Navigation */}
      <header
        className="w-full p-6 flex justify-between items-center pointer-events-auto z-50 border-b gpu-accelerated"
        style={{
          backdropFilter: isScrolled ? 'blur(20px) saturate(1.2)' : 'blur(12px)',
          backgroundColor: isScrolled ? 'rgba(5, 5, 16, 0.85)' : 'rgba(0, 0, 0, 0.35)',
          borderColor: isScrolled ? 'rgba(0, 243, 255, 0.08)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.5)' : 'none',
          transition: 'background-color var(--duration-slow) var(--ease-premium), border-color var(--duration-slow) var(--ease-premium), box-shadow var(--duration-slow) var(--ease-premium), backdrop-filter var(--duration-slow) var(--ease-premium)',
        }}
      >
        {/* Logo */}
        <div
          className="text-3xl font-black tracking-[0.2em] text-white cursor-pointer select-none group gpu-accelerated"
          onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
          style={{
            transition: 'transform var(--duration-normal) var(--ease-premium)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          VOID <span className="text-neon-cyan text-glow-cyan">CINEMA</span>
        </div>

        <Navigation />

        <div className="flex items-center gap-6 pointer-events-auto">
          {session ? (
            <>
              <div
                className="text-right hidden md:block cursor-pointer"
                onClick={() => document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="text-sm font-bold text-white tracking-widest">{displayUsername}</div>
                <div className="text-xs text-neon-purple tracking-widest uppercase">Member {displayMemberSince}</div>
              </div>
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer relative group overflow-hidden gpu-accelerated"
                  onClick={() => document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(0, 243, 255, 0.4)',
                    boxShadow: '0 0 15px rgba(0, 243, 255, 0.1)',
                    transition: 'border-color var(--duration-normal) var(--ease-premium), box-shadow var(--duration-normal) var(--ease-premium), transform var(--duration-normal) var(--ease-premium)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.7)';
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 243, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span className="text-neon-cyan font-black tracking-widest z-10 text-sm">
                    {displayUsername.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full flex items-center justify-center gpu-accelerated"
                  title="Disconnect"
                  style={{
                    color: 'rgba(239, 68, 68, 0.7)',
                    transition: 'background-color var(--duration-fast) var(--ease-premium), color var(--duration-fast) var(--ease-premium), transform var(--duration-fast) var(--ease-premium)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = 'rgba(239, 68, 68, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-6 py-2 text-neon-cyan uppercase tracking-widest text-xs font-bold rounded-sm gpu-accelerated"
              style={{
                border: '1px solid rgba(0, 243, 255, 0.3)',
                transition: 'all var(--duration-normal) var(--ease-premium)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00f3ff';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.borderColor = '#00f3ff';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#00f3ff';
                e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <UserIcon size={16} />
              Access Node
            </button>
          )}
        </div>
      </header>

      {/* Cinematic Borders */}
      <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none -z-10" />

      {/* Scanline overlay for aesthetic (fixed to viewport) */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] pointer-events-none mix-blend-overlay z-[999] opacity-30" />
    </div>
  );
};

export default Layout;
