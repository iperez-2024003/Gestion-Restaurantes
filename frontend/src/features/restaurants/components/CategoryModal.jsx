import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus,
  Type,
  X,
  Loader2,
  Zap
} from 'lucide-react';

export const CategoryModal = ({ isOpen, onClose, restaurantId }) => {
  const { createCategory, loading } = useMenuStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('El nombre de la categoría es obligatorio');
      return;
    }

    const result = await createCategory({
      name: name.trim(),
      restaurant_id: restaurantId
    });

    if (result.success) {
      showSuccess('Categoría creada');
      onClose();
    } else {
      showError(result.error);
    }
  };

  const labelClass = "flex items-center gap-2 text-[10px] font-black text-zinc-500 mb-2 uppercase tracking-[0.2em] ml-1";
  const inputClass = "w-full px-6 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl font-outfit overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-zinc-950 rounded-[3.5rem] border border-purple-500/20 shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-10 py-8 border-b border-purple-500/10 flex items-center justify-between bg-zinc-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <FolderPlus className="w-24 h-24 text-purple-500" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1 block">Gestión de Menú</span>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                Nueva <span className="text-purple-500">Categoría</span>
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
            <div>
              <label className={labelClass}><Type className="w-3 h-3" /> Nombre de la Categoría</label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="ej: Entradas, Bebidas..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
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
                disabled={loading || !name.trim()}
                className="flex-1 py-5 rounded-3xl bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-purple-600/20 hover:bg-purple-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Zap className="w-4 h-4" />
                    Crear Categoría
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
