import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, MapPin, Search, ChefHat, Star, ArrowRight } from 'lucide-react';
import Card from '../../../shared/components/ui/Card';
import UnifiedButton from '../../../shared/components/ui/UnifiedButton';
import EmptyState from '../../../shared/components/states/EmptyState';
import LoadingSpinner from '../../../shared/components/states/LoadingSpinner';
import { typography } from '../../../shared/constants/uiConstants';

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
          <UnifiedButton
            key={cat}
            variant={activeTab === cat ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(cat)}
          >
            {cat === 'Todos' ? '🍽️ Todos' : cat}
          </UnifiedButton>
        ))}
      </div>

      {/* Grid de Restaurantes */}
      <div className="min-h-[300px] md:min-h-[400px]">
        {loading ? (
          <LoadingSpinner text="Cargando restaurantes..." />
        ) : filteredRestaurants.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No hay opciones en esta categoría"
            description="Explora otras delicias o vuelve más tarde."
            variant="info"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8"
          >
            <AnimatePresence>
              {filteredRestaurants.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    hoverable
                    variant="elevated"
                    padding="md"
                    onClick={() => navigate(`/menu/${r.id}`)}
                    className="h-full cursor-pointer"
                  >
                    {/* Imagen */}
                    <div className="h-48 md:h-56 -m-4 mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={r.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={r.name}
                      />
                    </div>

                    {/* Contenido */}
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 style={typography.h4} className="text-zinc-900 uppercase flex-1">
                          {r.name}
                        </h3>
                        <span className="bg-amber-50 text-amber-900 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest whitespace-nowrap ml-2">
                          {r.rating || '4.5'} ⭐
                        </span>
                      </div>
                      
                      <p style={typography.bodySmall} className="text-gray-500 mb-3">
                        {r.category || 'Casual'}
                      </p>

                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin size={14} className="text-amber-600 flex-shrink-0" />
                        <span style={typography.caption} className="truncate">
                          {r.address || 'Ubicación Premium'}
                        </span>
                      </div>

                      <UnifiedButton
                        variant="primary"
                        size="sm"
                        icon={ArrowRight}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/menu/${r.id}`);
                        }}
                        className="w-full"
                      >
                        Explorar Menú
                      </UnifiedButton>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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
          <UnifiedButton
            variant="secondary"
            size="md"
            className="mt-8 md:mt-10"
            onClick={() => navigate('/menu')}
          >
            Ver Ofertas ✨
          </UnifiedButton>
        </div>
      </div>
    </div>
  );
};
