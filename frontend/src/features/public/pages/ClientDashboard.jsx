import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantesApi as api } from '../../../shared/api/axios';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, MapPin, Search, ChefHat, Star, ArrowRight } from 'lucide-react';

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { restaurants, getRestaurants, loading } = useRestaurantStore();
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');

  useEffect(() => {
    getRestaurants();
  }, []);

  useEffect(() => {
    const uniqueCats = [...new Set(restaurants.map(r => r.category))].filter(Boolean);
    setCategories(uniqueCats);
  }, [restaurants]);

  const filteredRestaurants = activeTab === 'Todos' 
    ? restaurants 
    : restaurants.filter(r => r.category === activeTab);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter leading-[1.1] uppercase mb-4">
            ¿Qué se te antoja <span className="text-[#b98c52]">comer hoy?</span>
          </h1>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Experiencias gastronómicas exclusivas a un clic</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-[#dcc7a5]/70">
           <div className="text-right">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nivel de Socio</p>
              <p className="text-[#8b6435] font-black uppercase text-xs">Miembro Gourmet</p>
           </div>
           <div className="w-10 h-10 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
           </div>
        </div>
      </div>

      {/* Puntos VIP Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden bg-gradient-to-br from-[#d7b77f] to-[#b98c52] p-6 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-[rgba(185,140,82,0.18)]"
      >
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-16 md:w-20 h-16 md:h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20">
              <Trophy className="w-8 md:w-10 h-8 md:h-10 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-50 mb-2">Club VIP BuenProvecho</p>
              <h3 className="text-4xl font-black tracking-tight uppercase">Puntos Acumulados</h3>
            </div>
          </div>
          <div className="text-center md:text-right">
             <div className="flex items-center justify-center md:justify-end gap-3 text-6xl font-black">
               <Sparkles className="w-10 h-10 text-amber-50" />
               {user?.points || 0}
             </div>
             <p className="text-xs font-black text-amber-50 uppercase tracking-widest mt-2">Canjeable por Q{(user?.points || 0) * 0.5} en tu próxima cena</p>
          </div>
        </div>
      </motion.div>

      {/* Categorías (Filtros) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-2 md:px-0">
        {['Todos', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === cat 
                ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-lg shadow-[rgba(185,140,82,0.18)] border border-[#d7b77f]/50' 
                : 'bg-white/70 text-zinc-600 border border-[#dcc7a5] hover:border-[#b98c52]/30 hover:text-[#8b6435]'
            }`}
          >
            {cat === 'Todos' ? '🍽️ Todos' : cat}
          </button>
        ))}
      </div>

      {/* Grid de Restaurantes */}
      <div className="min-h-[300px] md:min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/70 rounded-[3rem] h-64 md:h-96 animate-pulse border border-[#dcc7a5]" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-24 bg-white/70 rounded-[3rem] border border-dashed border-[#dcc7a5]">
              <ChefHat className="w-16 h-16 text-[#d7b77f] mx-auto mb-6" />
              <h3 className="text-xl font-black text-zinc-900 uppercase">No hay opciones en esta categoría</h3>
              <p className="text-zinc-500 text-xs font-medium mt-2">Explora otras delicias o vuelve más tarde.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mt-8">
            <AnimatePresence>
              {filteredRestaurants.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/menu/${r.id}`)}
                  className="group relative bg-white/80 backdrop-blur-3xl rounded-[3rem] overflow-hidden border border-[#dcc7a5]/70 hover:border-[#b98c52]/30 transition-all cursor-pointer shadow-[0_30px_100px_rgba(110,80,45,0.14)]"
                >
                  <div className="h-48 md:h-56 relative overflow-hidden">
                    <img 
                      src={r.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={r.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2f2317]/75 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black text-[#8b6435] border border-[#dcc7a5] shadow-lg">
                      {r.rating || '4.5'} ⭐
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{r.name}</h3>
                      <span className="bg-[#f3e4ca] text-[#8b6435] border border-[#dcc7a5] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {r.category || 'Casual'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
                       <MapPin className="w-4 h-4 text-[#b98c52]" />
                       <span className="truncate">{r.address || 'Ubicación Premium'}</span>
                    </div>
                    
                    <button className="w-full py-3 md:py-4 bg-[#fffaf3] text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-gradient-to-r group-hover:from-[#d7b77f] group-hover:to-[#b98c52] group-hover:text-white transition-all flex items-center justify-center gap-3 border border-[#dcc7a5] group-hover:border-[#d7b77f]/30 group-hover:shadow-lg group-hover:shadow-[rgba(185,140,82,0.18)]">
                      Explorar Menú <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Banner Especial */}
      <div className="relative mt-12 md:mt-20 bg-white/80 border border-[#dcc7a5]/70 rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 text-zinc-900 overflow-hidden shadow-[0_30px_100px_rgba(110,80,45,0.14)]">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(215,183,127,0.24),transparent)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-[#f3e4ca] rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-[#dcc7a5]">
            <Search className="w-7 h-7 md:w-8 md:h-8 text-[#b98c52]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tighter uppercase max-w-2xl leading-[1.1]">Descubre sabores que <span className="text-[#b98c52]">marcan la diferencia</span></h2>
          <p className="text-zinc-500 font-bold text-sm md:text-lg uppercase tracking-widest max-w-xl">Promociones exclusivas para nuestra comunidad Gourmet.</p>
          <button className="mt-8 md:mt-10 px-8 md:px-12 py-4 md:py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl">
            Ver Ofertas ✨
          </button>
        </div>
      </div>
    </div>
  );
};
