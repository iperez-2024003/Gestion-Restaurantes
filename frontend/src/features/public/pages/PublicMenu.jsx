import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { restaurantesApi as api } from '../../../shared/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../../orders/store/useOrderStore';
import { CartDrawer } from '../../orders/components/CartDrawer';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { checkReservationAvailability, createReservation } from '../../../shared/api/reservations';
import { getTables } from '../../../shared/api/tables';
import { getRestaurantReviews } from '../../../shared/api/reviews';
import { showError, showSuccess } from '../../../shared/utils/toast';
import {
  ShoppingBag,
  Users,
  Calendar,
  Star,
  MapPin,
  Phone,
  ChevronRight,
  ChefHat,
  Clock,
  Sparkles,
  Zap,
  X,
  Info,
  UtensilsCrossed
} from 'lucide-react';

export const PublicMenu = () => {
  const { restaurant_id } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');

  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [reviews, setReviews] = useState([]);

  const { cart, addToCart } = useOrderStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemNotes, setItemNotes] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '19:00:00',
    party_size: 2,
    special_requests: '',
    table_preference: '',
  });
  const { user } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [locationSummary, setLocationSummary] = useState([]);
  const [restaurantTables, setRestaurantTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleQuantityChange = (itemId, delta) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = itemQuantities[item.id] || 1;
    const notes = itemNotes[item.id] || '';

    addToCart({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      notes
    }, restaurant_id);

    setItemQuantities(prev => ({ ...prev, [item.id]: 1 }));
    setItemNotes(prev => ({ ...prev, [item.id]: '' }));
    showSuccess(`${item.name} añadido a tu orden`);
  };

  const handleReservationChange = (field, value) => {
    setReservationForm((prev) => ({ ...prev, [field]: value }));
  };

  const checkAvailabilityData = async (payload) => {
    try {
      setAvailabilityLoading(true);
      const response = await checkReservationAvailability({
        restaurant_id,
        reservation_date: payload.reservation_date,
        reservation_time: payload.reservation_time,
        party_size: Number(payload.party_size),
      });
      setLocationSummary(response.data?.location_summary || []);
      return response.data?.availability;
    } catch (error) {
      setLocationSummary([]);
      throw error;
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const submitReservation = async () => {
    try {
      if (!reservationForm.customer_name || !reservationForm.customer_phone || !reservationForm.reservation_date) {
        showError('Completa nombre, teléfono y fecha');
        return;
      }
      if (!/^[\d\s+\-()]{8,20}$/.test(reservationForm.customer_phone)) {
        showError('Ingresa un teléfono válido');
        return;
      }
      if (reservationForm.reservation_date < today) {
        showError('La fecha no puede ser anterior a hoy');
        return;
      }

      if (restaurant?.operating_days?.length) {
        const dayName = new Date(`${reservationForm.reservation_date}T00:00:00`)
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase();
        if (!restaurant.operating_days.includes(dayName)) {
          showError(`Este restaurante no atiende los ${dayName}`);
          return;
        }
      }

      const availability = await checkAvailabilityData(reservationForm);
      if (!availability?.is_available) {
        showError('No hay cupo para esa fecha y hora');
        return;
      }

      await createReservation({
        restaurant_id,
        user_id: user?.id,
        customer_name: reservationForm.customer_name,
        customer_phone: reservationForm.customer_phone,
        customer_email: reservationForm.customer_email || undefined,
        reservation_date: reservationForm.reservation_date,
        reservation_time: reservationForm.reservation_time,
        party_size: Number(reservationForm.party_size),
        special_requests:
          [
            selectedTable ? `Mesa sugerida: #${selectedTable.table_number}` : null,
            reservationForm.special_requests || null,
          ]
            .filter(Boolean)
            .join(' | ') || undefined,
        table_preference: reservationForm.table_preference || undefined,
      });

      showSuccess('Reservación solicitada. Te notificaremos al confirmar.');
      setReservationOpen(false);
      setReservationForm((prev) => ({
        ...prev,
        special_requests: '',
        table_preference: '',
      }));
      setSelectedTable(null);
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'No se pudo crear la reservación';
      showError(backendMessage);
    }
  };

  useEffect(() => {
    if (!reservationOpen || !reservationForm.reservation_date || !reservationForm.reservation_time) return;
    const timeoutId = setTimeout(() => {
      checkAvailabilityData(reservationForm).catch(() => { });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [
    reservationOpen,
    reservationForm.reservation_date,
    reservationForm.reservation_time,
    reservationForm.party_size,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resRest, resTables, resReviews] = await Promise.all([
          api.get(`/restaurants/${restaurant_id}`),
          getTables(restaurant_id, { limit: 200 }),
          getRestaurantReviews(restaurant_id)
        ]);
        setRestaurant(resRest.data.data); // Backend returns 'data'
        setRestaurantTables(resTables.data?.data || []);
        setReviews(resReviews.data?.reviews || []);

        const resMenus = await api.get(`/menus`, { params: { restaurant_id } });
        // Backend returns { success: true, data: [...] }
        const menuData = resMenus.data.data || resMenus.data.menus || [];
        const sortedMenus = (Array.isArray(menuData) ? menuData : []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setMenus(sortedMenus);

        const resItems = await api.get(`/menus/items/all`, { params: { restaurant_id } });
        // Backend returns { success: true, data: [...] }
        const itemsData = resItems.data.data || resItems.data.items || [];
        setItems(Array.isArray(itemsData) ? itemsData : []);

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (restaurant_id) fetchData();
  }, [restaurant_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-outfit p-4">
        <div className="relative">
          <div className="w-14 h-14 md:w-20 md:h-20 border-4 border-[#d7b77f]/20 border-t-[#d7b77f] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-[#b98c52]" />
          </div>
        </div>
        <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] mt-6 animate-pulse">Preparando Experiencia...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-black font-outfit">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 md:mb-8 border border-zinc-800">
          <Zap className="w-12 h-12 md:w-16 md:h-16 text-zinc-800" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">No Disponible</h2>
        <p className="text-zinc-500 mt-4 max-w-sm font-medium">Este restaurante no se encuentra activo en nuestra red gourmet en este momento.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-10 px-10 py-4 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black rounded-2xl shadow-2xl shadow-[rgba(185,140,82,0.2)] uppercase tracking-widest text-xs"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const categoryItems = activeCategory
    ? items.filter(item => item.menu_id === activeCategory)
    : items;

  const zoneLabelMap = {
    terrace: 'Terraza',
    interior: 'Interior',
    vip: 'VIP',
    bar: 'Barra',
    window: 'Ventana',
    private: 'Privado',
  };

  const sections = [
    { id: 'left', title: 'Ala Oeste', zones: ['terrace', 'window'] },
    { id: 'center', title: 'Salón Central', zones: ['interior', 'bar'] },
    { id: 'right', title: 'Zona Privada', zones: ['vip', 'private'] },
  ];

  const zoneData = (zoneId) => locationSummary.find((zone) => zone.location === zoneId);

  const getZoneTables = (zoneId) => {
    const tables = restaurantTables
      .filter((table) => table.location === zoneId && table.is_active !== false)
      .sort((a, b) => a.table_number - b.table_number);

    const reservedCount = locationSummary.find(z => z.location === zoneId)?.reserved_count || 0;

    return tables.map((table, index) => {
      const blockedByStatus = ['occupied', 'reserved', 'cleaning'].includes(table.status);
      const blockedByTimeWindow = index < reservedCount;
      const canFitParty = table.capacity >= Number(reservationForm.party_size || 1);
      let visualState = 'libre';
      if (blockedByStatus || blockedByTimeWindow) visualState = 'ocupada';
      if (!canFitParty && visualState === 'libre') visualState = 'capacidad_insuficiente';

      return {
        ...table,
        visualState,
        selectable: visualState === 'libre',
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#fffaf3] pb-32 font-outfit selection:bg-[#d7b77f]/30">
      {/* ── HERO SECTION ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80'}
          className="w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-8">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-24 h-24 md:w-32 md:h-32 bg-[#fffaf3] rounded-[2.5rem] p-1 shadow-2xl mb-6 md:mb-8 border border-[#dcc7a5] backdrop-blur-xl ring-8 ring-[#d7b77f]/5 overflow-hidden"
          >
            <img src={restaurant.logo_url} className="w-full h-full object-contain" alt="Logo" />
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter text-center uppercase leading-[0.9]"
          >
            {restaurant.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-4"
          >
            <span className="px-6 py-2 bg-[#d7b77f]/20 backdrop-blur-md border border-[#dcc7a5] rounded-full text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em]">
              {restaurant.category}
            </span>
            {tableNumber && (
              <span className="px-6 py-2 bg-emerald-600 rounded-full text-[10px] font-black text-white uppercase tracking-[0.4em] shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Mesa {tableNumber}
              </span>
            )}
            <span className="px-6 py-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <Star className="w-3 h-3 text-[#b98c52]" /> {restaurant.rating || '4.9'} Gourmet
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── CATEGORIES NAV ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#fffaf3]/80 backdrop-blur-3xl border-b border-[#dcc7a5] px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-6xl mx-auto flex gap-6 overflow-x-auto scrollbar-hide px-2 md:px-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 transform active:scale-95 border ${!activeCategory
                ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-2xl shadow-[rgba(185,140,82,0.2)] border-[#b98c52]'
                : 'bg-[#fffaf3]/60 text-zinc-900 border-[#dcc7a5] hover:border-[#d7b77f]/30'
              }`}
          >
            ✨ Toda la Carta
          </button>
          {menus.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveCategory(m.id)}
              className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 transform active:scale-95 border ${activeCategory === m.id
                  ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-2xl shadow-[rgba(185,140,82,0.2)] border-[#b98c52]'
                  : 'bg-[#fffaf3]/60 text-zinc-900 border-[#dcc7a5] hover:border-[#d7b77f]/30'
                }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-zinc-900 to-[#1a1a1a] rounded-[3rem] md:rounded-[4rem] p-6 md:p-12 shadow-2xl border border-[#dcc7a5]/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5">
            <Calendar className="w-20 h-20 md:w-32 md:h-32 text-[#b98c52]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
            <div>
              <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-4 block">Reservas Exclusivas</span>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-[1.1]">Asegura tu <span className="text-zinc-600">Experiencia</span></h2>
              <p className="text-zinc-500 mt-4 font-bold uppercase tracking-widest text-[10px]">Atención personalizada y las mejores ubicaciones garantizadas.</p>
            </div>
            <button
              onClick={() => setReservationOpen(true)}
              className="px-12 py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Reservar Mesa ✨
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── MENU CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory || 'all'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12"
          >
            {categoryItems.length > 0 ? (
              categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fffaf3]/70 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden border border-[#dcc7a5]/30 hover:border-[#d7b77f]/50 transition-all duration-500 group shadow-2xl relative"
                >
                  <div className="relative h-56 md:h-72 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                        <ChefHat className="w-16 h-16 text-zinc-800" />
                      </div>
                    )}
                    <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl border border-[#dcc7a5]/20">
                      <span className="font-black text-white text-xl">Q{item.price}</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-3xl font-black text-zinc-900 tracking-tight uppercase group-hover:text-[#b98c52] transition-colors">{item.name}</h3>
                    </div>

                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-8 line-clamp-3">
                      {item.description || 'Una obra maestra culinaria preparada con ingredientes de la más alta calidad para su deleite.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-10">
                      {item.is_vegetarian && (
                        <span className="px-4 py-1.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black tracking-widest uppercase">Veggie</span>
                      )}
                      {!item.is_available && (
                        <span className="px-4 py-1.5 bg-red-500/5 text-red-400 border border-red-500/20 rounded-full text-[9px] font-black tracking-widest uppercase italic">No Disponible</span>
                      )}
                    </div>

                    {item.is_available && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-black/40 rounded-3xl p-2 border border-zinc-900">
                          <input
                            type="text"
                            placeholder="Instrucciones especiales..."
                            value={itemNotes[item.id] || ''}
                            onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="flex-1 bg-transparent border-none text-[10px] font-bold text-zinc-400 placeholder:text-zinc-800 focus:ring-0 px-4"
                          />
                          <div className="flex bg-zinc-900 rounded-2xl items-center p-1 border border-zinc-800">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-10 h-10 text-white hover:text-[#b98c52] font-black text-lg transition-colors"
                            >-</button>
                            <span className="w-10 text-center font-black text-sm text-white">{itemQuantities[item.id] || 1}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-10 h-10 text-white hover:text-[#b98c52] font-black text-lg transition-colors"
                            >+</button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full py-5 bg-[#fffaf3]/80 text-zinc-900 font-black rounded-[1.5rem] text-[10px] uppercase tracking-[0.4em] hover:bg-gradient-to-r hover:from-[#d7b77f] hover:to-[#b98c52] hover:text-white transition-all border border-[#dcc7a5] hover:border-[#b98c52] shadow-2xl flex items-center justify-center gap-3"
                        >
                          <ShoppingBag className="w-4 h-4" /> Añadir Orden
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-zinc-900/20 rounded-[4rem] border border-dashed border-zinc-800">
                <p className="text-zinc-800 font-black text-4xl uppercase tracking-tighter italic">Carta en Preparación</p>
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] mt-4">Nuestros chefs están diseñando nuevos sabores para ti.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── REVIEWS SECTION ─────────────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 md:gap-8">
            <div>
              <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-4 block">Comunidad Gourmet</span>
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">Reseñas de <span className="text-zinc-600">Comensales</span></h2>
            </div>
            <div className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-[#dcc7a5]/10">
              <span className="text-4xl font-black text-white leading-none">{restaurant.rating || '4.9'}</span>
              <div className="flex text-[#b98c52]">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={rev.id}
                className="bg-[#fffaf3]/60 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-[#dcc7a5]/30 hover:border-[#d7b77f]/50 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d7b77f]/20 rounded-2xl flex items-center justify-center font-black text-[#b98c52] text-sm border border-[#dcc7a5]">
                    {(rev.user?.Username || rev.user?.username || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{rev.user?.Username || rev.user?.username || 'Gourmet'}</p>
                    <div className="flex text-[#b98c52] scale-75 origin-left">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 font-bold italic leading-relaxed uppercase tracking-wider">
                  "{rev.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────────────── */}
      <footer className="mt-48 px-8 py-24 bg-zinc-950 border-t border-[#dcc7a5]/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#b98c52] to-transparent opacity-20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <ChefHat className="w-16 h-16 text-[#b98c52] mx-auto mb-10 opacity-20" />
          <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">Encuéntranos en</span>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">{restaurant.address}</h2>
          <p className="text-[#b98c52] font-black text-xl mb-16 tracking-widest">{restaurant.phone}</p>

          <div className="pt-8 md:pt-16 border-t border-zinc-900 flex flex-col items-center gap-6 md:gap-8">
            <div className="flex gap-6 md:gap-12">
              <span className="text-zinc-500 hover:text-[#b98c52] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest">Instagram</span>
              <span className="text-zinc-500 hover:text-[#b98c52] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest">Facebook</span>
            </div>
            <p className="text-zinc-800 text-[9px] font-black tracking-[0.6em] uppercase">Powered by BuenProvecho Premium OS</p>
          </div>
        </div>
      </footer>

      {/* Botón flotante del carrito */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 20 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-12 right-12 w-20 h-20 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white rounded-[2.5rem] shadow-2xl shadow-[rgba(185,140,82,0.2)] flex items-center justify-center hover:to-[#a97d45] transition-all z-40 group border-4 border-black ring-8 ring-[#b98c52]/10"
          >
            <ShoppingBag className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black w-8 h-8 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-black">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurantId={restaurant_id}
        tableNumber={tableNumber}
      />

      {/* MODAL DE RESERVACIÓN */}
      <AnimatePresence>
        {reservationOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 font-outfit overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-zinc-950 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 border border-[#dcc7a5]/20 shadow-2xl relative"
            >
              <button onClick={() => setReservationOpen(false)} className="absolute top-8 right-8 p-3 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all border border-zinc-800">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-10">
                <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-2 block">Reserva tu mesa</span>
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Alta de <span className="text-zinc-600">Evento</span></h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Nombre</label>
                  <input
                    value={reservationForm.customer_name}
                    onChange={(e) => handleReservationChange('customer_name', e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#d7b77f] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Teléfono</label>
                  <input
                    value={reservationForm.customer_phone}
                    onChange={(e) => handleReservationChange('customer_phone', e.target.value)}
                    placeholder="+502 ..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#d7b77f] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Fecha</label>
                  <input
                    type="date"
                    min={today}
                    value={reservationForm.reservation_date}
                    onChange={(e) => handleReservationChange('reservation_date', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#d7b77f] outline-none transition-all color-scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Hora</label>
                  <input
                    type="time"
                    value={reservationForm.reservation_time.slice(0, 5)}
                    onChange={(e) => handleReservationChange('reservation_time', `${e.target.value}:00`)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#d7b77f] outline-none transition-all color-scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Personas</label>
                  <input
                    type="number"
                    min={1}
                    value={reservationForm.party_size}
                    onChange={(e) => handleReservationChange('party_size', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#d7b77f] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">Preferencia de Zona</label>
                  <select
                    value={reservationForm.table_preference}
                    onChange={(e) => handleReservationChange('table_preference', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-[#d7b77f] outline-none transition-all appearance-none"
                  >
                    <option value="">Cualquier zona</option>
                    <option value="interior">Interior</option>
                    <option value="terrace">Terraza</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setReservationOpen(false)}
                  className="flex-1 py-6 rounded-[2rem] border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitReservation}
                  className="flex-1 py-6 rounded-[2rem] bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-widest text-xs hover:to-[#a97d45] transition-all shadow-2xl shadow-[rgba(185,140,82,0.2)]"
                >
                  Confirmar Reserva ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
