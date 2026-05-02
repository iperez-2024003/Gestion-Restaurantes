import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { translateStatus } from '../../../shared/utils/i18n';
import { downloadOrderPdfUrl } from '../../../shared/api/statistics';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useSocket, useSocketEvent } from '../../../shared/hooks/useSocket';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { 
  ClipboardList, 
  RefreshCcw, 
  Flame, 
  CheckCircle2, 
  Truck, 
  Package, 
  UtensilsCrossed, 
  FileText,
  Loader2,
  ChevronRight,
  Bell
} from 'lucide-react';

const ORDER_STATUSES = [
  { id: 'pending', label: 'Pendientes', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  { id: 'preparing', label: 'En Cocina', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'ready', label: 'Listos', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'served', label: 'Entregados', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
];

export const OrdersKanban = () => {
  const { id: restaurantId } = useParams();
  const { token } = useAuthStore();
  const { orders, loading, fetchRestaurantOrders, updateOrderStatus } = useOrderStore();

  useSocket(restaurantId);
  
  useSocketEvent('new_order', (newOrder) => {
    showSuccess(`🔔 ¡Nueva Orden #${newOrder.order_number}!`);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
    fetchRestaurantOrders(restaurantId);
  });

  useSocketEvent('order_status_updated', (data) => {
    fetchRestaurantOrders(restaurantId);
  });

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantOrders(restaurantId);
    }
  }, [restaurantId, fetchRestaurantOrders]);

  const handleStatusChange = (orderId, currentStatus) => {
    const currentIndex = ORDER_STATUSES.findIndex(s => s.id === currentStatus);
    if (currentIndex < ORDER_STATUSES.length - 1) {
      const nextStatus = ORDER_STATUSES[currentIndex + 1].id;
      updateOrderStatus(orderId, nextStatus);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-outfit">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="mt-6 text-zinc-500 font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Sincronizando Comanda Digital...</p>
      </div>
    );
  }

  return (
    <div className="font-outfit space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2">Service Operations</p>
           <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Command <span className="text-zinc-600">Center</span></h1>
        </div>
        
        <button 
          onClick={() => fetchRestaurantOrders(restaurantId)}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] border border-purple-500/20 hover:border-purple-500 transition-all shadow-2xl"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-10 h-[calc(100vh-280px)] items-start scrollbar-thin scrollbar-thumb-zinc-800">
        {ORDER_STATUSES.map(status => {
          const columnOrders = orders.filter(o => o.status === status.id);

          return (
            <div key={status.id} className="min-w-[350px] w-[350px] flex-shrink-0 flex flex-col h-full">
              <div className={`flex items-center justify-between mb-6 px-6 py-4 rounded-3xl border ${status.color} backdrop-blur-xl`}>
                <h3 className="font-black uppercase tracking-widest text-[11px]">{status.label}</h3>
                <span className="text-[10px] font-black w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center border border-current/10">
                  {columnOrders.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                <AnimatePresence mode="popLayout">
                  {columnOrders.map(order => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id}
                      className="bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-purple-500/5 hover:border-purple-500/20 transition-all relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">#{order.order_number?.split('-').pop()}</span>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          order.order_type === 'delivery' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          order.order_type === 'takeout' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {order.order_type === 'dine_in' ? <UtensilsCrossed className="w-3 h-3" /> : 
                           order.order_type === 'delivery' ? <Truck className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          {order.order_type === 'dine_in' ? 'Salón' : 
                           order.order_type === 'delivery' ? 'Domicilio' : 'Para llevar'}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-black text-white tracking-tight uppercase mb-2 group-hover:text-purple-400 transition-colors">{order.customer_name}</h4>
                      
                      <div className="space-y-1 mb-6">
                        {order.order_type === 'delivery' && order.delivery_address && (
                          <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                             <ChevronRight className="w-3 h-3" /> {order.delivery_address}
                          </div>
                        )}
                        {order.notes && (
                           <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 mt-2">
                             <Bell className="w-3 h-3 animate-pulse" /> {order.notes}
                           </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-8 bg-black/20 p-4 rounded-2xl border border-zinc-800/50">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                            <span className="text-zinc-400"><span className="text-purple-500 mr-2">{item.quantity}x</span> {item.MenuItem?.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                        <span className="text-2xl font-black text-white tracking-tighter">Q{order.total}</span>
                        
                        {status.id !== 'served' ? (
                          <button
                            onClick={() => handleStatusChange(order.id, status.id)}
                            className="px-6 py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-500 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-2"
                          >
                            {status.id === 'pending' ? <Flame className="w-4 h-4" /> : 
                             status.id === 'preparing' ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {status.id === 'pending' ? 'Cocinar' : 
                             status.id === 'preparing' ? 'Listo' : 'Entregar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => window.open(downloadOrderPdfUrl(order.id, token), '_blank')}
                            className="px-6 py-3 bg-zinc-950 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-600/10 transition-all flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" /> Ticket
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {columnOrders.length === 0 && (
                  <div className="h-40 rounded-[2.5rem] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 text-center px-10">
                    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">Bandeja Vacía</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
