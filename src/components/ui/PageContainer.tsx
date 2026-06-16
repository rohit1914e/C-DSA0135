import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, title }) => {
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
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white mb-8 tracking-widest uppercase">
        {title}
      </h1>
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
