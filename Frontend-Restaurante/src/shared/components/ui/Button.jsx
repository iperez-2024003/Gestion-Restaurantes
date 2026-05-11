import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-gold',
    secondary: 'bg-ink text-white hover:bg-black shadow-premium',
    ghost: 'bg-transparent text-muted-brown hover:bg-primary-100 border border-primary-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-2.5 rounded-xl font-bold transition-all duration-200
        flex items-center justify-center gap-2 disabled:opacity-50
        ${variants[variant]} ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};
