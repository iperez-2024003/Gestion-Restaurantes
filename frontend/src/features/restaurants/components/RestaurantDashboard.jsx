import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axios';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { AnalyticsCard } from '../../../shared/components/ui/AnalyticsCard';
import { Utensils, Users, LayoutDashboard, Rocket, DollarSign, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-rose-500/20">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Fallo de Vinculación</h2>
        <p className="text-zinc-500 mt-2 max-w-md font-medium">
          {error}. <br/>
          Tu cuenta está asociada al ID <span className="text-purple-500">{user?.restaurantId}</span>, el cual no parece existir en el sistema actual.
        </p>
        <button 
          onClick={() => navigate('/dashboard/restaurants')} 
          className="mt-8 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-purple-500 shadow-2xl shadow-purple-500/20 transition-all"
        >
          Volver a Selección de Sedes
        </button>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-purple-500/10">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sin restaurante asignado</h2>
        <p className="text-zinc-500 mt-2 max-w-md font-medium">
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
             <div className="w-2 h-8 bg-purple-600 rounded-full" />
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
               {restaurant?.name || 'Dashboard'}
             </h1>
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Resumen Operativo en Tiempo Real</p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-xl p-4 rounded-3xl border border-purple-500/10">
           <div className="text-right">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Estado</p>
              <p className="text-emerald-500 font-black uppercase text-xs">En Línea / Activo</p>
           </div>
           <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-500" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-3xl border border-purple-500/20 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            <div className="max-w-md text-center md:text-left">
              <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                 <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                    <DollarSign className="w-8 h-8 text-purple-400" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tighter uppercase leading-tight">Métricas de <br/><span className="text-purple-500">Rendimiento</span></h2>
              </div>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px] leading-loose mb-10 max-w-sm">
                Monitorea el flujo de capital y la eficiencia operativa de tu sede en tiempo real.
              </p>
              <a 
                href={`/dashboard/restaurants/${id}/analytics`}
                className="inline-flex items-center gap-3 bg-purple-600 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-purple-500 active:scale-95 transition-all shadow-2xl shadow-purple-500/20 uppercase tracking-[0.2em] text-[10px] border border-purple-400/20"
              >
                Auditar Analíticas <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex flex-col gap-6 w-full md:w-auto">
              <div className="bg-black/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-zinc-800 text-center min-w-[240px] group-hover:border-purple-500/30 transition-colors">
                <p className="text-6xl font-black mb-2 tracking-tighter text-white">Q{stats?.summary?.today_revenue || 0}</p>
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em]">Ingresos Brutos Hoy</p>
              </div>
              <div className="bg-black/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-zinc-800 text-center min-w-[240px] group-hover:border-purple-500/30 transition-colors">
                <p className="text-6xl font-black mb-2 tracking-tighter text-zinc-500">{stats?.summary?.today_orders || 0}</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Volumen de Órdenes</p>
              </div>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>

        {/* Quick Info Card */}
        <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] p-10 border border-purple-500/10 flex flex-col justify-between">
           <div>
              <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30">
                 <ShoppingBag className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Estatus de Marca</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rating</span>
                    <span className="text-white font-black">{stats?.basic_info?.rating || '0.0'} ⭐</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Categoría</span>
                    <span className="text-purple-400 font-black uppercase text-[10px]">{stats?.basic_info?.category || 'General'}</span>
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
