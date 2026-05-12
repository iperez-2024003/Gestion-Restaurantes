import React from 'react';

export const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-brown group-focus-within:text-[#b98c52] transition-colors" />
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-11' : 'px-4'} py-3 rounded-xl
            bg-[#fffdf9] border border-[#dcc7a5] text-ink text-sm font-medium
            placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/20 focus:border-[#b98c52]
            transition-all duration-200
            ${errorMessage ? 'border-red-500 bg-red-50 text-red-950 placeholder:text-red-400' : ''}
          `}
          {...props}
        />
      </div>
      {errorMessage && <span className="text-xs font-semibold text-red-600 ml-1">{errorMessage}</span>}
    </div>
  );
};
