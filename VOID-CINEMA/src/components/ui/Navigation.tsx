import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { Sector } from '../../store/useStore';
import { Compass, Ticket, Clock, User, Film } from 'lucide-react';

const navItems: { id: Sector; label: string; icon: React.ElementType<any> }[] = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'tickets', label: 'My Tickets', icon: Ticket },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'profile', label: 'Profile', icon: User },
];

const Navigation: React.FC = () => {
  const activeSector = useStore(state => state.activeSector);

  return (
    <nav className="glass-panel px-8 py-4 flex items-center gap-10 pointer-events-auto border-t-0 border-b-0 border-r border-l border-white/5 relative overflow-hidden">
      {/* Decorative top/bottom lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSector === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-3 text-sm uppercase tracking-[0.2em] relative py-1 gpu-accelerated"
            style={{
              color: isActive ? '#00f3ff' : 'rgba(107, 114, 128, 1)',
              fontWeight: isActive ? 700 : 400,
              transition: 'color var(--duration-normal) var(--ease-premium), transform var(--duration-normal) var(--ease-premium)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {/* Active background glow */}
            {isActive && (
              <motion.div
                layoutId="nav-active-glow"
                className="absolute -inset-x-3 -inset-y-2 rounded-lg"
                style={{
                  background: 'rgba(0, 243, 255, 0.06)',
                  boxShadow: '0 0 20px rgba(0, 243, 255, 0.08)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}

            {/* Icon */}
            {(() => {
              const IconComp = Icon as any;
              return (
                <IconComp
                  size={18}
                  className="relative z-[1] gpu-accelerated"
                  style={{
                    transition: 'transform var(--duration-normal) var(--ease-premium)',
                    transform: isActive ? 'rotate(8deg)' : 'rotate(0deg)',
                  }}
                />
              );
            })()}

            {/* Label */}
            <span className="relative z-[1]">{item.label}</span>

            {/* Active sliding underline indicator */}
            {isActive && (
              <motion.div
                layoutId="nav-active-underline"
                className="absolute -bottom-4 left-0 right-0 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #00f3ff, transparent)',
                  boxShadow: '0 0 8px rgba(0, 243, 255, 0.5)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}

            {/* Hover glow (non-active items only) */}
            {!isActive && (
              <div
                className="absolute -inset-x-3 -inset-y-2 rounded-lg opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  transition: 'opacity var(--duration-fast) var(--ease-premium)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
