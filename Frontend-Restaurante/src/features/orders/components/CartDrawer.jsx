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
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-3xl shadow-[0_0_60px_rgba(110,80,45,0.08)] z-50 flex flex-col font-outfit border-l border-[#dcc7a5]/10"
          >
            <div className="p-6 md:p-10 border-b border-[#dcc7a5]/10 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Mi <span className="text-[#b98c52] italic">Pedido</span></h2>
                {tableNumber && <p className="text-[10px] font-black text-[#b98c52] mt-2 uppercase tracking-widest">Mesa #{tableNumber}</p>}
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 bg-white/70 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-white/90 transition-all border border-[#dcc7a5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white/70 rounded-[2rem] flex items-center justify-center mb-6 border border-[#dcc7a5] shadow-md">
                     <ShoppingBag className="w-10 h-10 text-zinc-600" />
                  </div>
                  <p className="font-black text-zinc-900 uppercase tracking-widest text-sm mb-2">Canasta Vacía</p>
                  <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Agrega platillos gourmet para continuar.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.menuItemId} 
                    className="flex gap-6 p-6 bg-white/80 border border-[#dcc7a5]/5 rounded-[2.5rem] relative group hover:border-[#b98c52]/20 transition-all shadow-lg"
                  >
                    <button 
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 text-rose-500 rounded-xl flex items-center justify-center border border-[#dcc7a5] opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-zinc-900 uppercase tracking-tight text-sm line-clamp-1">{item.name}</h4>
                        <p className="font-black text-[#b98c52] text-sm tracking-tighter">Q{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="px-2 py-1 bg-white/90 text-zinc-600 text-[9px] font-black rounded-lg border border-[#dcc7a5] uppercase tracking-widest">
                            Cant: {item.quantity}
                         </span>
                         <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">@ Q{item.price}</span>
                      </div>
                      {item.notes && (
                         <div className="mt-3 flex items-start gap-2 bg-white/90 p-2 rounded-xl border border-[#dcc7a5]/50">
                            <Info className="w-3 h-3 text-zinc-600 mt-0.5" />
                            <p className="text-[10px] text-zinc-600 font-medium italic">{item.notes}</p>
                         </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 md:p-10 border-t border-[#dcc7a5]/10 bg-zinc-900/60 backdrop-blur-xl space-y-8">
                
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Modo de Entrega</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {ORDER_TYPE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOrderType(opt.id)}
                          className={`py-4 px-2 rounded-2xl text-[9px] font-black transition-all flex flex-col items-center gap-2 border uppercase tracking-widest ${
                            orderType === opt.id
                              ? 'bg-[#b98c52] border-[#b98c52] text-white shadow-md'
                              : 'bg-white/90 border-[#dcc7a5] text-zinc-600 hover:bg-white/95'
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
                       <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b98c52]" />
                       <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Zona, Calle, Número de Casa..."
                        className="w-full bg-white/90 border border-[#dcc7a5] rounded-2xl py-4 pl-14 pr-6 text-sm text-zinc-900 focus:border-[#b98c52] focus:outline-none transition-all placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[#b98c52] font-black text-[9px] uppercase tracking-[0.2em]">
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
                    className="w-full bg-white/90 border border-[#dcc7a5] rounded-2xl p-5 text-sm text-zinc-900 focus:border-[#b98c52] focus:outline-none transition-all placeholder:text-zinc-500 resize-none h-20"
                  />
                </div>
                
                <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-600">Valor Gastronómico</span>
                    <span className="text-zinc-900 tracking-tighter">Q{subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-zinc-600">Logística de Envío</span>
                      <span className="text-[#b98c52] tracking-tighter">Q{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.3em] mb-1">Inversión Total</span>
                    <span className="text-4xl font-black text-zinc-900 tracking-tighter leading-none">Q{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleCheckout}
                    disabled={loading || (orderType === 'delivery' && !deliveryAddress.trim())}
                    className="w-full py-6 bg-[#b98c52] text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:brightness-95 shadow-md transition-all border border-[#b98c52]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
