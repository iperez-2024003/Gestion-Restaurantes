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
  const inputClass = "w-full px-6 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl font-outfit overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-950 rounded-[3.5rem] border border-purple-500/20 shadow-2xl w-full max-w-xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-purple-500/10 flex items-center justify-between bg-zinc-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Utensils className="w-24 h-24 text-purple-500" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1 block">Gestión de Menú</span>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              {item ? (
                <>
                  Modificar <span className="text-zinc-600">Plato</span>
                </>
              ) : (
                <>
                  Nuevo <span className="text-purple-500">Plato</span>
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

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Imagen / Preview */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-48 h-48 bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden group relative transition-all hover:border-purple-500/50">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <Utensils className="w-12 h-12 text-zinc-800 group-hover:text-purple-500/50 transition-colors" />
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase tracking-widest gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`${inputClass} resize-none min-h-[100px]`}
                placeholder="Ingredientes premium, alérgenos, preparación..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
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
              className="flex-1 py-5 rounded-3xl bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-purple-600/20 hover:bg-purple-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
