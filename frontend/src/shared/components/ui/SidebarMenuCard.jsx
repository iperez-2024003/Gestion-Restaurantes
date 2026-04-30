import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

export const SidebarMenuCard = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-zinc-900/40 backdrop-blur-3xl p-4 border border-purple-500/20 rounded-3xl shadow-2xl shadow-purple-500/5">
      <ul className="w-full flex flex-col gap-3">
        <li className="w-full">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-4 p-4 font-black rounded-2xl text-zinc-400 hover:bg-purple-500/10 hover:text-purple-400 focus:bg-gradient-to-r from-purple-600 to-indigo-600 focus:text-white transition-all duration-300 group"
          >
            <LayoutDashboard className="w-6 h-6 group-focus:text-white transition-colors" />
            <span className="uppercase tracking-widest text-[10px]">Panel General</span>
          </button>
        </li>
        <li className="w-full">
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="w-full flex items-center gap-4 p-4 font-black rounded-2xl text-zinc-400 hover:bg-purple-500/10 hover:text-purple-400 focus:bg-gradient-to-r from-purple-600 to-indigo-600 focus:text-white transition-all duration-300 group"
          >
            <Settings className="w-6 h-6 group-focus:text-white transition-colors" />
            <span className="uppercase tracking-widest text-[10px]">Configuración</span>
          </button>
        </li>
        <li className="w-full">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 font-black rounded-2xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-gradient-to-r from-red-600 to-pink-600 focus:text-white transition-all duration-300 group"
          >
            <LogOut className="w-6 h-6 group-focus:text-white transition-colors" />
            <span className="uppercase tracking-widest text-[10px]">Cerrar Sesión</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
