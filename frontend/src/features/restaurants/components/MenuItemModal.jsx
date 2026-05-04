import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  DollarSign, 
  Package, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Save, 
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';

export const MenuItemModal = ({ isOpen, onClose, item = null, restaurantId }) => {
  const { menus, getMenus, createMenuItem, updateMenuItem, loading } = useMenuStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    menu_id: '',
    stock_quantity: 10,
    image: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isOpen && restaurantId) {
      getMenus(restaurantId);
    }
  }, [isOpen, restaurantId, getMenus]);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        menu_id: item.menu_id || '',
        stock_quantity: item.stock_quantity ?? 10,
        image: null,
      });
      setPreview(getImageUrl(item.image_url));
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        menu_id: '',
        stock_quantity: 10,
        image: null,
      });
      setPreview(null);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.menu_id) {
      showError('Debes seleccionar una categoría para el platillo');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock_quantity', formData.stock_quantity);
    data.append('menu_id', formData.menu_id);
    data.append('restaurant_id', restaurantId);
    if (formData.image) {
      data.append('image', formData.image);
    }

    const result = item 
      ? await updateMenuItem(item.id, data)
      : await createMenuItem(data);

    if (result.success) {
      showSuccess(result.message);
      onClose();
    } else {
      showError(result.error);
    }
  };

  const labelClass = "flex items-center gap-2 text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-[0.2em] ml-1";
  const inputClass = "w-full px-6 py-4 rounded-2xl bg-[#fffaf3] border border-[#dcc7a5] text-zinc-900 placeholder-zinc-600 focus:bg-[#fffaf3] focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/20 focus:border-[#d7b77f] transition-all text-sm font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000066] backdrop-blur-xl font-outfit overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fffaf3] rounded-[2rem] border border-[#dcc7a5] shadow-2xl w-full max-w-xl md:max-w-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="px-6 md:px-10 py-4 md:py-8 border-b border-[#dcc7a5]/10 flex items-center justify-between bg-[#f3e4ca]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Utensils className="w-24 h-24 text-[#b98c52]" />
          </div>
          <div className="relative z-10">
            <span className="text-[9px] md:text-[10px] font-black text-[#b98c52] uppercase tracking-[0.35em] mb-1 block">Gestión de Menú</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tighter uppercase">
              {item ? (
                <>
                  Modificar <span className="text-zinc-600">Plato</span>
                </>
              ) : (
                <>
                  Nuevo <span className="text-[#b98c52]">Plato</span>
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
          {/* Imagen / Preview */}
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="w-36 h-36 md:w-48 md:h-48 bg-[#fffaf3] rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-[#dcc7a5] flex items-center justify-center overflow-hidden group relative transition-all hover:border-[#d7b77f]">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <Utensils className="w-10 h-10 md:w-12 md:h-12 text-[#dcc7a5] group-hover:text-[#b98c52] transition-colors" />
              )}
              <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-zinc-900 text-[10px] font-black uppercase tracking-widest gap-2">
                <ImageIcon className="w-5 h-5 text-[#b98c52]" />
                Cargar Imagen
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Resolución Sugerida: 800x800px</p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className={labelClass}><Sparkles className="w-3 h-3" /> Nombre del Platillo</label>
              <input
                name="name"
                required
                className={inputClass}
                placeholder="ej: Hamburguesa Suprema"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className={labelClass}><DollarSign className="w-3 h-3" /> Precio (Q)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  className={inputClass}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={labelClass}><Package className="w-3 h-3" /> Stock</label>
                <input
                  name="stock_quantity"
                  type="number"
                  min="0"
                  required
                  className={inputClass}
                  placeholder="100"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}><Tag className="w-3 h-3" /> Categoría del Menú</label>
              <select
                name="menu_id"
                required
                className={inputClass}
                value={formData.menu_id}
                onChange={handleChange}
              >
                <option value="" className="bg-zinc-950">Seleccionar categoría...</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-950">{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}><FileText className="w-3 h-3" /> Descripción Detallada</label>
              <textarea
                name="description"
                rows="3"
                className={`${inputClass} resize-none min-h-[90px] md:min-h-[100px]`}
                placeholder="Ingredientes premium, alérgenos, preparación..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 md:py-5 rounded-3xl border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-zinc-900 transition-all"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-3 md:py-5 rounded-3xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[rgba(185,140,82,0.06)] hover:to-[#a97d45] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Zap className="w-4 h-4" />
                  {item ? 'Guardar Cambios' : 'Publicar Plato'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
