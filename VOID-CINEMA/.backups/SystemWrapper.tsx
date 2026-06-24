import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SystemWrapperProps {
  children: React.ReactNode;
  title: string;
}

const SystemWrapper: React.FC<SystemWrapperProps> = ({ children, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full p-12 flex flex-col pointer-events-auto">
      {title && (
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white mb-8 tracking-[0.3em] uppercase opacity-90">
          {title}
        </h1>
      )}
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
};

export default SystemWrapper;
