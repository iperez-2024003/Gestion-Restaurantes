import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenuStore } from '../store/useMenuStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { MenuItemModal } from './MenuItemModal';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { MenuFlipCard } from '../../../shared/components/ui/MenuFlipCard';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import { 
  PlusCircle, 
  FolderPlus, 
  UtensilsCrossed, 
  ChevronLeft, 
  Loader2, 
  Settings, 
  Trash2,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const canManage = role === 'SUPER_ADMIN_ROLE' || role === 'RESTAURANT_ADMIN_ROLE';
  
  const { items, menus, loading, getMenus, getMenuItems, deleteMenuItem } = useMenuStore();
  const { restaurants, getRestaurants } = useRestaurantStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    if (id) {
      getMenus(id);
      getMenuItems(id);
      if (restaurants.length === 0) getRestaurants();
    }
  }, [id, getMenus, getMenuItems, getRestaurants, restaurants.length]);

  const handleDelete = async (itemId, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}"? Esta acción es permanente.`)) return;
    const result = await deleteMenuItem(itemId, id);
    if (result.success) showSuccess('Platillo eliminado');
    else showError(result.error);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleNewCategory = async () => {
    const name = window.prompt('Nombre de la nueva categoría (ej: Entradas, Bebidas):');
    if (!name) return;
    const result = await useMenuStore.getState().createCategory({
      name,
      restaurant_id: id
    });
    if (result.success) showSuccess('Categoría creada');
    else showError(result.error);
  };

  const filteredItems = activeCategory 
    ? items.filter(item => item.menu_id === activeCategory)
    : items;

  return (
    <div className="space-y-12 font-outfit animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-14 h-14 bg-zinc-900/40 rounded-2xl border border-purple-500/10 text-zinc-500 hover:text-purple-400 hover:border-purple-500/30 transition-all flex items-center justify-center shadow-xl group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-1">{restaurant?.name || 'Gestión Maestro'}</span>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Menú <span className="text-zinc-600 italic">Digital</span></h1>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {canManage && (
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewCategory}
                className="px-8 py-4 bg-zinc-900/40 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:text-white hover:border-purple-500/30 transition-all flex items-center gap-3"
              >
                <FolderPlus className="w-4 h-4 text-purple-500" /> Categoría
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNew}
                className="px-8 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-3 border border-purple-400/20"
              >
                <PlusCircle className="w-4 h-4" /> Añadir Platillo
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Categorías (Filtros) */}
      <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 border whitespace-nowrap ${
            !activeCategory 
              ? 'bg-purple-600 text-white border-purple-400 shadow-2xl shadow-purple-600/20' 
              : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
        >
          <LayoutGrid className="w-3 h-3" /> Catálogo Completo
        </button>
        {menus.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveCategory(m.id)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 border ${
              activeCategory === m.id 
                ? 'bg-purple-600 text-white border-purple-400 shadow-2xl shadow-purple-600/20' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Grid de Platillos */}
      <div className="min-h-[500px]">
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Sincronizando Inventario...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 bg-zinc-900/10 rounded-[4rem] border border-dashed border-zinc-800/50"
          >
            <Sparkles className="w-16 h-16 text-zinc-800 mb-8" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Cocina en Preparación</h3>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">No hay ítems registrados bajo esta categoría.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MenuFlipCard 
                    title={item.name}
                    category={menus.find(m => m.id === item.menu_id)?.name || 'Especialidad'}
                    price={`Q${item.price}`}
                    time="15-20 Min"
                    servings="1 Persona"
                    image={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                  />
                  
                  {canManage && (
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-12 h-12 bg-zinc-950/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl hover:bg-purple-600 transition-all border border-zinc-800 flex items-center justify-center"
                        title="Configurar Platillo"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="w-12 h-12 bg-rose-600/10 backdrop-blur-xl text-rose-500 rounded-2xl shadow-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center"
                        title="Eliminar del Menú"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedItem(null); }}
        item={selectedItem}
        restaurantId={id}
      />
    </div>
  );
};
