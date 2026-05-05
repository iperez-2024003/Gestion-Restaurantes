import { useEffect, useState } from 'react';
import { getEvents, registerToEvent } from '../../../shared/api/events';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { translateEventType } from '../../../shared/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../../shared/components/states/LoadingSpinner';
import UnifiedButton from '../../../shared/components/ui/UnifiedButton';
import { 
  Calendar, 
  Clock, 
  Ticket, 
  Users, 
  Sparkles,
  Loader2,
  CalendarCheck,
  ChevronRight,
  MapPin
} from 'lucide-react';

export const EventsFeed = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents({ upcoming: true, limit: 50 });
      setEvents(response.data?.events || []);
    } catch (error) {
      showError('No se pudo sincronizar la cartelera de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRegister = async (event) => {
    try {
      setRegisteringId(event.id);
      await registerToEvent(event.id, {
        user_id: user?.id,
        participant_name: user?.name || user?.username || 'Cliente',
        participant_email: user?.email,
        participant_phone: user?.phone || '00000000',
      });
      showSuccess(`¡Confirmado! Te has inscrito en "${event.name}"`);
      await loadEvents();
    } catch (error) {
      showError('No se pudo completar tu inscripción premium');
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-outfit">
        <LoadingSpinner size="lg" text="Sincronizando Experiencias..." />
      </div>
    );
  }

  return (
    <div className="font-outfit space-y-12 animate-in fade-in duration-700">
      <div className="bg-white/80 text-zinc-900 rounded-[3rem] p-6 md:p-12 shadow-[0_30px_100px_rgba(110,80,45,0.14)] border border-[#dcc7a5]/70 relative overflow-hidden group backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <CalendarCheck className="w-32 h-32 text-[#b98c52]" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#b98c52] mb-2">Cartelera Exclusiva</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Experiencias <span className="text-[#8b6435]">Premium</span></h1>
          <p className="mt-6 text-zinc-600 font-bold uppercase tracking-widest text-xs max-w-xl leading-loose">Catas, cenas temáticas y masterclasses diseñadas para los paladares más exigentes de nuestra comunidad.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <AnimatePresence>
          {events.map((event, index) => {
            const available = event.max_participants - event.current_participants;
            const soldOut = available <= 0;
            return (
              <motion.article 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/70 overflow-hidden group hover:border-[#b98c52]/30 transition-all flex flex-col h-full shadow-[0_30px_100px_rgba(110,80,45,0.14)]"
              >
                <div className="h-48 md:h-60 relative overflow-hidden">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={event.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-6 left-6">
                     <span className="bg-white/85 backdrop-blur-xl px-4 py-2 rounded-xl text-[9px] font-black text-[#8b6435] border border-[#dcc7a5] uppercase tracking-widest">
                       {translateEventType(event.event_type)}
                     </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-3 line-clamp-1 group-hover:text-[#8b6435] transition-colors">{event.name}</h3>
                  <p className="text-xs text-zinc-600 font-bold leading-relaxed mb-8 line-clamp-2">{event.description || 'Una velada inigualable diseñada para sorprender tus sentidos con los mejores ingredientes.'}</p>
                  
                  <div className="space-y-4 mb-10 flex-1">
                      <div className="flex items-center gap-3 text-zinc-600 font-black text-[10px] uppercase tracking-widest bg-[#fffaf3] p-3 rounded-2xl border border-[#dcc7a5]">
                        <Calendar className="w-4 h-4 text-[#b98c52]" />
                       {event.event_date}
                    </div>
                      <div className="flex items-center gap-3 text-zinc-600 font-black text-[10px] uppercase tracking-widest bg-[#fffaf3] p-3 rounded-2xl border border-[#dcc7a5]">
                        <Clock className="w-4 h-4 text-[#b98c52]" />
                       {event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)}
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2 text-zinc-900 font-black text-lg tracking-tighter">
                          <Ticket className="w-5 h-5 text-[#b98c52]" />
                          Q{event.price_per_person}
                       </div>
                       <div className="flex items-center gap-2 text-zinc-500 font-black text-[9px] uppercase tracking-widest">
                          <Users className="w-4 h-4 text-zinc-600" />
                          {available > 0 ? `${available} Cupos` : 'Sold Out'}
                       </div>
                    </div>
                  </div>

                  <UnifiedButton
                    onClick={() => handleRegister(event)}
                    disabled={soldOut || registeringId === event.id}
                    variant={soldOut ? 'outline' : 'primary'}
                    size="md"
                    className="w-full"
                  >
                    {registeringId === event.id ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : soldOut ? (
                      'Capacidad Máxima'
                    ) : (
                      <>Reservar Cupo <Sparkles className="w-4 h-4" /></>
                    )}
                  </UnifiedButton>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {events.length === 0 && (
           <div className="col-span-full py-32 bg-white/70 rounded-[4rem] border border-dashed border-[#dcc7a5] text-center">
             <Calendar className="w-16 h-16 text-[#d7b77f] mx-auto mb-6" />
             <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">No hay eventos programados en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

