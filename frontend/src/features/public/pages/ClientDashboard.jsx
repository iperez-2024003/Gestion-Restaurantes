import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axios';
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black text-white tracking-tighter leading-[1.1] uppercase mb-4">
            ¿Qué se te antoja <span className="text-purple-500">comer hoy?</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Experiencias gastronómicas exclusivas a un clic</p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/10">
           <div className="text-right">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nivel de Socio</p>
              <p className="text-purple-400 font-black uppercase text-xs">Miembro Gourmet</p>
           </div>
           <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
           </div>
        </div>
      </div>

      {/* Puntos VIP Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-800 p-10 rounded-[3rem] text-white shadow-2xl shadow-purple-500/10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-200 mb-2">Club VIP RestauManager</p>
              <h3 className="text-4xl font-black tracking-tight uppercase">Puntos Acumulados</h3>
            </div>
          </div>
          <div className="text-center md:text-right">
             <div className="flex items-center justify-center md:justify-end gap-3 text-6xl font-black">
               <Sparkles className="w-10 h-10 text-purple-200" />
               {user?.points || 0}
             </div>
             <p className="text-xs font-black text-purple-100 uppercase tracking-widest mt-2">Canjeable por Q{(user?.points || 0) * 0.5} en tu próxima cena</p>
          </div>
        </div>
      </motion.div>

      {/* Categorías (Filtros) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {['Todos', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === cat 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 border border-purple-500/50' 
                : 'bg-zinc-900/40 text-zinc-500 border border-zinc-800 hover:border-purple-500/30 hover:text-purple-400'
            }`}
          >
            {cat === 'Todos' ? '🍽️ Todos' : cat}
          </button>
        ))}
      </div>

      {/* Grid de Restaurantes */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900/20 rounded-[3rem] h-96 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
           <div className="text-center py-24 bg-zinc-900/20 rounded-[3rem] border border-dashed border-zinc-800">
              <ChefHat className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
              <h3 className="text-xl font-black text-white uppercase">No hay opciones en esta categoría</h3>
              <p className="text-zinc-500 text-xs font-medium mt-2">Explora otras delicias o vuelve más tarde.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
            <AnimatePresence>
              {filteredRestaurants.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/menu/${r.id}`)}
                  className="group relative bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] overflow-hidden border border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer shadow-2xl"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img 
                      src={r.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={r.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black text-purple-400 border border-purple-500/20 shadow-lg">
                      {r.rating || '4.5'} ⭐
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{r.name}</h3>
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {r.category || 'Casual'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
                       <MapPin className="w-4 h-4 text-purple-500" />
                       <span className="truncate">{r.address || 'Ubicación Premium'}</span>
                    </div>
                    
                    <button className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] group-hover:bg-purple-600 transition-all flex items-center justify-center gap-3 border border-zinc-700 group-hover:border-purple-500 group-hover:shadow-lg group-hover:shadow-purple-500/20">
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
      <div className="relative mt-20 bg-zinc-900 border border-purple-500/10 rounded-[4rem] p-16 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent)]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30">
            <Search className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase max-w-2xl leading-[1.1]">Descubre sabores que <span className="text-purple-500">marcan la diferencia</span></h2>
          <p className="text-zinc-500 font-bold text-lg uppercase tracking-widest max-w-xl">Promociones exclusivas para nuestra comunidad Gourmet.</p>
          <button className="mt-10 px-12 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl">
            Ver Ofertas ✨
          </button>
        </div>
      </div>
    </div>
  );
};
