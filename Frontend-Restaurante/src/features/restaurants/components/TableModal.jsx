import { useState, useEffect } from 'react';
import { useTableStore } from '../store/useTableStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Layers, 
  X, 
  Save, 
  Loader2,
  Hash,
  Sparkles
} from 'lucide-react';

export const TableModal = ({ isOpen, onClose, table = null, restaurantId }) => {
  const { createTable, updateTable, loading } = useTableStore();
  
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 2,
    location: 'interior',
    floor: 1,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location,
        floor: table.floor,
      });
    } else {
      setFormData({
        table_number: '',
        capacity: 2,
        location: 'interior',
        floor: 1,
      });
    }
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      restaurant_id: restaurantId,
      table_number: parseInt(formData.table_number),
      capacity: parseInt(formData.capacity),
      floor: parseInt(formData.floor),
    };

    const result = table 
      ? await updateTable(table.id, data)
      : await createTable(data);

    if (result.success) {
      showSuccess(table ? 'Mesa actualizada exitosamente' : 'Mesa registrada en el sistema');
      onClose();
    } else {
      showError(result.error);
    }
  };

  const labelClass = "flex items-center gap-2 text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-[0.2em] ml-1";
  const inputClass = "w-full px-6 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/20 focus:border-[#d7b77f] transition-all text-sm font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 rounded-[3.5rem] border border-[#dcc7a5]/20 shadow-2xl w-full max-w-lg md:max-w-md overflow-hidden relative"
      >
        {/* Header */}
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-[#dcc7a5]/10 flex items-center justify-between bg-zinc-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <LayoutDashboard className="w-24 h-24 text-[#b98c52]" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-1 block">Gestión de Aforo</span>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              {table ? (
                <>
                  Mesa <span className="text-zinc-600">{table.table_number}</span>
                </>
              ) : (
                <>
                  Nueva <span className="text-[#b98c52]">Mesa</span>
                </>
              )}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 p-3 rounded-xl bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-red-500/10 transition-all border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className={labelClass}><Hash className="w-3 h-3" /> Nº de Mesa</label>
              <input
                name="table_number"
                type="number"
                required
                className={inputClass}
                placeholder="1, 2, 3..."
                value={formData.table_number}
                onChange={handleChange}
              />
            </div>
            <div className="group">
              <label className={labelClass}><Users className="w-3 h-3" /> Capacidad</label>
              <input
                name="capacity"
                type="number"
                required
                min="1"
                className={inputClass}
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="group">
            <label className={labelClass}><MapPin className="w-3 h-3" /> Ubicación en Salón</label>
            <select
              name="location"
              className={inputClass}
              value={formData.location}
              onChange={handleChange}
            >
              <option value="interior" className="bg-zinc-950">Interior Principal</option>
              <option value="terrace" className="bg-zinc-950">Terraza / Exterior</option>
              <option value="window" className="bg-zinc-950">Frente a Ventana</option>
              <option value="vip" className="bg-zinc-950">Zona VIP</option>
              <option value="private" className="bg-zinc-950">Salón Privado</option>
              <option value="bar" className="bg-zinc-950">Área de Bar</option>
            </select>
          </div>

          <div className="group">
            <label className={labelClass}><Layers className="w-3 h-3" /> Piso / Nivel</label>
            <input
              name="floor"
              type="number"
              className={inputClass}
              value={formData.floor}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 rounded-3xl border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-zinc-900 transition-all"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-5 rounded-3xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[rgba(185,140,82,0.2)] hover:to-[#a97d45] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4" />
                  {table ? 'Actualizar' : 'Registrar Mesa'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
