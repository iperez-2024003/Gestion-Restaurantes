import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReservationStore } from '../store/useReservationStore';
import { translateStatus } from '../../../shared/utils/i18n';
import { 
  Calendar, 
  RefreshCcw, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';

const RESERVATION_COLUMNS = [
  { id: 'pending', label: 'Pendientes', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'confirmed', label: 'Confirmadas', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'completed', label: 'Finalizadas', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'no_show', label: 'No asistió', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'cancelled', label: 'Canceladas', color: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
];

export const ReservationsKanban = () => {
  const { id: restaurantId } = useParams();
  const {
    reservations,
    loading,
    fetchReservations,
    confirmReservation,
    updateReservationStatus,
    cancelReservation,
  } = useReservationStore();

  useEffect(() => {
    if (!restaurantId) return;
    fetchReservations({ restaurant_id: restaurantId, limit: 100 });
    const interval = setInterval(() => {
      fetchReservations({ restaurant_id: restaurantId, limit: 100 });
    }, 15000);
    return () => clearInterval(interval);
  }, [restaurantId, fetchReservations]);

  return (
    <div className="font-outfit space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2">Guest Relations</p>
           <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Reservas <span className="text-zinc-600">Kanban</span></h1>
        </div>
        
        <button
          onClick={() => fetchReservations({ restaurant_id: restaurantId, limit: 100 })}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] border border-purple-500/20 hover:border-purple-500 transition-all shadow-2xl"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {loading && reservations.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Reservas Premium...</p>
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto pb-10 items-start h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-zinc-800">
          {RESERVATION_COLUMNS.map((column) => {
            const columnReservations = reservations.filter((r) => r.status === column.id);
            return (
              <div
                key={column.id}
                className="min-w-[350px] w-[350px] h-full flex flex-col"
              >
                <div className={`flex items-center justify-between mb-6 px-6 py-4 rounded-3xl border ${column.color} backdrop-blur-xl`}>
                  <h3 className="font-black uppercase tracking-widest text-[11px]">{column.label}</h3>
                  <span className="text-[10px] font-black w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center border border-current/10">
                    {columnReservations.length}
                  </span>
                </div>
                
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                  <AnimatePresence mode="popLayout">
                    {columnReservations.map((reservation) => (
                      <motion.article
                        key={reservation.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-purple-500/5 p-8 group hover:border-purple-500/20 transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Users className="w-12 h-12 text-purple-500" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                              #{reservation.reservation_number?.split('-').pop()}
                            </span>
                            <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/10">
                              <Clock className="w-3.5 h-3.5" />
                              {reservation.reservation_time?.slice(0, 5)}
                            </div>
                          </div>

                          <h4 className="text-xl font-black text-white tracking-tight uppercase mb-2 group-hover:text-purple-400 transition-colors">{reservation.customer_name}</h4>
                          
                          <div className="space-y-2 mb-8">
                            <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                               <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                               {reservation.reservation_date}
                            </div>
                            <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                               <User className="w-3.5 h-3.5 text-zinc-600" />
                               {reservation.party_size} Comensales
                            </div>
                          </div>

                          {reservation.special_requests && (
                            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl mb-8">
                               <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Notas Especiales</p>
                               <p className="text-xs text-zinc-400 font-medium">{reservation.special_requests}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            {reservation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => confirmReservation(reservation.id)}
                                  className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Confirmar
                                </button>
                                <button
                                  onClick={() => cancelReservation(reservation.id)}
                                  className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-[9px] hover:bg-rose-600 hover:text-white transition-all border border-zinc-700 hover:border-rose-500 flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> Cancelar
                                </button>
                              </>
                            )}

                            {reservation.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'completed')}
                                  className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-[9px] hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Finalizar
                                </button>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'no_show')}
                                  className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-[9px] hover:bg-amber-600 hover:text-white transition-all border border-zinc-700 hover:border-amber-500 flex items-center justify-center gap-2"
                                >
                                  <AlertCircle className="w-4 h-4" /> No asistió
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>

                  {columnReservations.length === 0 && (
                    <div className="h-40 rounded-[2.5rem] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 text-center px-10">
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">Bandeja Vacía</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

