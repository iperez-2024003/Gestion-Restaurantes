import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { authApi, restaurantesApi as api } from '../../../shared/api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../../orders/store/useOrderStore';
import { CartDrawer } from '../../orders/components/CartDrawer';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { checkReservationAvailability, createReservation } from '../../../shared/api/reservations';
import { getTables } from '../../../shared/api/tables';
import { getRestaurantReviews } from '../../../shared/api/reviews';
import { showError, showSuccess } from '../../../shared/utils/toast';
import ScrollStack, { ScrollStackItem } from '../../../shared/components/ui/ScrollStack';
import { MenuFlipCard } from '../../../shared/components/ui/MenuFlipCard';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
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
  UtensilsCrossed,
  ArrowLeft,
  Home,
  Menu as MenuIcon
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
  const [reviewAuthors, setReviewAuthors] = useState({});

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
  const [reservationStep, setReservationStep] = useState(1); // 1: Info, 2: Table Selection, 3: Confirm
  const [occupiedTables, setOccupiedTables] = useState([]);
  const [tempAvailability, setTempAvailability] = useState(null);

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
      setOccupiedTables(response.data?.data?.occupied_tables || []);
      setTempAvailability(response.data?.data?.is_available);
      return response.data?.data;
    } catch (error) {
      setLocationSummary([]);
      setOccupiedTables([]);
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
        const date = new Date(`${reservationForm.reservation_date}T00:00:00`);
        const dayNameEn = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dayNameEs = date.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

        if (!restaurant.operating_days.includes(dayNameEn)) {
          showError(`Lo sentimos, este restaurante no atiende los días ${dayNameEs}`);
          return;
        }
      }
      const availabilityResponse = await checkAvailabilityData(reservationForm);
      // Ser extra permisivos con la respuesta del backend
      const isAvailable = availabilityResponse?.is_available || availabilityResponse?.available || false;
      
      if (!isAvailable) {
        showError('No hay cupo disponible para esta combinación de fecha, hora y personas.');
        return;
      }

      setReservationStep(2); // Ir al paso de selección de mesa
    } catch (error) {
      showError(error.response?.data?.message || 'Error al verificar disponibilidad');
    }
  };

  const finalizeReservation = async () => {
    try {
      if (!selectedTable) {
        showError('Por favor selecciona una mesa para continuar');
        return;
      }

      const response = await createReservation({
        restaurant_id,
        user_id: user?.id,
        customer_name: reservationForm.customer_name,
        customer_phone: reservationForm.customer_phone,
        customer_email: reservationForm.customer_email || undefined,
        reservation_date: reservationForm.reservation_date,
        reservation_time: reservationForm.reservation_time,
        party_size: Number(reservationForm.party_size),
        table_id: selectedTable.id,
        special_requests:
          [
            `Mesa seleccionada: #${selectedTable.table_number} (${selectedTable.location})`,
            reservationForm.special_requests || null,
          ]
            .filter(Boolean)
            .join(' | ') || undefined,
        table_preference: selectedTable.location,
      });

      showSuccess('¡Reservación solicitada con éxito! Te notificaremos al ser confirmada.');
      setReservationOpen(false);
      setReservationStep(1);
      setReservationForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        reservation_date: '',
        reservation_time: '19:00:00',
        party_size: 2,
        special_requests: '',
        table_preference: '',
      });
      setSelectedTable(null);
    } catch (error) {
      showError(error.response?.data?.message || 'No se pudo crear la reservación');
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

  useEffect(() => {
    const loadReviewAuthors = async () => {
      const uniqueUserIds = [...new Set(reviews.map((review) => review.user_id).filter(Boolean))];

      if (uniqueUserIds.length === 0) {
        setReviewAuthors({});
        return;
      }

      try {
        const results = await Promise.allSettled(
          uniqueUserIds.map(async (userId) => {
            const response = await authApi.post('/auth/profile/by-id', { userId });
            const profile = response.data?.data || {};
            return {
              userId,
              label: [profile.name, profile.surname].filter(Boolean).join(' ').trim() || profile.username || `Comensal ${String(userId).slice(-4)}`,
            };
          })
        );

        const nextAuthors = {};
        results.forEach((result, index) => {
          const userId = uniqueUserIds[index];
          if (result.status === 'fulfilled' && result.value?.label) {
            nextAuthors[userId] = result.value.label;
          }
        });

        setReviewAuthors(nextAuthors);
      } catch (error) {
        setReviewAuthors({});
      }
    };

    if (reviews.length > 0) {
      loadReviewAuthors();
    } else {
      setReviewAuthors({});
    }
  }, [reviews]);

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

  const featuredItems = items.slice(0, 3);
  const reviewAverage = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : Number(restaurant.rating || 4.9).toFixed(1);
  const reviewCount = reviews.length || restaurant.total_reviews || 0;

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
    <div className="min-h-screen bg-[#fcf8f2] pb-32 font-outfit selection:bg-[#d7b77f]/30">
      {/* ── STICKY NAV HEADER ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-[60] px-4 md:px-6 py-5 pointer-events-none">
        <div className="w-full flex items-center justify-between pointer-events-auto">
          <motion.button
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-3 px-6 py-3.5 bg-white/90 backdrop-blur-3xl border border-[#caa56d]/30 rounded-2xl shadow-[0_15px_40px_rgba(28,23,18,0.08)] text-[10px] font-black uppercase tracking-[0.3em] text-[#1c1712] transition-all hover:scale-105 hover:border-[#caa56d] active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 text-[#caa56d] group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </motion.button>

          <div className="flex items-center gap-3">
             <motion.button
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => window.location.href = '/dashboard/profile'}
              className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-3xl border border-[#caa56d]/30 rounded-2xl shadow-[0_15px_40px_rgba(28,23,18,0.08)] text-[#1c1712] transition-all hover:scale-105 hover:border-[#caa56d] active:scale-95"
            >
              <Users className="w-5 h-5 text-[#caa56d]" />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────────────── */}
      <div className="relative h-[65vh] md:h-[80vh] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.5, ease: [0.23, 1, 0.32, 1] }}
          src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80'}
          className="w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcf8f2] via-[#fcf8f2]/20 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.3),transparent_40%)]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="w-28 h-28 md:w-40 md:h-40 bg-white rounded-[3rem] p-1.5 shadow-[0_40px_100px_rgba(0,0,0,0.15)] mb-8 border border-[#dcc7a5] backdrop-blur-xl ring-8 ring-[#d7b77f]/5 overflow-hidden"
          >
            <img src={restaurant.logo_url} className="w-full h-full object-contain" alt="Logo" />
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center"
          >
            <p className="text-[10px] md:text-[12px] font-black text-[#caa56d] uppercase tracking-[0.6em] mb-4">Experiencia Exclusiva</p>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-[#1c1712] tracking-tighter uppercase leading-[0.85] mb-8">
              {restaurant.name.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-[#caa56d]" : ""}>{word} </span>
              ))}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="px-8 py-3.5 bg-white border border-[#caa56d]/30 rounded-2xl shadow-[0_15px_40px_rgba(28,23,18,0.06)] flex items-center gap-3">
              <div className="flex text-[#caa56d]">
                {[...Array(1)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-[11px] font-black text-[#1c1712] uppercase tracking-widest">{restaurant.rating || '4.9'} Score</span>
            </div>
            <div className="px-8 py-3.5 bg-[#1c1712] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex items-center gap-3 border border-[#caa56d]/20">
              <MapPin className="w-4 h-4 text-[#caa56d]" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest">{restaurant.category}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── CATEGORIES NAV ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#fcf8f2]/80 backdrop-blur-3xl border-b border-[#dcc7a5]/50 px-4 md:px-8 py-6 md:py-8 shadow-[0_20px_60px_rgba(110,80,45,0.05)]">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto scrollbar-hide px-2 md:px-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 transform active:scale-95 border ${!activeCategory
                ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-[0_20px_50px_rgba(185,140,82,0.15)] border-primary-300'
                : 'bg-white text-ink border-primary-200 hover:border-primary-400'
              }`}
          >
            🍽️ Ver Todo
          </button>
          {menus.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveCategory(m.id)}
              className={`px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 transform active:scale-95 border ${activeCategory === m.id
                  ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-[0_20px_50px_rgba(185,140,82,0.15)] border-primary-300'
                  : 'bg-white text-ink border-primary-200 hover:border-primary-400'
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
          className="bg-gradient-to-br from-[#d7b77f] to-[#b98c52] rounded-[3rem] md:rounded-[4rem] p-6 md:p-12 shadow-[0_30px_100px_rgba(185,140,82,0.2)] border border-primary-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 md:p-8 opacity-20">
            <Calendar className="w-20 h-20 md:w-32 md:h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
            <div>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-4 block">Reservas Exclusivas</span>
              <h2 className="text-4xl font-black text-ink tracking-tighter uppercase leading-[1.1]">Asegura tu <span className="text-white">Experiencia</span></h2>
              <p className="text-white mt-4 font-bold uppercase tracking-widest text-[10px]">Atención personalizada y las mejores ubicaciones garantizadas.</p>
            </div>
            <button
              onClick={() => setReservationOpen(true)}
              className="px-12 py-6 rounded-2xl bg-ink text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl border border-ink/50"
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
                  className="group relative bg-white rounded-[3rem] overflow-hidden border border-[#caa56d]/20 hover:border-[#caa56d]/50 transition-all duration-500 shadow-[0_30px_100px_rgba(28,23,18,0.06)] hover:shadow-[0_40px_120px_rgba(202,165,109,0.12)] hover:-translate-y-2"
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
                      <h3 className="text-3xl font-black text-[#1c1712] tracking-tight uppercase group-hover:text-[#caa56d] transition-colors">{item.name}</h3>
                    </div>

                    <p className="text-[11px] text-[#6b5e4e] font-bold uppercase tracking-widest leading-relaxed mb-8 line-clamp-3">
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
                          className="w-full py-5 bg-[#1c1712] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 hover:bg-[#2b2015] active:scale-[0.98] border border-[#caa56d]/30"
                        >
                          <ShoppingBag className="w-4 h-4" /> Añadir a la Orden
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

      {/* ── SIGNATURE DISHES ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-28">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-xl">
            <span className="text-[10px] font-black text-[#caa56d] uppercase tracking-[0.4em] mb-4 block">Selección del Chef</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-[#1c1712]">
              Sabores que <span className="text-[#caa56d]">Inspiran</span>
            </h2>
          </div>
          <div className="rounded-[2rem] border border-[#caa56d]/30 bg-white/50 backdrop-blur-xl px-8 py-6 text-right shadow-[0_20px_50px_rgba(28,23,18,0.05)]">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#caa56d]">Valoración promedio</p>
            <p className="mt-2 text-4xl font-black text-[#1c1712] leading-none">{reviewAverage}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#6b5e4e]">{reviewCount} reseñas</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {(featuredItems.length > 0 ? featuredItems : [
            {
              id: 'demo-f1', name: 'Tártara de la Casa', category: 'Entrada', price: 85, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80',
            },
            {
              id: 'demo-f2', name: 'Filete Premium', category: 'Fuerte', price: 145, image_url: 'https://images.unsplash.com/photo-1497644083578-611b798c60f0?auto=format&fit=crop&q=80',
            },
            {
              id: 'demo-f3', name: 'Postre Firmado', category: 'Postre', price: 58, image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80',
            },
          ]).map((item, index) => (
            <MenuFlipCard
              key={item.id || index}
              title={item.name}
              category={item.category || 'Especialidad'}
              price={`Q${item.price || item.average_price || 0}`}
              time={item.preparation_time || '20-30 min'}
              servings={item.portion_size || '1-2 pax'}
              image={item.image_url || item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'}
            />
          ))}
        </div>
      </div>

      {/* ── REVIEWS SECTION ─────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black text-[#caa56d] uppercase tracking-[0.4em] mb-4 block">Comunidad Gourmet</span>
            <h2 className="text-5xl md:text-7xl font-black text-[#1c1712] tracking-tighter uppercase leading-[0.85]">Ecos de <span className="text-[#caa56d]">Paladares</span></h2>
          </div>
          <div className="flex items-center gap-4 bg-white border border-[#caa56d]/30 px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(28,23,18,0.05)]">
            <span className="text-4xl font-black text-[#1c1712] leading-none">{reviewAverage}</span>
            <div className="flex text-[#caa56d]">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
            </div>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {reviews.map((rev, index) => {
              const reviewerLabel = reviewAuthors[rev.user_id] || rev.user?.Username || rev.user?.username || `Comensal ${index + 1}`;
              const reviewerInitial = reviewerLabel.charAt(0).toUpperCase();

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={rev.id}
                  className="bg-white/80 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] border border-primary-100 hover:border-primary-400 transition-all group shadow-sm hover:shadow-gold h-full flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-50 rounded-2xl flex items-center justify-center font-black text-primary-600 text-sm border border-primary-200">
                      {reviewerInitial}
                    </div>
                    <div>
                      <p className="text-sm font-black text-ink uppercase tracking-tight">{reviewerLabel}</p>
                      <div className="flex text-primary-500 scale-75 origin-left">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'opacity-20'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-brown font-bold italic leading-relaxed uppercase tracking-wider mt-auto">
                    "{rev.comment || 'Una experiencia memorable que vale la pena repetir.'}"
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[3rem] border border-dashed border-primary-200 bg-primary-50/30 p-10 md:p-16 text-center backdrop-blur-3xl mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-600 mb-4">Sin reseñas aún</p>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-ink">Sé el primero en dejar huella</h3>
            <p className="mt-4 text-muted-brown font-medium max-w-2xl mx-auto">
              Cuando aparezcan las primeras reseñas, esta sección se transformará en una vitrina viva de experiencia real.
            </p>
          </div>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────────────── */}
      <footer className="mt-48 px-8 py-24 bg-zinc-950 border-t border-[#dcc7a5]/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#b98c52] to-transparent opacity-20" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <ChefHat className="w-16 h-16 text-[#caa56d] mx-auto mb-10 opacity-20" />
          <span className="text-[#6b5e4e] text-[10px] font-black uppercase tracking-[0.5em] mb-6 block">Encuéntranos en</span>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">{restaurant.address}</h2>
          <p className="text-[#caa56d] font-black text-xl mb-16 tracking-widest">{restaurant.phone}</p>

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
            className="fixed bottom-12 right-12 w-20 h-20 bg-[#caa56d] text-[#1c1712] rounded-[2.5rem] shadow-[0_20px_60px_rgba(202,165,109,0.3)] flex items-center justify-center hover:scale-110 transition-all z-40 group border-4 border-[#1c1712]"
          >
            <ShoppingBag className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-2 -right-2 bg-white text-[#1c1712] text-[10px] font-black w-8 h-8 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#1c1712]">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-[#fefcf8] rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 border border-primary-200 shadow-gold relative overflow-hidden my-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
              
              <button 
                onClick={() => {
                  setReservationOpen(false);
                  setReservationStep(1);
                }} 
                className="absolute top-6 right-6 p-3 rounded-2xl bg-primary-100 text-primary-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Progress Stepper */}
              <div className="flex items-center gap-4 mb-12">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${reservationStep >= s ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-400'}`}>
                      {s}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${reservationStep >= s ? 'text-ink' : 'text-primary-300'}`}>
                      {s === 1 ? 'Información' : 'Selección de Mesa'}
                    </span>
                    {s === 1 && <div className="w-12 h-px bg-primary-100 mx-2"></div>}
                  </div>
                ))}
              </div>

              {reservationStep === 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-10">
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-3 block">Paso 01</span>
                    <h3 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">Tu <span className="text-primary-500 italic">Visita</span></h3>
                    <p className="text-muted-brown font-medium mt-4">Dinos cuándo planeas deleitarte con nosotros.</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); submitReservation(); }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input 
                        label="Nombre Completo" 
                        placeholder="Ejem: Juan Pérez"
                        value={reservationForm.customer_name}
                        onChange={(e) => handleReservationChange('customer_name', e.target.value)}
                        required
                      />
                      <Input 
                        label="Teléfono de Contacto" 
                        icon={Phone}
                        placeholder="+502 ...."
                        value={reservationForm.customer_phone}
                        onChange={(e) => handleReservationChange('customer_phone', e.target.value)}
                        required
                      />
                      <Input 
                        label="Fecha" 
                        type="date"
                        min={today}
                        value={reservationForm.reservation_date}
                        onChange={(e) => handleReservationChange('reservation_date', e.target.value)}
                        required
                      />
                      <Input 
                        label="Hora Preferida" 
                        type="time"
                        value={reservationForm.reservation_time.slice(0, 5)}
                        onChange={(e) => handleReservationChange('reservation_time', `${e.target.value}:00`)}
                        required
                      />
                      <Input 
                        label="Número de Personas" 
                        type="number"
                        min={1}
                        max={12}
                        icon={Users}
                        value={reservationForm.party_size}
                        onChange={(e) => handleReservationChange('party_size', e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button 
                        type="button"
                        variant="ghost" 
                        onClick={() => setReservationOpen(false)}
                        className="flex-1 py-5 rounded-3xl"
                      >
                        Cerrar
                      </Button>
                      <Button 
                        type="submit"
                        isLoading={availabilityLoading}
                        className="flex-1 py-5 rounded-3xl shadow-gold"
                      >
                        Ver Mesas Disponibles <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-3 block">Paso 02</span>
                      <h3 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">Elige tu <span className="text-primary-500 italic">Mesa</span></h3>
                      <p className="text-muted-brown font-medium mt-4">Selecciona el lugar perfecto para tu experiencia.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-100 border border-primary-200"></div>
                        <span className="text-[9px] font-black text-muted-brown uppercase tracking-widest">Libre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                        <span className="text-[9px] font-black text-muted-brown uppercase tracking-widest">Ocupada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-500 shadow-gold"></div>
                        <span className="text-[9px] font-black text-muted-brown uppercase tracking-widest">Tu Selección</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-[2.5rem] p-6 md:p-10 border border-primary-100 mb-10 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {/* Mapa de Mesas por Zonas */}
                    {['interior', 'terrace', 'vip', 'private'].map(zone => {
                      const zoneTables = restaurantTables.filter(t => (t.location || 'interior') === zone);
                      if (zoneTables.length === 0) return null;

                      const zoneLabels = {
                        interior: 'Interior',
                        terrace: 'Terraza',
                        vip: 'VIP',
                        private: 'Privado'
                      };

                      return (
                        <div key={zone} className="mb-8 last:mb-0">
                          <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                            <span>Zona {zoneLabels[zone] || zone}</span>
                            <div className="flex-1 h-px bg-primary-100"></div>
                          </h4>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {zoneTables.map(table => {
                              const isOccupied = occupiedTables.includes(table.id);
                              const isSelected = selectedTable?.id === table.id;
                              const isTooSmall = table.capacity < reservationForm.party_size;

                              return (
                                <button
                                  key={table.id}
                                  disabled={isOccupied || isTooSmall}
                                  onClick={() => setSelectedTable(table)}
                                  className={`
                                    relative group aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2
                                    ${isSelected 
                                      ? 'bg-primary-500 border-primary-600 text-white shadow-gold scale-110 z-10' 
                                      : isOccupied || isTooSmall
                                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-50' 
                                      : 'bg-white border-primary-100 text-ink hover:border-primary-400 hover:scale-105 shadow-sm'
                                    }
                                  `}
                                >
                                  <UtensilsCrossed size={16} className={isSelected ? 'text-white' : isOccupied ? 'text-zinc-300' : 'text-primary-300'} />
                                  <span className="text-[10px] font-black mt-1">#{table.table_number}</span>
                                  <div className={`text-[7px] font-bold uppercase ${isSelected ? 'text-white/80' : 'text-muted-brown'}`}>
                                    Cap: {table.capacity}
                                  </div>
                                  
                                  {/* Tooltip para mesas ocupadas */}
                                  {(isOccupied || isTooSmall) && (
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-white text-[8px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                      {isOccupied ? 'Ya reservada' : `Capacidad insuficiente (${table.capacity})`}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                    <button 
                      onClick={() => setReservationStep(1)}
                      className="flex items-center gap-2 text-muted-brown font-black uppercase tracking-widest text-[10px] hover:text-ink transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Cambiar horario o personas
                    </button>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                      <Button 
                        variant="ghost"
                        onClick={() => {
                          setReservationOpen(false);
                          setReservationStep(1);
                        }}
                        className="flex-1 md:px-10 py-5 rounded-3xl"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={finalizeReservation}
                        disabled={!selectedTable}
                        className="flex-1 md:px-16 py-5 rounded-3xl shadow-gold"
                      >
                        Confirmar #{selectedTable?.table_number || ''} ✨
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
