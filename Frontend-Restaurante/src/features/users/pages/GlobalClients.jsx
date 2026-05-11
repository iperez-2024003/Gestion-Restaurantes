import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlobalVipClients } from '../../../shared/api/statistics';
import { 
  Users, 
  Star, 
  DollarSign, 
  Trophy, 
  Crown,
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';

export const GlobalClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getGlobalVipClients();
        setClients(res.data.data || []);
      } catch (error) {
        console.error('Error fetching VIP clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 md:py-48 gap-6 animate-pulse">
      <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#b98c52] animate-spin" />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Identificando Elite...</p>
    </div>
  );

  if (!clients || clients.length === 0) return (
    <div className="py-24 md:py-48 text-center bg-white/70 rounded-[4rem] border border-dashed border-[#dcc7a5] px-6">
      <Crown className="w-12 md:w-20 h-12 md:h-20 text-[#d7b77f] mx-auto mb-6 md:mb-8" />
      <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Sin Historial VIP</h3>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Los clientes con más actividad aparecerán aquí.</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-[1.1] mb-2">
           Clientes <span className="text-[#b98c52]">Elite</span>
        </h1>
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
           Análisis global de usuarios con mayor valor comercial
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dcc7a5]/70">
                <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Cliente</th>
                <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">Actividad</th>
                <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Inversión</th>
                <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dcc7a5]/50">
              <AnimatePresence>
                {clients.map((client, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="group hover:bg-[#f7efe1] transition-all"
                  >
                    <td className="p-4 md:p-8">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#f3e4ca] text-[#8b6435] rounded-2xl flex items-center justify-center font-black border border-[#dcc7a5]/70 group-hover:scale-110 transition-transform duration-500">
                          {(client.user?.username || client.user?.email || 'VIP').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-zinc-900 uppercase tracking-tight">{client.user?.username || 'Cliente VIP'}</p>
                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{client.user?.email || 'Sin email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-8 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3e4ca] text-[#8b6435] rounded-xl font-black text-[10px] uppercase tracking-widest">
                        <Star className="w-3.5 h-3.5" />
                        {client.total_orders} pedidos
                      </div>
                    </td>
                    <td className="p-4 md:p-8 text-right">
                      <p className="text-xl font-black text-zinc-900 tracking-tighter">Q{parseFloat(client.total_spent).toLocaleString()}</p>
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Total Gastado</p>
                    </td>
                    <td className="p-4 md:p-8 text-center">
                       {i < 3 ? (
                         <div className="flex items-center justify-center gap-2 text-[#b98c52]">
                           <Crown className="w-5 h-5" />
                           <span className="font-black text-[10px] uppercase tracking-[0.2em]">Global Elite</span>
                         </div>
                       ) : (
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Premium</span>
                       )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-gradient-to-br from-[#d7b77f] to-[#b98c52] p-6 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-[rgba(185,140,82,0.18)] relative overflow-hidden group"
         >
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Users className="w-16 md:w-24 h-16 md:h-24" />
           </div>
           <h4 className="text-5xl font-black mb-2 tracking-tighter">{clients.length}</h4>
           <p className="text-amber-50 font-black uppercase tracking-widest text-[10px]">Clientes VIP Activos</p>
         </motion.div>

         <motion.div 
           whileHover={{ y: -10 }}
           className="bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-[#dcc7a5]/70 text-zinc-900 shadow-[0_30px_100px_rgba(110,80,45,0.14)]"
         >
           <TrendingUp className="w-8 h-8 mb-6 text-[#b98c52]" />
           <h4 className="text-4xl font-black mb-2 tracking-tighter">
             {(clients.reduce((acc, c) => acc + parseInt(c.total_orders || 0, 10), 0) / (clients.length || 1)).toFixed(1)}
           </h4>
           <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Promedio de Pedidos</p>
         </motion.div>

         <motion.div 
           whileHover={{ y: -10 }}
           className="bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-[#dcc7a5]/70 text-zinc-900 shadow-[0_30px_100px_rgba(110,80,45,0.14)]"
         >
           <DollarSign className="w-8 h-8 mb-6 text-emerald-500" />
           <h4 className="text-4xl font-black mb-2 tracking-tighter">
             Q{(clients.reduce((acc, c) => acc + parseFloat(c.total_spent || 0), 0) / (clients.length || 1)).toLocaleString()}
           </h4>
           <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Inversión Media</p>
         </motion.div>
      </div>
    </div>
  );
};
