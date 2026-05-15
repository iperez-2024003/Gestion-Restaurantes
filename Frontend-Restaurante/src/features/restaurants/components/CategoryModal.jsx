import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus,
  Type,
  X,
  Zap
} from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md overflow-y-auto font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fefcf8] rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 border border-primary-200 shadow-gold w-full max-w-md relative my-auto"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2 block">Gestión de Menú</span>
            <h2 className="text-3xl font-black text-ink tracking-tighter uppercase leading-none">
              Nueva <span className="text-primary-500">Categoría</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-2xl bg-primary-100 text-primary-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            label="Nombre de la Categoría"
            icon={Type}
            placeholder="ej: Entradas, Bebidas..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 py-5 rounded-3xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              disabled={!name.trim()}
              className="flex-1 py-5 rounded-3xl shadow-gold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Crear Categoría
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
