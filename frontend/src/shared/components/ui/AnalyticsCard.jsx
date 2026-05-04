import React from 'react';
import { TrendingUp } from 'lucide-react';

export const AnalyticsCard = ({ title, value, percentage, icon: Icon, chartData = [40, 60, 75, 45, 85, 65, 95] }) => {
  return (
    <div className="group relative flex w-full max-w-full md:max-w-sm flex-col rounded-3xl bg-white/80 p-4 md:p-6 shadow-[0_30px_100px_rgba(110,80,45,0.14)] transition-all duration-500 hover:scale-[1.02] border border-[#dcc7a5]/70 backdrop-blur-3xl">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d7b77f]/10 via-transparent to-[#b98c52]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d7b77f] to-[#b98c52] shadow-lg shadow-[rgba(185,140,82,0.18)]">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#8b6435] uppercase tracking-widest">{title}</h3>
              <p className="text-3xl font-black text-zinc-900 mt-1">{value}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-500 uppercase tracking-wider border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {percentage}
          </span>
        </div>

        {/* Mini Chart Visualization */}
        <div className="mb-6 h-20 w-full overflow-hidden rounded-2xl bg-[#fffaf3] p-4 border border-[#dcc7a5]">
          <div className="flex h-16 w-full items-end justify-between gap-2">
            {chartData.map((height, i) => (
              <div key={i} className="group/bar relative flex-1 h-full flex items-end">
                 <div 
                   style={{ height: `${height}%` }}
                   className="w-full rounded-full bg-[#d7b77f]/30 group-hover/bar:bg-[#b98c52]/45 transition-all duration-300" 
                 />
                 <div 
                   style={{ height: `${height * 0.7}%` }}
                   className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-[#d7b77f] to-[#b98c52] shadow-[0_0_10px_rgba(185,140,82,0.22)] transition-all duration-500" 
                 />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#b98c52]" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Últimos 7 días</span>
          </div>
          <button className="px-4 py-2 bg-[#fffaf3] hover:bg-gradient-to-r hover:from-[#d7b77f] hover:to-[#b98c52] hover:text-white text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-[#dcc7a5] hover:border-[#d7b77f]/30 transition-all duration-300">
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
