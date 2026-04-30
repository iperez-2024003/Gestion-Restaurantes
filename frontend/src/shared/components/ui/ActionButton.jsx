import React from 'react';

export const ActionButton = ({ label, icon: Icon, color = "purple", onClick }) => {
  const colorMap = {
    purple: "text-purple-400 group-hover:text-purple-300",
    blue: "text-blue-400 group-hover:text-blue-300",
    orange: "text-orange-400 group-hover:text-orange-300",
    cyan: "text-cyan-400 group-hover:text-cyan-300",
    yellow: "text-yellow-400 group-hover:text-yellow-300"
  };

  return (
    <button 
      onClick={onClick}
      className="cursor-pointer bg-zinc-900/40 backdrop-blur-3xl relative inline-flex items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ring-offset-black transition-all duration-300 border border-zinc-800/50 hover:border-purple-500/50 hover:bg-purple-500/10 h-12 px-6 group"
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${colorMap[color] || colorMap.purple}`} />
      <span className="text-zinc-400 group-hover:text-white transition-colors">{label}</span>
      
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
