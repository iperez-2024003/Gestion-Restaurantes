import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, shadow: 'var(--shadow-gold)' } : {}}
      className={`
        bg-white/80 backdrop-blur-xl border border-primary-200/60
        rounded-[1.5rem] p-6 shadow-premium
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
