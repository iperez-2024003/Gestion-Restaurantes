import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  UtensilsCrossed, 
  Truck, 
  Package, 
  MapPin, 
  CreditCard,
  Loader2,
  ChevronRight,
  Info
} from 'lucide-react';

const ORDER_TYPE_OPTIONS = [
  { id: 'dine_in', label: 'Salón', icon: UtensilsCrossed },
  { id: 'takeout', label: 'Llevar', icon: Package },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

export const CartDrawer = ({ isOpen, onClose, restaurantId, tableNumber }) => {
  const { cart, removeFromCart, getCartTotal, clearCart, createOrder, loading } = useOrderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState(tableNumber ? 'dine_in' : 'takeout');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const DELIVERY_FEE = 15.00;

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      return;
    }

    try {
      const orderData = {
        restaurant_id: restaurantId,
        user_id: user.id,
        customer_name: user.name || user.username,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        delivery_fee: orderType === 'delivery' ? DELIVERY_FEE : 0,
        notes: notes || (tableNumber ? `Mesa: ${tableNumber}` : ''),
        items: cart.map(item => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || ''
        }))
      };

      await createOrder(orderData);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950/90 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] z-50 flex flex-col font-outfit border-l border-purple-500/10"
          >
            <div className="p-10 border-b border-purple-500/10 flex justify-between items-center bg-zinc-900/40">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Mi <span className="text-purple-500 italic">Pedido</span></h2>
                {tableNumber && <p className="text-[10px] font-black text-purple-400 mt-2 uppercase tracking-widest">Mesa #{tableNumber}</p>}
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl">
                     <ShoppingBag className="w-10 h-10 text-zinc-700" />
                  </div>
                  <p className="font-black text-white uppercase tracking-widest text-sm mb-2">Canasta Vacía</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Agrega platillos gourmet para continuar.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.menuItemId} 
                    className="flex gap-6 p-6 bg-zinc-900/40 border border-purple-500/5 rounded-[2.5rem] relative group hover:border-purple-500/20 transition-all shadow-xl"
                  >
                    <button 
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-950 text-rose-500 rounded-xl flex items-center justify-center border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-white uppercase tracking-tight text-sm line-clamp-1">{item.name}</h4>
                        <p className="font-black text-purple-400 text-sm tracking-tighter">Q{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="px-2 py-1 bg-zinc-950 text-zinc-500 text-[9px] font-black rounded-lg border border-zinc-800 uppercase tracking-widest">
                            Cant: {item.quantity}
                         </span>
                         <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">@ Q{item.price}</span>
                      </div>
                      {item.notes && (
                         <div className="mt-3 flex items-start gap-2 bg-black/20 p-2 rounded-xl border border-zinc-800/50">
                            <Info className="w-3 h-3 text-zinc-600 mt-0.5" />
                            <p className="text-[10px] text-zinc-500 font-medium italic">{item.notes}</p>
                         </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-10 border-t border-purple-500/10 bg-zinc-900/60 backdrop-blur-xl space-y-8">
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Modo de Entrega</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ORDER_TYPE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOrderType(opt.id)}
                        className={`py-4 px-2 rounded-2xl text-[9px] font-black transition-all flex flex-col items-center gap-2 border uppercase tracking-widest ${
                          orderType === opt.id
                            ? 'bg-purple-600 border-purple-400 text-white shadow-2xl shadow-purple-600/20'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Dirección de Destino</label>
                    <div className="relative">
                       <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                       <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Zona, Calle, Número de Casa..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:border-purple-500 focus:outline-none transition-all placeholder:text-zinc-700"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 font-black text-[9px] uppercase tracking-[0.2em]">
                       <ChevronRight className="w-3 h-3" /> Cargo Logístico: Q{DELIVERY_FEE.toFixed(2)}
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Instrucciones Especiales</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ejem: Término medio, sin cebolla..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-sm text-white focus:border-purple-500 focus:outline-none transition-all placeholder:text-zinc-700 resize-none h-20"
                  />
                </div>
                
                <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Valor Gastronómico</span>
                    <span className="text-white tracking-tighter">Q{subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-500">Logística de Envío</span>
                      <span className="text-purple-400 tracking-tighter">Q{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-1">Inversión Total</span>
                    <span className="text-4xl font-black text-white tracking-tighter leading-none">Q{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleCheckout}
                    disabled={loading || (orderType === 'delivery' && !deliveryAddress.trim())}
                    className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-purple-500 shadow-2xl shadow-purple-500/20 transition-all border border-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Confirmar Orden <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                  
                  <button 
                    onClick={clearCart}
                    className="w-full py-4 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Eliminar Todo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
