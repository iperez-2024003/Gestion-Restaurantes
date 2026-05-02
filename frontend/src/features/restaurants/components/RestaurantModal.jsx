import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSaveRestaurant } from '../hooks/useSaveRestaurant';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  Wifi, 
  Car, 
  Trees, 
  Accessibility, 
  Dog, 
  X,
  Save,
  Info,
  CalendarDays,
  CheckCircle2,
  Utensils,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/useAuthStore';

const CATEGORIES = [
  { value: 'casual', label: 'Casual' },
  { value: 'fine_dining', label: 'Fine Dining' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'cafe', label: 'Café' },
  { value: 'bakery', label: 'Panadería' },
  { value: 'bar', label: 'Bar' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'family_style', label: 'Familiar' },
  { value: 'gourmet', label: 'Gourmet' },
  { value: 'other', label: 'Otro' },
];

const DAYS = [
  { value: 'monday', label: 'Lun' },
  { value: 'tuesday', label: 'Mar' },
  { value: 'wednesday', label: 'Mié' },
  { value: 'thursday', label: 'Jue' },
  { value: 'friday', label: 'Vie' },
  { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' },
];

const inputClass =
  'w-full px-6 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium';

const labelClass = 'flex items-center gap-2 text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-[0.2em] ml-1';

export const RestaurantModal = ({ isOpen, onClose, restaurant = null }) => {
  const { saveRestaurant } = useSaveRestaurant();
  const loading = useRestaurantStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [selectedDays, setSelectedDays] = useState([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  ]);

  useEffect(() => {
    if (isOpen) {
      if (restaurant) {
        reset({
          name: restaurant.name || '',
          description: restaurant.description || '',
          address: restaurant.address || '',
          phone: restaurant.phone || '',
          email: restaurant.email || '',
          category: restaurant.category || 'casual',
          cuisine_type: restaurant.cuisine_type || '',
          price_range: restaurant.price_range || '$',
          average_price: restaurant.average_price || '',
          capacity: restaurant.capacity || '',
          opening_time: restaurant.opening_time?.slice(0, 5) || '08:00',
          closing_time: restaurant.closing_time?.slice(0, 5) || '22:00',
          logo_url: restaurant.logo_url || '',
          cover_image_url: restaurant.cover_image_url || '',
          website_url: restaurant.website_url || '',
          admin_id: restaurant.admin_id || '',
          accepts_reservations: restaurant.accepts_reservations ?? true,
          accepts_takeout: restaurant.accepts_takeout ?? true,
          accepts_delivery: restaurant.accepts_delivery ?? false,
          parking_available: restaurant.parking_available ?? false,
          wifi_available: restaurant.wifi_available ?? false,
          outdoor_seating: restaurant.outdoor_seating ?? false,
          pet_friendly: restaurant.pet_friendly ?? false,
          wheelchair_accessible: restaurant.wheelchair_accessible ?? false,
        });
        setSelectedDays(restaurant.operating_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
      } else {
        reset({
          name: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          category: 'casual',
          cuisine_type: '',
          price_range: '$',
          average_price: '',
          capacity: '',
          opening_time: '08:00',
          closing_time: '22:00',
          logo_url: '',
          cover_image_url: '',
          website_url: '',
          admin_id: user?.id || '',
          accepts_reservations: true,
          accepts_takeout: true,
          accepts_delivery: false,
          parking_available: false,
          wifi_available: false,
          outdoor_seating: false,
          pet_friendly: false,
          wheelchair_accessible: false,
        });
        setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
      }
    }
  }, [isOpen, restaurant]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onSubmit = async (data) => {
    const toTimeBackend = (t) => t && t.length === 5 ? `${t}:00` : t;
    const formData = new FormData();
    
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('address', data.address);
    formData.append('phone', data.phone);
    formData.append('email', data.email || '');
    formData.append('category', data.category);
    formData.append('cuisine_type', data.cuisine_type || '');
    formData.append('price_range', data.price_range);
    formData.append('capacity', parseInt(data.capacity));
    formData.append('opening_time', toTimeBackend(data.opening_time));
    formData.append('closing_time', toTimeBackend(data.closing_time));
    formData.append('website_url', data.website_url || '');
    formData.append('admin_id', String(data.admin_id));
    
    formData.append('accepts_reservations', data.accepts_reservations);
    formData.append('accepts_takeout', data.accepts_takeout);
    formData.append('accepts_delivery', data.accepts_delivery);
    formData.append('parking_available', data.parking_available);
    formData.append('wifi_available', data.wifi_available);
    formData.append('outdoor_seating', data.outdoor_seating);
    formData.append('pet_friendly', data.pet_friendly);
    formData.append('wheelchair_accessible', data.wheelchair_accessible);

    formData.append('operating_days', JSON.stringify(selectedDays));
    if (data.average_price) formData.append('average_price', parseFloat(data.average_price));
    if (data.logo && data.logo[0]) formData.append('logo', data.logo[0]);

    const result = await saveRestaurant(formData, restaurant?.id);
    if (result.success) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-start z-50 py-12 px-4 overflow-y-auto font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 rounded-[3.5rem] border border-purple-500/20 shadow-[0_0_100px_rgba(168,85,247,0.1)] w-full max-w-4xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-12 py-10 border-b border-purple-500/10 bg-zinc-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Building2 className="w-40 h-40 text-purple-500" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2 block">Administración Central</span>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                {restaurant ? (
                  <>
                    Modificar <span className="text-zinc-600">Sede</span>
                  </>
                ) : (
                  <>
                    Nueva <span className="text-purple-500">Sede</span>
                  </>
                )}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-4 rounded-2xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-red-500/10 transition-all border border-zinc-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-12 space-y-12">

          {/* ① INFORMACIÓN BÁSICA */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Info className="w-5 h-5 text-purple-500" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Información Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}><Building2 className="w-3 h-3" /> Nombre del Restaurante *</label>
                <input
                  className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ej. La Cocina de Mario"
                  {...register('name', { required: 'Obligatorio' })}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}><ImageIcon className="w-3 h-3" /> Descripción de la Experiencia</label>
                <textarea
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Cuéntanos sobre el ambiente, especialidades..."
                  {...register('description')}
                />
              </div>

              <div>
                <label className={labelClass}><Utensils className="w-3 h-3" /> Categoría *</label>
                <select className={inputClass} {...register('category', { required: true })}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value} className="bg-zinc-950">{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}><Sparkles className="w-3 h-3" /> Tipo de Cocina</label>
                <input className={inputClass} placeholder="Ej. Italiana, Fusión" {...register('cuisine_type')} />
              </div>
            </div>
          </div>

          {/* ② CONTACTO Y UBICACIÓN */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <MapPin className="w-5 h-5 text-purple-500" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Contacto & Geografía</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}><MapPin className="w-3 h-3" /> Dirección Exacta *</label>
                <input
                  className={`${inputClass} ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="Ej. 5a Avenida 12-35, Zona 10"
                  {...register('address', { required: 'Obligatorio' })}
                />
              </div>

              <div>
                <label className={labelClass}><Phone className="w-3 h-3" /> Teléfono de Reservas *</label>
                <input className={inputClass} placeholder="Ej. 22345678" {...register('phone', { required: true })} />
              </div>

              <div>
                <label className={labelClass}><Mail className="w-3 h-3" /> Correo Corporativo</label>
                <input type="email" className={inputClass} placeholder="ventas@restaurante.com" {...register('email')} />
              </div>

              <div>
                <label className={labelClass}><Globe className="w-3 h-3" /> Portal Web</label>
                <input className={inputClass} placeholder="https://mirestaurante.com" {...register('website_url')} />
              </div>

              <div>
                <label className={labelClass}><ImageIcon className="w-3 h-3" /> Identidad Visual (Logo)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    {...register('logo')} 
                  />
                  <div className="w-full px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm font-bold flex items-center justify-between group-hover:border-purple-500 transition-all">
                    <span>{watch('logo')?.[0]?.name || 'Subir nuevo logo...'}</span>
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ③ OPERACIONES */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Clock className="w-5 h-5 text-purple-500" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Ritmo Operativo</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}><Clock className="w-3 h-3" /> Apertura</label>
                <input type="time" className={inputClass} {...register('opening_time', { required: true })} />
              </div>
              <div>
                <label className={labelClass}><Clock className="w-3 h-3" /> Cierre</label>
                <input type="time" className={inputClass} {...register('closing_time', { required: true })} />
              </div>
              <div>
                <label className={labelClass}><DollarSign className="w-3 h-3" /> Rango Precio</label>
                <select className={inputClass} {...register('price_range', { required: true })}>
                  <option value="$" className="bg-zinc-950">$ Económico</option>
                  <option value="$$" className="bg-zinc-950">$$ Moderado</option>
                  <option value="$$$" className="bg-zinc-950">$$$ Exclusivo</option>
                  <option value="$$$$" className="bg-zinc-950">$$$$ Luxury</option>
                </select>
              </div>
              <div>
                <label className={labelClass}><DollarSign className="w-3 h-3" /> Ticket Medio (Q)</label>
                <input type="number" step="0.01" className={inputClass} placeholder="150.00" {...register('average_price')} />
              </div>
              <div>
                <label className={labelClass}><Users className="w-3 h-3" /> Aforo Máx</label>
                <input type="number" className={inputClass} placeholder="50" {...register('capacity', { required: true })} />
              </div>
              <div>
                <label className={labelClass}><CheckCircle2 className="w-3 h-3" /> Propietario</label>
                <input 
                  className={`${inputClass} opacity-60 pointer-events-none`} 
                  value={user?.username || 'Cargando...'} 
                  readOnly 
                />
                <input type="hidden" {...register('admin_id')} />
              </div>
            </div>

            <div className="space-y-4">
              <label className={labelClass}><CalendarDays className="w-3 h-3" /> Calendario de Operación</label>
              <div className="flex flex-wrap gap-3">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      selectedDays.includes(d.value)
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ④ SERVICIOS */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-500" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Amenidades & Servicios</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'accepts_reservations', label: 'Reservas', icon: CalendarDays },
                { name: 'accepts_takeout', label: 'Takeout', icon: Utensils },
                { name: 'accepts_delivery', label: 'Delivery', icon: Globe },
                { name: 'parking_available', label: 'Parking', icon: Car },
                { name: 'wifi_available', label: 'WiFi', icon: Wifi },
                { name: 'outdoor_seating', label: 'Terraza', icon: Trees },
                { name: 'pet_friendly', label: 'Pets', icon: Dog },
                { name: 'wheelchair_accessible', label: 'Accesible', icon: Accessibility },
              ].map(({ name, label, icon: Icon }) => (
                <label key={name} className="flex items-center gap-4 p-5 rounded-[2rem] border border-zinc-800 bg-zinc-900/40 cursor-pointer hover:border-purple-500/40 transition-all group">
                  <input type="checkbox" className="w-5 h-5 accent-purple-600 rounded-lg" {...register(name)} />
                  <div className="flex flex-col">
                    <Icon className="w-4 h-4 text-purple-500 mb-1" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex items-center justify-end gap-6 pt-12 border-t border-purple-500/10">
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-10 py-5 rounded-3xl bg-purple-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-purple-600/20 hover:bg-purple-500 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4" /> 
                  {restaurant ? 'Actualizar Sistema' : 'Lanzar Restaurante'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
