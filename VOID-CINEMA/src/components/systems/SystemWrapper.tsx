import React from 'react';
import { motion } from 'framer-motion';

interface SystemWrapperProps {
  children: React.ReactNode;
  title: string;
}

const SystemWrapper: React.FC<SystemWrapperProps> = ({ children, title }) => {
  return (
    <motion.div
      className="w-full h-full p-12 flex flex-col pointer-events-auto"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {title && (
        <motion.h1
          className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white mb-8 tracking-[0.3em] uppercase opacity-90"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 0.9, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {title}
        </motion.h1>
      )}
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </motion.div>
  );
};

export default SystemWrapper;
