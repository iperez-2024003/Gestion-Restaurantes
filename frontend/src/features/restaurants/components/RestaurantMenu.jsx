import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenuStore } from '../store/useMenuStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { MenuItemModal } from './MenuItemModal';
import { CategoryModal } from './CategoryModal';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { MenuFlipCard } from '../../../shared/components/ui/MenuFlipCard';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import UnifiedButton from '../../../shared/components/ui/UnifiedButton';
import LoadingSpinner from '../../../shared/components/states/LoadingSpinner';
import { 
  PlusCircle, 
  FolderPlus, 
  UtensilsCrossed, 
  ChevronLeft, 
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
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
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

  const handleNewCategory = () => {
    setCategoryModalOpen(true);
  };

  const filteredItems = activeCategory 
    ? items.filter(item => item.menu_id === activeCategory)
    : items;

  return (
    <div className="space-y-12 font-outfit animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <UnifiedButton
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            size="md"
            className="w-14 h-14 p-0 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </UnifiedButton>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-1">{restaurant?.name || 'Gestión Maestro'}</span>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Menú <span className="text-zinc-600 italic">Digital</span></h1>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {canManage && (
            <>
              <UnifiedButton
                onClick={handleNewCategory}
                variant="outline"
                size="md"
                icon={FolderPlus}
              >
                Categoría
              </UnifiedButton>
              <UnifiedButton
                onClick={handleNew}
                variant="primary"
                size="md"
                icon={PlusCircle}
              >
                Añadir Platillo
              </UnifiedButton>
            </>
          )}
        </div>
      </div>

      {/* Categorías (Filtros) */}
      <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800">
        <UnifiedButton
          onClick={() => setActiveCategory(null)}
          variant={!activeCategory ? 'primary' : 'outline'}
          size="md"
          icon={LayoutGrid}
          className="whitespace-nowrap"
        >
          Catálogo Completo
        </UnifiedButton>
        {menus.map((m) => (
          <UnifiedButton
            key={m.id}
            onClick={() => setActiveCategory(m.id)}
            variant={activeCategory === m.id ? 'primary' : 'outline'}
            size="md"
            className="whitespace-nowrap"
          >
            {m.name}
          </UnifiedButton>
        ))}
      </div>

      {/* Grid de Platillos */}
      <div className="min-h-[300px] md:min-h-[500px]">
        {loading ? (
          <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center gap-6">
            <LoadingSpinner size="lg" text="Sincronizando Inventario..." />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-12">
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
                    image={getImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                  />
                  
                  {canManage && (
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-x-4 group-hover:translate-x-0">
                      <UnifiedButton
                        onClick={() => handleEdit(item)}
                        variant="outline"
                        size="sm"
                        className="w-12 h-12 p-0 bg-zinc-950/90 backdrop-blur-xl text-white"
                        title="Configurar Platillo"
                        icon={Settings}
                      >
                      </UnifiedButton>
                      <UnifiedButton
                        onClick={() => handleDelete(item.id, item.name)}
                        variant="danger"
                        size="sm"
                        className="w-12 h-12 p-0 bg-rose-600/10 backdrop-blur-xl text-rose-500"
                        title="Eliminar del Menú"
                        icon={Trash2}
                      >
                      </UnifiedButton>
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

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        restaurantId={id}
      />
    </div>
  );
};
