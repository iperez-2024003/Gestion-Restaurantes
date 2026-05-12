import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  Sparkles,
  Loader2,
  FileText,
  Rocket
} from 'lucide-react';
import { translateEventType } from '../../../shared/utils/i18n';

const EVENT_TYPES = [
  'tasting',
  'cooking_class',
  'wine_pairing',
  'theme_dinner',
  'festival',
  'promotion',
  'live_music',
  'other',
];

const inputClass = 'w-full px-6 py-4 rounded-2xl bg-[#fffaf3] border border-[#dcc7a5] text-zinc-900 placeholder-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/25 focus:border-[#b98c52] transition-all text-sm font-medium';
const labelClass = 'flex items-center gap-2 text-[10px] font-black text-zinc-900 mb-2 uppercase tracking-[0.2em] ml-1';

export const EventModal = ({ isOpen, onClose, onSubmit, creating, initialData = null }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    event_type: 'theme_dinner',
    event_date: '',
    start_time: '19:00',
    end_time: '22:00',
    max_participants: 20,
    price_per_person: 0,
    image_url: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        event_type: initialData.event_type || 'theme_dinner',
        event_date: initialData.event_date || '',
        start_time: initialData.start_time?.slice(0, 5) || '19:00',
        end_time: initialData.end_time?.slice(0, 5) || '22:00',
        max_participants: initialData.max_participants || 20,
        price_per_person: initialData.price_per_person || 0,
        image_url: initialData.image_url || initialData.imageUrl || '',
      });
      setImagePreview(initialData.image_url || initialData.imageUrl || '');
      setImageFile(null);
    } else {
      setForm({
        name: '',
        description: '',
        event_type: 'theme_dinner',
        event_date: '',
        start_time: '19:00',
        end_time: '22:00',
        max_participants: 20,
        price_per_person: 0,
        image_url: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBannerChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result?.toString() || '';
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...form };
    
    // Si hay una nueva imagen cargada localmente, usamos el preview (Base64)
    // para evitar el uso de FormData que el backend de eventos no soporta actualmente
    if (imageFile && imagePreview) {
      submitData.image_url = imagePreview;
    }
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f7f1e7]/90 backdrop-blur-xl flex justify-center items-center z-50 p-4 font-outfit overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/90 rounded-[2.5rem] md:rounded-[3.5rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-[#dcc7a5]/70 bg-[#fffaf3] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Sparkles className="w-40 h-40 text-[#b98c52]" />
          </div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-2 block">Programación de Experiencias</span>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
                {initialData ? (
                  <>
                    Editar <span className="text-[#8b6435]">Evento</span>
                  </>
                ) : (
                  <>
                    Nueva <span className="text-[#b98c52]">Experiencia</span>
                  </>
                )}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-4 rounded-2xl bg-[#fffaf3] text-zinc-500 hover:text-zinc-900 transition-all border border-[#dcc7a5]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 md:p-10 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <label className={labelClass}><FileText className="w-3 h-3" /> Nombre del Evento</label>
              <input 
                value={form.name} 
                onChange={(e) => updateForm('name', e.target.value)} 
                placeholder="Ej. Gala de Vinos Reserva" 
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}><Sparkles className="w-3 h-3" /> Categoría</label>
              <select 
                value={form.event_type} 
                onChange={(e) => updateForm('event_type', e.target.value)}
                className={inputClass}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-zinc-950">{translateEventType(type)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}><Calendar className="w-3 h-3" /> Fecha del Evento</label>
              <input 
                type="date" 
                value={form.event_date} 
                onChange={(e) => updateForm('event_date', e.target.value)} 
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}><Clock className="w-3 h-3" /> Hora de Inicio</label>
              <input 
                type="time" 
                value={form.start_time} 
                onChange={(e) => updateForm('start_time', e.target.value)} 
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}><Clock className="w-3 h-3" /> Hora de Finalización</label>
              <input 
                type="time" 
                value={form.end_time} 
                onChange={(e) => updateForm('end_time', e.target.value)} 
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}><Users className="w-3 h-3" /> Capacidad (Pax)</label>
              <input 
                type="number" 
                value={form.max_participants} 
                onChange={(e) => updateForm('max_participants', e.target.value)} 
                className={inputClass}
                min={1}
              />
            </div>

            <div>
              <label className={labelClass}><DollarSign className="w-3 h-3" /> Precio por Persona (Q)</label>
              <input 
                type="number" 
                value={form.price_per_person} 
                onChange={(e) => updateForm('price_per_person', e.target.value)} 
                className={inputClass}
                min={0}
              />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <label className={labelClass}><ImageIcon className="w-3 h-3" /> Banner del Evento</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#dcc7a5] bg-[#fffaf3] px-6 py-8 text-center transition-all hover:border-[#b98c52] hover:bg-white">
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8b6435]">Subir imagen desde tu equipo</span>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">JPG, PNG o WEBP</span>
              </label>
              {imagePreview && (
                <div className="overflow-hidden rounded-[2rem] border border-[#dcc7a5] bg-white shadow-sm">
                  <img src={imagePreview} alt="Vista previa del banner" className="h-52 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}><FileText className="w-3 h-3" /> Descripción Detallada</label>
              <textarea 
                value={form.description} 
                onChange={(e) => updateForm('description', e.target.value)} 
                placeholder="Describe la experiencia para tus clientes..." 
                className={`${inputClass} min-h-[120px] resize-none`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 md:gap-6 pt-8 border-t border-[#dcc7a5]/70">
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
              disabled={creating}
              className="px-10 py-5 rounded-3xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-[rgba(185,140,82,0.18)] hover:to-[#a97d45] transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-[#d7b77f]/30"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Rocket className="w-4 h-4" /> 
                  {initialData ? 'Actualizar Evento' : 'Publicar Experiencia'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
