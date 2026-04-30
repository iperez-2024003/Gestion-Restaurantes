import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { RestaurantModal } from './RestaurantModal';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import { PlusCircle, Search, MapPin, Phone, Clock, Utensils, Star, Trash2, Edit3, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_LABELS = {
  casual: 'Casual', fine_dining: 'Fine Dining', fast_food: 'Comida Rápida',
  cafe: 'Café', bakery: 'Panadería', bar: 'Bar', food_truck: 'Food Truck',
  buffet: 'Buffet', family_style: 'Familiar', gourmet: 'Gourmet', other: 'Otro',
};

const CATEGORY_COLORS = {
  casual: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
  fine_dining: 'border-purple-500/20 text-purple-400 bg-purple-500/5',
  fast_food: 'border-orange-500/20 text-orange-400 bg-orange-500/5',
  cafe: 'border-amber-500/20 text-amber-400 bg-amber-500/5',
  bakery: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5',
  bar: 'border-red-500/20 text-red-400 bg-red-500/5',
  food_truck: 'border-green-500/20 text-green-400 bg-green-500/5',
  buffet: 'border-teal-500/20 text-teal-400 bg-teal-500/5',
  family_style: 'border-pink-500/20 text-pink-400 bg-pink-500/5',
  gourmet: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
  other: 'border-zinc-500/20 text-zinc-400 bg-zinc-500/5',
};

const VerifiedBadge = ({ verified }) =>
  verified ? (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
      <CheckCircle2 className="w-3 h-3" /> Verificado
    </div>
  ) : (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
      <Clock className="w-3 h-3" /> Pendiente
    </div>
  );

export const RestaurantsPage = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const { restaurants, loading, getRestaurants, deleteRestaurant, verifyRestaurant } = useRestaurantStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getRestaurants();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        r.cuisine_type?.toLowerCase().includes(q)
    );
  }, [restaurants, search]);

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedRestaurant(null);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}"?`)) return;
    setDeletingId(id);
    const result = await deleteRestaurant(id);
    setDeletingId(null);
    if (result.success) showSuccess('Restaurante eliminado');
    else showError(result.error);
  };

  const handleVerify = async (id, name) => {
    const result = await verifyRestaurant(id);
    if (result.success) showSuccess(`"${name}" verificado`);
    else showError(result.error);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] mb-2">
            Gestión de <span className="text-purple-500">Sedes</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            {restaurants.length} establecimientos registrados en la red
          </p>
        </div>
        {role === 'SUPER_ADMIN_ROLE' && (
          <ActionButton 
            label="Nuevo Restaurante" 
            icon={PlusCircle} 
            color="purple" 
            onClick={handleNew} 
          />
        )}
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Buscar sede, dirección o especialidad..."
          className="w-full pl-14 pr-6 py-5 bg-zinc-900/40 backdrop-blur-xl border border-purple-500/10 rounded-[2rem] text-white font-medium focus:outline-none focus:border-purple-500/40 focus:ring-4 focus:ring-purple-500/5 transition-all placeholder:text-zinc-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando Base de Datos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[4rem] border border-dashed border-zinc-800">
            <Utensils className="w-20 h-20 text-zinc-800 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sin Resultados</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">No se encontraron sedes con ese criterio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            <AnimatePresence>
              {filtered.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] overflow-hidden border border-purple-500/10 hover:border-purple-500/30 transition-all shadow-2xl"
                >
                  {/* Image/Cover */}
                  <div className="h-44 bg-zinc-800 relative overflow-hidden">
                    <img
                      src={r.cover_image_url || r.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-6 right-6">
                      <VerifiedBadge verified={r.is_verified} />
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight line-clamp-1">{r.name}</h2>
                      <span className="shrink-0 bg-purple-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                        {r.price_range}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className={`text-[9px] px-3 py-1 rounded-lg border font-black uppercase tracking-widest ${CATEGORY_COLORS[r.category] || 'border-zinc-800 text-zinc-500'}`}>
                        {CATEGORY_LABELS[r.category] || r.category}
                      </span>
                      {r.cuisine_type && (
                        <span className="text-[9px] px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest border border-zinc-700">
                          {r.cuisine_type}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-8">
                      <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-purple-500" /> <span className="truncate">{r.address || 'Ubicación Premium'}</span></div>
                      <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-purple-500" /> {r.phone || 'S/T'}</div>
                      <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-purple-500" /> {r.opening_time?.slice(0, 5)} - {r.closing_time?.slice(0, 5)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => navigate(`/dashboard/restaurants/${r.id}`)}
                        className="py-3 bg-zinc-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-all"
                      >
                        Resumen
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/restaurants/${r.id}/menu`)}
                        className="py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/10"
                      >
                        Menú
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(r)}
                        className="flex-1 py-3 bg-zinc-900/60 text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      {!r.is_verified && (
                        <button
                          onClick={() => handleVerify(r.id, r.name)}
                          className="flex-[2] py-3 bg-emerald-600/10 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          Verificar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id, r.name)}
                        disabled={deletingId === r.id}
                        className="flex-1 py-3 bg-red-600/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <RestaurantModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedRestaurant(null); }}
        restaurant={selectedRestaurant}
      />
    </div>
  );
};
