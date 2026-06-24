import React from 'react';
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
    <nav className="glass-panel px-8 py-4 flex items-center gap-12 pointer-events-auto border-t-0 border-b-0 border-r border-l border-white/5 relative overflow-hidden">
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent"></div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSector === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`group flex items-center gap-3 text-sm uppercase tracking-[0.2em] transition-all duration-500 relative ${
              isActive
                ? 'text-neon-cyan text-glow-cyan font-bold scale-105'
                : 'text-gray-500 hover:text-white hover:scale-105'
            }`}
          >
            {/* @ts-ignore */}
            <Icon size={20} className={`transition-transform duration-500 ${isActive ? 'rotate-12' : 'group-hover:rotate-12'}`} />
            <span>{item.label}</span>
            
            {/* Active Indicator Underline */}
            {isActive && (
              <div className="absolute -bottom-5 left-0 w-full h-[2px] bg-neon-cyan text-glow-cyan blur-[1px]"></div>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
