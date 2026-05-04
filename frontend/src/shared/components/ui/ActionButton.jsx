import React from 'react';

export const ActionButton = ({ label, icon: Icon, color = "amber", onClick }) => {
  const colorMap = {
    amber: "text-[#b98c52] group-hover:text-[#8b6435]",
    blue: "text-blue-400 group-hover:text-blue-300",
    orange: "text-orange-400 group-hover:text-orange-300",
    cyan: "text-cyan-400 group-hover:text-cyan-300",
    yellow: "text-yellow-400 group-hover:text-yellow-300"
  };

  return (
    <button 
      onClick={onClick}
      className="cursor-pointer bg-white/80 backdrop-blur-3xl relative inline-flex items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ring-offset-black transition-all duration-300 border border-[#dcc7a5]/70 hover:border-[#b98c52]/50 hover:bg-[#f5ead8] h-10 md:h-12 px-4 md:px-6 group"
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${colorMap[color] || colorMap.amber}`} />
      <span className="text-zinc-400 group-hover:text-white transition-colors">{label}</span>
      
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-[#d7b77f]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
