import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SystemWrapper from './SystemWrapper';

const ExploreSystem: React.FC = () => {
  const handleEnterClick = () => {
    const moviesSection = document.getElementById('movies');
    if (moviesSection) {
      moviesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SystemWrapper title="">
      <div className="absolute inset-0 flex flex-col items-center justify-start md:justify-center pt-[120px] md:pt-16 pb-8 pointer-events-none z-10 px-4 md:px-6 overflow-y-auto custom-scrollbar">
        
        {/* Soft Radial Hero Spotlight for separation */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none -z-10"
          style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.08), transparent 60%)' }}
        ></div>

        {/* Main Content Group */}
        <div className="flex flex-col items-center text-center w-full max-w-4xl mt-4 md:mt-[60px]">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            {/* Background intense glow */}
            <div className="absolute inset-0 bg-neon-cyan/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h1 className="text-[clamp(3rem,6.5vw,7rem)] font-black uppercase tracking-[0.15em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-[#e0ffff] to-[#00f3ff] drop-shadow-[0_0_30px_rgba(0,243,255,0.6)]">
              VOID CINEMA
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            className="text-lg md:text-2xl font-mono text-neon-purple tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(191,0,255,0.8)]"
            style={{ marginTop: '24px' }}
          >
            Your Smart Ticket Booking Assistant
          </motion.h2>

          {/* Description Paragraph */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-gray-400 font-mono text-sm md:text-base leading-relaxed tracking-wide space-y-2 max-w-2xl mx-auto"
            style={{ marginTop: '32px' }}
          >
            <p>Experience a new generation of intelligent movie ticket booking.</p>
            <p>Discover movies, reserve seats, and manage bookings effortlessly.</p>
            <p>Built to deliver a seamless, futuristic, and immersive cinema experience.</p>
            <p>Navigate through a premium interface designed for speed and convenience.</p>
          </motion.div>

          {/* Enter Button CTA */}
          <motion.div 
            className="pointer-events-auto"
            style={{ marginTop: '48px' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5, type: 'spring' }}
          >
            <motion.button
              onClick={handleEnterClick}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-4 px-10 py-5 rounded-full bg-black/40 backdrop-blur-xl border border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.2)] overflow-hidden transition-all duration-300"
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
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-neon-cyan/0 via-neon-cyan/10 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              
              <span className="relative z-10 text-white font-black tracking-[0.3em] uppercase text-sm md:text-base">
                ENTER VOID CINEMA
              </span>
              
              <motion.span
                className="relative z-10 text-neon-cyan group-hover:text-neon-purple transition-colors duration-300"
                variants={{
                  hover: { x: 5 }
                }}
              >
                <ArrowRight size={24} strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Developer Credits */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="text-center"
            style={{ marginTop: '56px' }}
          >
            <p className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-gray-500 uppercase mb-2">
              Crafted by
            </p>
            <p className="text-xs md:text-sm font-mono tracking-[0.2em] text-neon-cyan/80 drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
              Rohit <span className="text-gray-600 mx-2">•</span> Grace <span className="text-gray-600 mx-2">•</span> Jagan
            </p>
          </motion.div>

        </div>
      </div>
    </SystemWrapper>
  );
};

export default ExploreSystem;
