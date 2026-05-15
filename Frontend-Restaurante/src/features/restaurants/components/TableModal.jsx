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
  Hash,
  Sparkles
} from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fefcf8] rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 border border-primary-200 shadow-gold w-full max-w-lg relative my-auto"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2 block">Gestión de Aforo</span>
            <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tighter uppercase leading-none">
              {table ? 'Editar Mesa' : 'Nueva Mesa'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Nº de Mesa"
              type="number"
              icon={Hash}
              placeholder="Ejem: 1, 2, 3..."
              value={formData.table_number}
              onChange={(e) => handleChange('table_number', e.target.value)}
              required
            />
            <Input
              label="Capacidad"
              type="number"
              icon={Users}
              min="1"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1">Ubicación en Salón</label>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-brown group-focus-within:text-primary-500 transition-colors" />
              <select
                name="location"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#fffdf9] border border-[#dcc7a5] text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              >
                <option value="interior">Interior Principal</option>
                <option value="terrace">Terraza / Exterior</option>
                <option value="window">Frente a Ventana</option>
                <option value="vip">Zona VIP</option>
                <option value="private">Salón Privado</option>
                <option value="bar">Área de Bar</option>
              </select>
            </div>
          </div>

          <Input
            label="Piso / Nivel"
            type="number"
            icon={Layers}
            value={formData.floor}
            onChange={(e) => handleChange('floor', e.target.value)}
          />

          <div className="flex gap-4 pt-6">
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
              className="flex-1 py-5 rounded-3xl shadow-gold"
            >
              <Save className="w-4 h-4 mr-2" />
              {table ? 'Actualizar' : 'Registrar Mesa'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
