import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  DownloadCloud, 
  Loader2, 
  BarChart3,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { getOrdersStats, getPopularDishes, getRestaurantOverview, exportOrdersExcelUrl } from '../../../shared/api/statistics';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';

const COLORS = ['#A855F7', '#6366F1', '#8B5CF6', '#4F46E5', '#D8B4FE'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export const AnalyticsDashboard = () => {
  const { id } = useParams();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    overview: null,
    orders: [],
    popularDishes: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, ordersRes, dishesRes] = await Promise.all([
          getRestaurantOverview(id),
          getOrdersStats(id, 'month'),
          getPopularDishes(id, 5)
        ]);

        setStats({
          overview: overviewRes.data?.overview,
          orders: ordersRes.data?.data || [],
          popularDishes: dishesRes.data?.dishes || []
        });
      } catch (error) {
        showError('No se pudo cargar la analítica premium.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await fetch(exportOrdersExcelUrl(id), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Gourmet_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showSuccess('Inteligencia de negocios exportada');
    } catch (err) {
      showError('Error al generar el reporte premium');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-outfit">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <p className="mt-8 text-zinc-500 font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Calculando Métricas Premium...</p>
      </div>
    );
  }

  const { overview, orders, popularDishes } = stats;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 pb-20 font-outfit"
    >
      {/* ── HEADER ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] mb-2">Business Intelligence</p>
           <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Operational <span className="text-zinc-600">Performance</span></h1>
        </div>
        
        <button 
          onClick={handleExportExcel}
          disabled={exporting}
          className={`group flex items-center gap-4 px-8 py-4 rounded-2xl font-black transition-all border ${
            exporting 
            ? 'bg-zinc-900 text-zinc-500 border-zinc-800' 
            : 'bg-zinc-950 text-white border-purple-500/20 hover:border-purple-500 hover:bg-purple-600/10 shadow-2xl'
          } text-[10px] uppercase tracking-widest`}
        >
          {exporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <DownloadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          )}
          {exporting ? 'Generando Reporte...' : 'Exportar Auditoría (.xlsx)'}
        </button>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {[
          { label: 'Ingresos Hoy', value: `Q${overview?.today?.revenue || 0}`, icon: DollarSign, color: 'purple' },
          { label: 'Órdenes Hoy', value: overview?.today?.orders || 0, icon: ShoppingBag, color: 'indigo' },
          { label: 'Reservas Hoy', value: overview?.today?.reservations || 0, icon: Users, color: 'purple' },
          { label: 'Total Histórico', value: `Q${overview?.all_time?.total_revenue || 0}`, icon: TrendingUp, color: 'indigo' }
        ].map((kpi, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            className="bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-purple-500/5 hover:border-purple-500/20 transition-all group relative overflow-hidden"
          >
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${kpi.color}-500/5 rounded-full blur-2xl group-hover:bg-${kpi.color}-500/10 transition-all`} />
            <div className="relative z-10 flex flex-col gap-6">
              <div className={`w-14 h-14 bg-zinc-950 border border-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter leading-none">{kpi.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Revenue Area Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-zinc-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-purple-500/10 lg:col-span-2 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
               <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Crecimiento Mensual</p>
               <h2 className="text-2xl font-black text-white tracking-tight uppercase">Rendimiento <span className="text-zinc-600">Comercial</span></h2>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 text-[10px] font-black uppercase tracking-widest">
              <Activity className="w-4 h-4" />
              +14.2% Eficiencia
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orders} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#27272a" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  stroke="#52525b" 
                  fontSize={10} 
                  fontWeight="900"
                  tickMargin={15} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  stroke="#52525b" 
                  fontSize={10} 
                  fontWeight="900"
                  tickFormatter={(value) => `Q${value}`} 
                />
                <Tooltip 
                  cursor={{ stroke: '#A855F7', strokeWidth: 2, strokeDasharray: '8 8' }}
                  contentStyle={{ 
                    backgroundColor: '#09090b',
                    borderRadius: '24px', 
                    border: '1px solid rgba(168, 85, 247, 0.2)', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: '900', fontSize: '14px', color: '#fff' }}
                  labelStyle={{ marginBottom: '8px', color: '#a855f7', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                  formatter={(value) => [`Q${parseFloat(value).toFixed(2)}`, 'Ventas']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#A855F7" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Popular Dishes Donut Chart */}
        <motion.div 
          variants={itemVariants}
          className="bg-zinc-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-purple-500/10 shadow-2xl flex flex-col"
        >
          <div className="mb-10">
             <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Top de Ventas</p>
             <h2 className="text-2xl font-black text-white tracking-tight uppercase">Platillos <span className="text-zinc-600">Estrella</span></h2>
          </div>

          <div className="h-[350px] w-full relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={popularDishes}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={10}
                  dataKey="total_quantity"
                  nameKey="menu_item.name"
                  stroke="none"
                >
                  {popularDishes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#09090b',
                    borderRadius: '20px', 
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                  formatter={(value) => [`${value} pedidos`, 'Vendido']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Unid.</span>
              <span className="text-4xl font-black text-white tracking-tighter">
                {popularDishes.reduce((acc, curr) => acc + Number(curr.total_quantity), 0)}
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── ADDITIONAL STATS ─────────────────────────────────────────────────────── */}
      <motion.div 
        variants={itemVariants}
        className="bg-zinc-950 border border-purple-500/10 p-12 rounded-[4rem] text-white overflow-hidden relative shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left max-w-xl">
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-4 leading-none">Inteligencia <span className="text-zinc-600">Operativa</span></h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs leading-loose">Optimiza tu inventario y maximiza la rentabilidad analizando el comportamiento de tus comensales en tiempo real.</p>
          </div>
          <div className="flex gap-6">
             <div className="bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-purple-500/10 flex flex-col items-center min-w-[180px]">
                <Target className="w-8 h-8 text-purple-500 mb-4" />
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Ticket Medio</p>
                <p className="text-3xl font-black text-white leading-none">Q145</p>
             </div>
             <div className="bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-purple-500/10 flex flex-col items-center min-w-[180px]">
                <Zap className="w-8 h-8 text-indigo-500 mb-4" />
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-2">Fidelización</p>
                <p className="text-3xl font-black text-white leading-none">88%</p>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

