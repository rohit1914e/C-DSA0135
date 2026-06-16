import React from 'react';
import SystemWrapper from './SystemWrapper';

const HistorySystem: React.FC = () => {
  return (
    <SystemWrapper title="History">
      <div className="glass-panel p-8 w-1/3 min-w-[400px]">
        <h2 className="text-xl text-gray-300 font-bold mb-4 tracking-wider">PAST JOURNEYS</h2>
        <p className="text-gray-400 leading-relaxed">
          Access your archival records.
        </p>
      </div>
    </SystemWrapper>
  );
};

export default HistorySystem;
