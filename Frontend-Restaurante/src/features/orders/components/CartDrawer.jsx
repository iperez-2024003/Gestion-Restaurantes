import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle, FileText, Info, MapPin, Truck, Package, UtensilsCrossed, X, ShoppingBag, Trash2, Loader2, ChevronRight, Download, MessageSquare } from 'lucide-react';
import { getInvoice } from '../../../shared/api/orders';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

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
  const [orderSuccess, setOrderSuccess] = useState(null); // stores the completed order data

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

      const result = await createOrder(orderData);
      setOrderSuccess(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadTicket = async (orderId) => {
    try {
      const response = await getInvoice(orderId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      console.error('Error downloading ticket:', error);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[70]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-3xl shadow-[0_0_60px_rgba(110,80,45,0.08)] z-[70] flex flex-col font-outfit border-l border-[#dcc7a5]/10"
          >
            <div className="p-6 md:p-10 border-b border-[#dcc7a5]/10 flex justify-between items-center bg-white/80">
              <div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
                  {orderSuccess ? '¡Buen' : 'Mi'} <span className="text-[#b98c52] italic">{orderSuccess ? 'Provecho!' : 'Pedido'}</span>
                </h2>
                {tableNumber && !orderSuccess && <p className="text-[10px] font-black text-[#b98c52] mt-2 uppercase tracking-widest">Mesa #{tableNumber}</p>}
              </div>
              <button 
                onClick={() => {
                  onClose();
                  setOrderSuccess(null);
                }} 
                className="w-12 h-12 bg-white/70 rounded-2xl flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-white/90 transition-all border border-[#dcc7a5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
              {orderSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="w-32 h-32 bg-emerald-50 rounded-[3rem] flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-500/10">
                    <CheckCircle className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-2">Orden Confirmada</h3>
                    <p className="text-sm text-zinc-500 font-medium tracking-wide">Tu pedido ya está en camino a la cocina digital.</p>
                  </div>
                  
                  <div className="w-full bg-[#fcf8f2] rounded-[2.5rem] p-8 border border-[#dcc7a5]/30 space-y-4">
                    <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.3em]">Resumen de Inversión</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-600">No. Orden</span>
                      <span className="text-sm font-black text-zinc-900">#{orderSuccess.order_number?.split('-').pop()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-600">Total Pagado</span>
                      <span className="text-xl font-black text-[#b98c52]">Q{orderSuccess.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <button 
                      onClick={() => handleDownloadTicket(orderSuccess.id)}
                      className="w-full py-6 bg-[#caa56d] text-[#1c1712] rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:brightness-95 shadow-lg transition-all border border-[#caa56d]/20 flex items-center justify-center gap-3"
                    >
                      <FileText className="w-5 h-5" /> Descargar Ticket
                    </button>
                    
                    <button 
                      onClick={() => {
                        onClose();
                        setOrderSuccess(null);
                      }}
                      className="w-full py-4 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-[#b98c52] transition-colors"
                    >
                      Cerrar y seguir explorando
                    </button>
                  </div>
                </div>
              ) : cart.length === 0 ? (
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

            {cart.length > 0 && !orderSuccess && (
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
                  <Input 
                    label="Dirección de Destino"
                    icon={MapPin}
                    placeholder="Zona, Calle, Número de Casa..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                )}

                <Input 
                  label="Instrucciones Especiales"
                  icon={MessageSquare}
                  placeholder="Ejem: Término medio, sin cebolla..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                
                <div className="space-y-4 pt-4 border-t border-primary-200">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-muted-brown uppercase tracking-widest">Valor Gastronómico</span>
                    <span className="text-sm font-black text-ink">Q{subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-muted-brown uppercase tracking-widest">Logística de Envío</span>
                      <span className="text-sm font-black text-primary-600">+ Q{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-6 bg-primary-100 rounded-[2rem] border border-primary-200">
                    <span className="text-xs font-black text-ink uppercase tracking-[0.2em]">Inversión Total</span>
                    <span className="text-2xl font-black text-primary-600">Q{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={handleCheckout}
                    isLoading={loading}
                    disabled={orderType === 'delivery' && !deliveryAddress.trim()}
                    className="w-full py-8 rounded-[2rem] text-sm uppercase tracking-[0.3em] shadow-gold"
                  >
                    Confirmar Orden <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <button 
                    onClick={clearCart}
                    className="w-full py-2 text-[#6b5e4e] font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Vaciar Canasta
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
