import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SystemWrapper from './SystemWrapper';

const premiumEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const ExploreSystem: React.FC = () => {
  const handleEnterClick = () => {
    const moviesSection = document.getElementById('movies');
    if (moviesSection) {
      moviesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Description lines for staggered reveal
  const descriptionLines = [
    'Experience a new generation of intelligent movie ticket booking.',
    'Discover movies, reserve seats, and manage bookings effortlessly.',
    'Built to deliver a seamless, futuristic, and immersive cinema experience.',
    'Navigate through a premium interface designed for speed and convenience.',
  ];

  return (
    <SystemWrapper title="">
      {/* Giant Decorative Background Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute w-full flex justify-center pointer-events-none select-none z-0"
        style={{ top: '140px' }}
      >
        <h1 className="text-[clamp(4rem,10vw,12rem)] font-black uppercase tracking-[0.15em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00f3ff]">
          VOID CINEMA
        </h1>
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-start pt-[120px] md:pt-[160px] pb-8 pointer-events-none z-10 px-4 md:px-6 overflow-y-auto custom-scrollbar">

        {/* Soft Radial Hero Spotlight */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none -z-10"
          style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.08), transparent 60%)' }}
        />

        {/* Main Content Group */}
        <div className="flex flex-col items-center text-center w-full max-w-4xl relative z-10">

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
            className="text-lg md:text-2xl font-mono text-neon-purple tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(191,0,255,0.8)]"
            style={{ marginTop: '24px' }}
          >
            Your Smart Ticket Booking Assistant
          </motion.h2>

          {/* Description – line by line reveal */}
          <div
            className="text-gray-400 font-mono text-sm md:text-base leading-relaxed tracking-wide space-y-2 max-w-2xl mx-auto"
            style={{ marginTop: '32px' }}
          >
            {descriptionLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + i * 0.15,
                  ease: premiumEase,
                }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          {/* Enter Button CTA – spotlight on scroll approach */}
          <motion.div
            className="pointer-events-auto"
            style={{ marginTop: '48px' }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: premiumEase }}
          >
            <motion.button
              onClick={handleEnterClick}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-4 px-10 py-5 rounded-full bg-black/40 backdrop-blur-xl border border-neon-cyan/50 overflow-hidden gpu-accelerated"
              style={{
                boxShadow: '0 0 30px rgba(0,243,255,0.2)',
              }}
              variants={{
                hover: {
                  scale: 1.05,
                  boxShadow: '0 0 50px rgba(0,243,255,0.6), inset 0 0 20px rgba(191,0,255,0.3)',
                  borderColor: 'rgba(191,0,255,0.8)'
                }
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Ripple Effect Background */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-neon-cyan/0 via-neon-cyan/10 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-premium" />

              <span className="relative z-10 text-white font-black tracking-[0.3em] uppercase text-sm md:text-base">
                ENTER VOID CINEMA
              </span>

              <motion.span
                className="relative z-10 text-neon-cyan group-hover:text-neon-purple"
                style={{ transition: 'color var(--duration-normal) var(--ease-premium)' }}
                variants={{
                  hover: { x: 5 }
                }}
              >
                <ArrowRight size={24} strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          </motion.div>
          {/* Developer Credits - Polished Hierarchy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="flex flex-col items-center pointer-events-none select-none"
            style={{ 
              marginTop: '24px', 
              gap: '12px' 
            }}
          >
            <div 
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5em',
                opacity: 0.45,
                color: 'white'
              }}
            >
              CRAFTED BY
            </div>
            
            <div 
              style={{
                color: '#00E5FF',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                textAlign: 'center',
                textShadow: '0 0 10px rgba(0,229,255,.35), 0 0 20px rgba(0,229,255,.21)',
                position: 'relative',
                zIndex: 10
              }}
            >
              ROHIT • GRACE JOHNSON • JAGAN
            </div>
          </motion.div>

        </div>
      </div>
    </SystemWrapper>
  );
};

export default ExploreSystem;
