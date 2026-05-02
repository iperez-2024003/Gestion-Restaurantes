import React from 'react';
import { TrendingUp } from 'lucide-react';

export const AnalyticsCard = ({ title, value, percentage, icon: Icon, chartData = [40, 60, 75, 45, 85, 65, 95] }) => {
  return (
    <div className="group relative flex w-full max-w-sm flex-col rounded-3xl bg-zinc-900/40 p-6 shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-purple-500/10 backdrop-blur-3xl">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest">{title}</h3>
              <p className="text-3xl font-black text-white mt-1">{value}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-500 uppercase tracking-wider border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {percentage}
          </span>
        </div>

        {/* Mini Chart Visualization */}
        <div className="mb-6 h-20 w-full overflow-hidden rounded-2xl bg-black/20 p-4 border border-zinc-800/50">
          <div className="flex h-full w-full items-end justify-between gap-2">
            {chartData.map((height, i) => (
              <div key={i} className="group/bar relative w-full h-full flex items-end">
                 <div 
                   style={{ height: `${height}%` }}
                   className="w-full rounded-full bg-purple-500/20 group-hover/bar:bg-purple-500/40 transition-all duration-300" 
                 />
                 <div 
                   style={{ height: `${height * 0.7}%` }}
                   className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-purple-600 to-indigo-600 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-500" 
                 />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Últimos 7 días</span>
          </div>
          <button className="px-4 py-2 bg-zinc-800/50 hover:bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-zinc-700/50 hover:border-purple-500 transition-all duration-300">
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
}
