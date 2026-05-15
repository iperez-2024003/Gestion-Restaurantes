import { useEffect, useMemo, useState } from 'react';
import { getOrders, getInvoice } from '../../../shared/api/orders';
import { getReservations } from '../../../shared/api/reservations';
import { createReview } from '../../../shared/api/reviews';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { translateStatus } from '../../../shared/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
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
  Trophy,
  FileText
} from 'lucide-react';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onChange(star)}
        className={`text-3xl transition-all hover:scale-125 ${value >= star ? 'text-[#b98c52]' : 'text-zinc-800'}`}
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
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    preparing: 'bg-orange-50 text-orange-600 border-orange-200',
    ready: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    served: 'bg-primary-50 text-primary-600 border-primary-200',
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    completed: 'bg-primary-100 text-primary-700 border-primary-200',
    no_show: 'bg-rose-50 text-rose-600 border-rose-200',
    cancelled: 'bg-zinc-50 text-zinc-400 border-zinc-200',
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

  const handleDownloadTicket = async (orderId) => {
    try {
      const response = await getInvoice(orderId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      showError('No se pudo generar el ticket en este momento');
    }
  };

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
      <div className="h-72 md:h-96 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 md:w-12 h-10 md:h-12 text-primary-500 animate-spin" />
        <p className="text-muted-brown font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando Bitácora...</p>
      </div>
    );
  }

  const filterBtn = (key, active, label, onClick) => (
    <button
      key={key}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
        active 
        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white border-primary-400 shadow-md' 
        : 'bg-white text-muted-brown border-primary-100 hover:border-primary-300 hover:text-ink shadow-sm'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-12 font-outfit animate-in fade-in duration-700 pb-20">
      {/* Header Premium - Ahora en Oro/Crema para consistencia total */}
      <div className="bg-gradient-to-br from-[#d7b77f] to-[#b98c52] text-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 shadow-2xl border border-primary-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.3),transparent_60%)]" />
        <div className="absolute top-0 right-0 p-12 opacity-15 hidden md:block">
           <History className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10">
          <Badge variant="outline" className="mb-4 bg-white/20 border-white/40 text-white">Pasaporte Gastronómico</Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-6 drop-shadow-md">
            Tu <span className="text-ink">Bitácora</span>
          </h1>
          <p className="max-w-2xl text-white font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed drop-shadow-sm">
            Revive tus mejores momentos y gestiona tus experiencias pasadas en la red más exclusiva de alta cocina.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        {/* Sección Pedidos */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 border border-primary-200">
                <ShoppingBag size={20} />
              </div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Pedidos</h2>
            </div>
            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary-100">
              {orders.length} Totales
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8 px-2">
            {['all', 'pending', 'served', 'paid', 'cancelled'].map((status) => (
              filterBtn(status, orderFilter === status, status === 'all' ? 'Todos' : translateStatus(status), () => setOrderFilter(status))
            ))}
          </div>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 scrollbar-hide">
            {filteredOrders.map((order) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
              >
                <Card className="p-6 md:p-8 hover:border-primary-300 transition-all group border-primary-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-muted-brown uppercase tracking-widest mb-1">Orden de Servicio</p>
                      <p className="font-black text-ink text-xl">#{order.order_number?.split('-').pop()}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl border ${statusClass[order.status] || 'bg-white text-muted-brown border-primary-100'}`}>
                      {translateStatus(order.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-primary-50">
                    <div className="flex items-center gap-6">
                      <p className="text-lg font-black text-primary-600">Q{order.total}</p>
                      <button
                        onClick={() => handleDownloadTicket(order.id)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-brown hover:text-primary-600 transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Ver Ticket
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-brown font-black uppercase tracking-widest opacity-60">
                      {new Date(order.createdAt || order.created_at).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
            {orders.length === 0 && (
              <div className="bg-primary-50/50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-primary-200">
                 <ShoppingBag className="w-12 h-12 text-primary-200 mx-auto mb-4" />
                 <p className="text-muted-brown font-black uppercase tracking-widest text-[10px]">Sin órdenes registradas</p>
              </div>
            )}
          </div>
        </section>

        {/* Sección Reservaciones */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 border border-primary-200">
                <Calendar size={20} />
              </div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Reservas</h2>
            </div>
            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary-100">
              {reservations.length} Totales
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 px-2">
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              filterBtn(status, reservationFilter === status, status === 'all' ? 'Todos' : translateStatus(status), () => setReservationFilter(status))
            ))}
          </div>

          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 scrollbar-hide">
            {filteredReservations.map((reservation) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={reservation.id} 
              >
                <Card className="p-6 md:p-8 hover:border-primary-300 transition-all border-primary-100 bg-gradient-to-br from-white to-primary-50/30">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-muted-brown uppercase tracking-widest mb-1">Sede Gourmet</p>
                      <p className="font-black text-ink text-xl">{reservation.restaurant?.name || 'Sede Premium'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl border ${statusClass[reservation.status] || 'bg-white text-muted-brown border-primary-100'}`}>
                      {translateStatus(reservation.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-primary-50">
                    <div className="flex items-center gap-3 text-xs font-black text-ink uppercase tracking-tight">
                       <Zap className="w-4 h-4 text-primary-500" />
                       {reservation.reservation_date} <span className="text-primary-200 mx-1">|</span> {reservation.reservation_time?.slice(0, 5)}
                    </div>
                    <Badge variant="primary" className="px-3 py-1">{reservation.party_size} Comensales</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
            {reservations.length === 0 && (
              <div className="bg-primary-50/50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-primary-200">
                 <Calendar className="w-12 h-12 text-primary-200 mx-auto mb-4" />
                 <p className="text-muted-brown font-black uppercase tracking-widest text-[10px]">Sin reservas futuras</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Sección Calificaciones */}
      <section className="pt-20 border-t border-primary-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-200">
                <Trophy size={24} />
              </div>
              <h2 className="text-4xl font-black text-ink uppercase tracking-tighter">Califica tu <span className="text-primary-500 italic">Experiencia</span></h2>
            </div>
            <p className="text-muted-brown font-medium text-xs md:text-sm uppercase tracking-widest">Comparte tu paladar con la comunidad gourmet.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {completedOrders.map((order) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={order.id} 
            >
              <Card className="p-8 h-full flex flex-col justify-between border-primary-100 shadow-premium">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-[8px]">Finalizado</Badge>
                    <Star className="w-4 h-4 text-primary-400" />
                  </div>
                  <p className="font-black text-ink text-2xl mb-1">#{order.order_number?.split('-').pop()}</p>
                  <p className="text-sm font-black text-primary-600 mb-8 uppercase tracking-widest">Q{order.total}</p>
                </div>
                <button
                  onClick={() => setReviewModal({ open: true, order })}
                  disabled={reviewedOrders.includes(order.id)}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 border ${
                    reviewedOrders.includes(order.id)
                    ? 'bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed'
                    : 'bg-white text-ink border-primary-200 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-sm'
                  }`}
                >
                  {reviewedOrders.includes(order.id) ? 'Opinión Registrada' : (
                    <>
                      <MessageSquare className="w-4 h-4" /> Dejar Reseña
                    </>
                  )}
                </button>
              </Card>
            </motion.div>
          ))}
          {completedOrders.length === 0 && (
            <div className="col-span-full py-20 bg-primary-50/30 rounded-[3rem] border-2 border-dashed border-primary-100 text-center">
               <p className="text-muted-brown font-black uppercase tracking-[0.4em] text-[10px]">No hay pedidos pendientes de calificación</p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE RESEÑA */}
      <AnimatePresence>
        {reviewModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[3rem] md:rounded-[4rem] p-10 md:p-14 border border-primary-200 shadow-gold relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

              <button 
                onClick={() => setReviewModal({ open: false, order: null })} 
                className="absolute top-8 right-8 p-3 rounded-2xl bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-12 text-center">
                <Badge variant="primary" className="mb-4">Club Gourmet</Badge>
                <h3 className="text-3xl font-black text-ink tracking-tighter uppercase leading-none">Calificar <span className="text-primary-500 italic">Sabor</span></h3>
                <p className="text-muted-brown font-medium mt-4 text-xs">Tu opinión es la brújula de nuestra excelencia.</p>
              </div>
              
              <div className="flex flex-col items-center gap-10 mb-12">
                <StarRating value={rating} onChange={setRating} />
                <div className="w-full space-y-3">
                  <label className="text-[10px] font-black text-muted-brown uppercase tracking-widest px-2 block">Tu Comentario</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="w-full min-h-[140px] bg-primary-50/30 border border-primary-100 rounded-[2rem] p-6 text-sm font-medium text-ink focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all placeholder:text-primary-200 resize-none"
                    placeholder="Describe los matices de tu platillo..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setReviewModal({ open: false, order: null })}
                  className="flex-1 py-4 rounded-2xl bg-white border border-primary-100 text-muted-brown font-black uppercase tracking-widest text-[10px] hover:text-ink transition-all"
                >
                  Omitir
                </button>
                <Button
                  onClick={submitReview}
                  className="flex-1 py-4 rounded-2xl shadow-gold"
                >
                  Enviar Reseña ✨
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

