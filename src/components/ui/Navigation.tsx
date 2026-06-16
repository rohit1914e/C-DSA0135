import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Heart, Ticket, Clock, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Explore', icon: Compass },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/tickets', label: 'My Tickets', icon: Ticket },
  { path: '/history', label: 'History', icon: Clock },
  { path: '/profile', label: 'Profile', icon: User },
];

const Navigation: React.FC = () => {
  return (
    <nav className="glass-panel px-6 py-3 flex items-center gap-8 pointer-events-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? 'text-neon-cyan text-glow-cyan font-bold scale-110'
                  : 'text-gray-400 hover:text-white hover:scale-105'
              }`
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;
