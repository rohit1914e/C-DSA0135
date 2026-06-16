import React from 'react';
import Navigation from './Navigation';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-full w-full flex flex-col pointer-events-none">
      {/* Top Bar Navigation */}
      <header className="w-full p-6 flex justify-between items-center pointer-events-auto z-50">
        <div className="text-2xl font-bold tracking-widest text-glow-cyan text-white">
          VOID <span className="text-neon-cyan">CINEMA</span>
        </div>
        <Navigation />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full glass-panel-neon flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <span className="text-neon-cyan font-bold">U1</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full h-full relative overflow-hidden pointer-events-none">
        {children}
      </main>
      
      {/* Cinematic Borders */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black to-transparent pointer-events-none z-40"></div>
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none z-40"></div>
    </div>
  );
};

export default Layout;
