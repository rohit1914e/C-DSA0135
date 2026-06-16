import React from 'react';
import SystemWrapper from './SystemWrapper';

const FavoritesSystem: React.FC = () => {
  return (
    <SystemWrapper title="Favorites">
      <div className="glass-panel p-8 w-1/3 min-w-[400px]">
        <h2 className="text-xl text-neon-purple font-bold mb-4 tracking-wider">SAVED SIGNATURES</h2>
        <p className="text-gray-300 leading-relaxed">
          No favorites saved yet. Explore the universe to find your next cinematic experience.
        </p>
      </div>
    </SystemWrapper>
  );
};

export default FavoritesSystem;
