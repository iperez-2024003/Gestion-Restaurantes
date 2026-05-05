import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { AnalyticsCard } from '../../../shared/components/ui/AnalyticsCard';
import { Utensils, Users, LayoutDashboard, Rocket, DollarSign, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../../shared/components/states/LoadingSpinner';
import ErrorState from '../../../shared/components/states/ErrorState';
import UnifiedButton from '../../../shared/components/ui/UnifiedButton';

export const RestaurantDashboard = () => {
  const { id } = useParams();
  const { restaurants } = useRestaurantStore();
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    // Si el usuario es Staff o Gerente y está en un ID que no es el suyo, redirigir automáticamente
    if ((role === 'STAFF_ROLE' || role === 'RESTAURANT_ADMIN_ROLE') && user?.restaurantId && id !== user.restaurantId) {
       navigate(`/dashboard/restaurants/${user.restaurantId}`, { replace: true });
       return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        // Usar el endpoint mejorado de estadísticas
        const res = await api.get(`/statistics/restaurant/${id}/overview`);
        setStats(res.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.response?.status === 404) {
          setError('El restaurante solicitado no existe o ha sido eliminado.');
        } else {
          setError(error.response?.data?.message || 'Error al cargar estadísticas');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStats();
  }, [id, role, user?.restaurantId, navigate]);

    if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando Dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorState
          title="Fallo de Vinculación"
          message={`${error}. Tu cuenta está asociada al ID ${user?.restaurantId}, el cual no parece existir.`}
          actionLabel="Volver a Selección"
          onAction={() => navigate('/dashboard/restaurants')}
          fullPage={false}
        />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/10">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Sin restaurante asignado</h2>
        <p className="text-zinc-600 mt-2 max-w-md font-medium">
          Tu cuenta aún no está vinculada a un establecimiento específico. 
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-8 bg-[#b98c52] rounded-full" />
             <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">
               {restaurant?.name || 'Dashboard'}
             </h1>
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Resumen Operativo en Tiempo Real</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-[#dcc7a5]/10">
           <div className="text-right">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estado</p>
              <p className="text-emerald-500 font-black uppercase text-xs">En Línea / Activo</p>
           </div>
           <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-500" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <AnalyticsCard 
          title="Mesas Totales" 
          value={stats?.summary?.tables || 0} 
          percentage="+5.2%" 
          icon={LayoutDashboard}
          chartData={[30, 45, 60, 40, 70, 50, 80]}
        />
        <AnalyticsCard 
          title="Platos en Menú" 
          value={stats?.summary?.dishes || 0} 
          percentage="+12.4%" 
          icon={Utensils}
          chartData={[50, 40, 70, 85, 60, 90, 75]}
        />
        <AnalyticsCard 
          title="Personal Activo" 
          value={stats?.summary?.staff || 0} 
          percentage="Estable" 
          icon={Users}
          chartData={[80, 80, 80, 80, 80, 80, 80]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Banner */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-3xl border border-[#dcc7a5]/20 rounded-[3rem] p-12 text-zinc-900 relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            <div className="max-w-md text-center md:text-left">
              <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                  <div className="w-14 h-14 bg-[#f3e4ca] rounded-2xl flex items-center justify-center border border-[#dcc7a5]/30">
                    <DollarSign className="w-8 h-8 text-[#b98c52]" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight">Métricas de <br/><span className="text-[#b98c52]">Rendimiento</span></h2>
              </div>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] leading-loose mb-10 max-w-sm">
                Monitorea el flujo de capital y la eficiencia operativa de tu sede en tiempo real.
              </p>
              <UnifiedButton
                variant="primary"
                size="md"
                icon={ChevronRight}
                onClick={() => navigate(`/dashboard/restaurants/${id}/analytics`)}
              >
                Auditar Analíticas
              </UnifiedButton>
            </div>
            
            <div className="flex flex-col gap-6 w-full md:w-auto">
              <div className="bg-white/70 backdrop-blur-xl p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-[#dcc7a5] text-center min-w-[160px] md:min-w-[240px] transition-colors">
                <p className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-zinc-900">Q{stats?.summary?.today_revenue || 0}</p>
                <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em]">Ingresos Brutos Hoy</p>
              </div>
              <div className="bg-white/70 backdrop-blur-xl p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-[#dcc7a5] text-center min-w-[160px] md:min-w-[240px] transition-colors">
                <p className="text-4xl md:text-6xl font-black mb-2 tracking-tighter text-zinc-900">{stats?.summary?.today_orders || 0}</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Volumen de Órdenes</p>
              </div>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#d7b77f]/5 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>

        {/* Quick Info Card */}
        <div className="bg-[#fffaf3]/60 backdrop-blur-3xl rounded-[3rem] p-10 border border-[#dcc7a5] flex flex-col justify-between">
           <div>
              <div className="w-16 h-16 bg-[#d7b77f]/20 rounded-2xl flex items-center justify-center mb-8 border border-[#dcc7a5]/30">
                 <ShoppingBag className="w-8 h-8 text-[#b98c52]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Estatus de Marca</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rating</span>
                    <span className="text-white font-black">{stats?.basic_info?.rating || '0.0'} ⭐</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Categoría</span>
                    <span className="text-[#b98c52] font-black uppercase text-[10px]">{stats?.basic_info?.category || 'General'}</span>
                 </div>
              </div>
           </div>
           
           <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-8 text-center italic">
              Actualizado: {new Date().toLocaleTimeString()}
           </p>
        </div>
      </div>
    </motion.div>
  );
};
