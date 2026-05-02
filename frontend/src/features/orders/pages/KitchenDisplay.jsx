import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { useSocket, useSocketEvent } from '../../../shared/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ClockIcon, 
  FireIcon, 
  CheckCircleIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export const KitchenDisplay = () => {
  const { id: restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = async () => {
    try {
      const res = await api.get(`/orders/kitchen/${restaurantId}`);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useSocket(restaurantId);
  
  useSocketEvent('new_order', () => {
    toast('🍳 ¡Nuevo pedido en cocina!', { icon: '🔥', style: { background: '#1e1b4b', color: '#fff' } });
    fetchKitchenOrders();
  });

  useSocketEvent('order_status_updated', () => {
    fetchKitchenOrders();
  });

  useEffect(() => {
    if (restaurantId) fetchKitchenOrders();
  }, [restaurantId]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'pending' ? 'preparing' : 'ready';
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      toast.success(nextStatus === 'preparing' ? 'Empezando preparación...' : '¡Orden terminada!');
      fetchKitchenOrders();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-950">
       <div className="w-16 h-16 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white overflow-x-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <FireIcon className="w-8 h-8 text-orange-500" />
            KITCHEN DISPLAY SYSTEM
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Control de producción en tiempo real</p>
        </div>
        <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="text-right">
             <p className="text-xs text-slate-500 font-bold">ÓRDENES ACTIVAS</p>
             <p className="text-2xl font-black text-indigo-400">{orders.length}</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <ClockIcon className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      <div className="flex gap-6 pb-8 min-w-max h-[calc(100vh-160px)]">
        <AnimatePresence mode="popLayout">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 50 }}
              className={`w-80 flex flex-col rounded-3xl border-2 transition-all shadow-2xl ${
                order.status === 'pending' 
                  ? 'bg-slate-900 border-indigo-900/50' 
                  : 'bg-indigo-950/40 border-indigo-500 shadow-indigo-900/20'
              }`}
            >
              {/* Header de la tarjeta */}
              <div className={`p-5 rounded-t-3xl ${order.status === 'preparing' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-2xl font-black">#{order.order_number}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'
                  }`}>
                    {order.status === 'pending' ? 'NUEVO' : 'COCINANDO'}
                  </span>
                </div>
                <p className="text-xs font-bold opacity-70 truncate">{order.customer_name || 'Sin nombre'}</p>
              </div>

              {/* Items */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="border-b border-slate-800/50 pb-3 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                       <span className="text-xl font-bold text-indigo-100 flex-1">{item.menu_item?.name}</span>
                       <span className="bg-slate-800 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">x{item.quantity}</span>
                    </div>
                    {item.special_instructions && (
                      <div className="mt-2 flex items-start gap-2 bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                         <ChatBubbleLeftRightIcon className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                         <p className="text-[11px] text-orange-200 font-bold leading-tight">{item.special_instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer / Acción */}
              <div className="p-5 bg-slate-900/50 rounded-b-3xl mt-auto">
                <div className="flex items-center justify-between mb-4 text-slate-400">
                   <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-xs font-bold">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                   {order.order_type === 'delivery' && (
                     <span className="text-[10px] font-black bg-slate-800 px-2 py-1 rounded-md">DOMICILIO</span>
                   )}
                </div>
                
                <button
                  onClick={() => handleUpdateStatus(order.id, order.status)}
                  className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    order.status === 'pending'
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {order.status === 'pending' ? (
                    <>
                      <BeakerIcon className="w-6 h-6" />
                      EMPEZAR COCINA
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-6 h-6" />
                      MARCAR COMO LISTO
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {orders.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center text-slate-600 opacity-20 select-none">
             <FireIcon className="w-32 h-32 mb-4" />
             <p className="text-3xl font-black italic">COCINA LIMPIA. BUEN TRABAJO.</p>
          </div>
        )}
      </div>
    </div>
  );
};
