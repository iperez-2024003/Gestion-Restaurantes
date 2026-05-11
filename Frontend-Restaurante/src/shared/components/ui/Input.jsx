import React from 'react';

export const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-brown ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-brown group-focus-within:text-primary-500 transition-colors" />
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-11' : 'px-4'} py-3 rounded-xl
            bg-white border border-primary-200 text-ink text-sm
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500
            transition-all duration-200
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};
