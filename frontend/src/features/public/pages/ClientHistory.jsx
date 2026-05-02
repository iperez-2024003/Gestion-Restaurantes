import { useEffect, useMemo, useState } from 'react';
import { getOrders } from '../../../shared/api/orders';
import { getReservations } from '../../../shared/api/reservations';
import { createReview } from '../../../shared/api/reviews';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { translateStatus } from '../../../shared/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Star, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  X, 
  Zap,
  Loader2,
  Trophy
} from 'lucide-react';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onChange(star)}
        className={`text-3xl transition-all hover:scale-125 ${value >= star ? 'text-purple-500' : 'text-zinc-800'}`}
      >
        <Star className={`w-8 h-8 ${value >= star ? 'fill-current' : ''}`} />
      </button>
    ))}
  </div>
);

export const ClientHistory = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [reservationFilter, setReservationFilter] = useState('all');
  const [reviewedOrders, setReviewedOrders] = useState([]);

  const statusClass = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    preparing: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    ready: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    served: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    confirmed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    completed: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
    no_show: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
  };

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [ordersResponse, reservationsResponse] = await Promise.all([
        getOrders({ user_id: user.id, limit: 100 }),
        getReservations({ user_id: user.id, limit: 100 }),
      ]);
      setOrders(ordersResponse.data?.data || []);
      setReservations(reservationsResponse.data?.data || []);
    } catch (error) {
      showError('No se pudo sincronizar tu historial premium');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const completedOrders = useMemo(
    () => orders.filter((order) => ['served', 'paid'].includes(order.status)),
    [orders]
  );
  
  const filteredOrders = useMemo(
    () => (orderFilter === 'all' ? orders : orders.filter((order) => order.status === orderFilter)),
    [orders, orderFilter]
  );
  
  const filteredReservations = useMemo(
    () =>
      reservationFilter === 'all'
        ? reservations
        : reservations.filter((reservation) => reservation.status === reservationFilter),
    [reservations, reservationFilter]
  );

  const submitReview = async () => {
    try {
      if (!reviewModal.order?.restaurant_id) return;
      await createReview({
        restaurant_id: reviewModal.order.restaurant_id,
        rating,
        comment: comment.trim(),
      });
      showSuccess('Tu opinión ha sido registrada en el Club Gourmet');
      setReviewedOrders((prev) => [...prev, reviewModal.order.id]);
      setReviewModal({ open: false, order: null });
      setRating(5);
      setComment('');
    } catch (error) {
      showError('Error al procesar la reseña');
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando Bitácora...</p>
      </div>
    );
  }

  const labelClass = "text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 mb-2 block";
  const filterBtn = (active, label, onClick) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
        active 
        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
        : 'bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:text-purple-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-12 font-outfit animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-[3rem] p-10 shadow-2xl border border-purple-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <History className="w-32 h-32 text-purple-500" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-purple-500 mb-2">Pasaporte Gastronómico</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Tu <span className="text-zinc-600">Bitácora</span></h1>
          <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">Revive tus mejores momentos y gestiona tus experiencias pasadas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Pedidos */}
        <section>
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-purple-500" /> Pedidos
            </h2>
            <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
              {orders.length} Totales
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6 px-2">
            {['all', 'pending', 'served', 'paid', 'cancelled'].map((status) => (
              filterBtn(orderFilter === status, status === 'all' ? 'Todos' : translateStatus(status), () => setOrderFilter(status))
            ))}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredOrders.map((order) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={order.id} 
                className="bg-zinc-900/40 backdrop-blur-3xl border border-purple-500/5 rounded-[2rem] p-6 hover:border-purple-500/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Orden de Servicio</p>
                    <p className="font-black text-white text-lg">#{order.order_number?.split('-').pop()}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusClass[order.status] || 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                    {translateStatus(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <p className="text-sm font-black text-purple-400">Q{order.total}</p>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{order.created_at?.slice(0, 10)}</p>
                </div>
              </motion.div>
            ))}
            {orders.length === 0 && (
              <div className="bg-zinc-900/20 rounded-[2.5rem] p-16 text-center border border-dashed border-zinc-800">
                 <ShoppingBag className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                 <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Sin órdenes registradas</p>
              </div>
            )}
          </div>
        </section>

        {/* Reservaciones */}
        <section>
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-500" /> Reservas
            </h2>
            <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
              {reservations.length} Totales
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 px-2">
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              filterBtn(reservationFilter === status, status === 'all' ? 'Todos' : translateStatus(status), () => setReservationFilter(status))
            ))}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredReservations.map((reservation) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                key={reservation.id} 
                className="bg-zinc-900/40 backdrop-blur-3xl border border-purple-500/5 rounded-[2rem] p-6 hover:border-purple-500/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Sede de Reserva</p>
                    <p className="font-black text-white text-lg">{reservation.restaurant?.name || 'Sede Premium'}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusClass[reservation.status] || 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                    {translateStatus(reservation.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                     <Zap className="w-3 h-3 text-purple-500" />
                     {reservation.reservation_date} <span className="text-zinc-600 mx-1">|</span> {reservation.reservation_time?.slice(0, 5)}
                  </div>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{reservation.party_size} Pax</p>
                </div>
              </motion.div>
            ))}
            {reservations.length === 0 && (
              <div className="bg-zinc-900/20 rounded-[2.5rem] p-16 text-center border border-dashed border-zinc-800">
                 <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                 <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Sin reservas futuras</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Reseñas */}
      <section className="pt-12">
        <div className="flex items-center gap-4 mb-8 px-4">
           <Trophy className="w-8 h-8 text-purple-500" />
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Califica tu <span className="text-zinc-600">Experiencia</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {completedOrders.map((order) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={order.id} 
              className="bg-zinc-900/40 backdrop-blur-3xl border border-purple-500/10 rounded-[2.5rem] p-8 flex flex-col justify-between"
            >
              <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Pedido Finalizado</p>
                <p className="font-black text-white text-xl mb-1">#{order.order_number?.split('-').pop()}</p>
                <p className="text-sm font-black text-purple-400 mb-6">Q{order.total}</p>
              </div>
              <button
                onClick={() => setReviewModal({ open: true, order })}
                disabled={reviewedOrders.includes(order.id)}
                className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] hover:bg-purple-600 transition-all border border-zinc-700 hover:border-purple-500 disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {reviewedOrders.includes(order.id) ? 'Opinión Enviada' : (
                  <>
                    <MessageSquare className="w-4 h-4" /> Dejar Reseña
                  </>
                )}
              </button>
            </motion.div>
          ))}
          {completedOrders.length === 0 && (
            <div className="col-span-full py-16 bg-zinc-900/10 rounded-[3rem] border border-dashed border-zinc-800 text-center">
               <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px]">No hay pedidos pendientes de calificación</p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE RESEÑA */}
      <AnimatePresence>
        {reviewModal.open && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-zinc-950 rounded-[3.5rem] p-10 border border-purple-500/20 shadow-2xl relative"
            >
              <button onClick={() => setReviewModal({ open: false, order: null })} className="absolute top-8 right-8 p-3 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white transition-all border border-zinc-800">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2 block">Club Gourmet</span>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Calificar <span className="text-zinc-600">Sabor</span></h3>
              </div>
              
              <div className="flex flex-col items-center gap-8 mb-10">
                <StarRating value={rating} onChange={setRating} />
                <div className="w-full">
                  <label className={labelClass}>Tu Comentario (Opcional)</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="w-full min-h-[120px] bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-sm font-medium text-white focus:border-purple-500 outline-none transition-all placeholder:text-zinc-800 resize-none"
                    placeholder="Comparte tu experiencia con la comunidad..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setReviewModal({ open: false, order: null })}
                  className="flex-1 py-5 rounded-3xl border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                >
                  Omitir
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 py-5 rounded-3xl bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-500 transition-all shadow-2xl shadow-purple-500/20"
                >
                  Enviar Opinión ✨
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

