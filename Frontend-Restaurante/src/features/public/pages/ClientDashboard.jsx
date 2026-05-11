import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeDollarSign,
  ChefHat,
  MapPin,
  PartyPopper,
  Sparkles,
  Star,
  Trophy,
  Utensils,
} from 'lucide-react';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import LogoLoop from '../../../shared/components/ui/LogoLoop';
import ScrollStack, { ScrollStackItem } from '../../../shared/components/ui/ScrollStack';
import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.jpeg';

const navItems = [
  { label: 'Explora', link: '#featured', ariaLabel: 'Ir a sedes destacadas' },
  { label: 'Promos', link: '#promotions', ariaLabel: 'Ir a promociones activas' },
  { label: 'Cuenta', link: '#vip', ariaLabel: 'Ir a puntos VIP' },
  { label: 'Historial', link: '/dashboard/history', ariaLabel: 'Abrir historial' },
];

const fadeUpSection = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { restaurants, getRestaurants, loading } = useRestaurantStore();
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  useEffect(() => {
    const uniqueCats = [...new Set(restaurants.map((restaurant) => restaurant.category))].filter(Boolean);
    setCategories(uniqueCats);
  }, [restaurants]);

  const filteredRestaurants = activeTab === 'Todos'
    ? restaurants
    : restaurants.filter((restaurant) => restaurant.category === activeTab);

  const featuredRestaurants = restaurants.slice(0, 8);
  const firstFeaturedMenuPath = featuredRestaurants[0]?.id ? `/menu/${featuredRestaurants[0].id}` : '/dashboard';
  const featuredRestaurant = filteredRestaurants[0] || restaurants[0];

  const loopItems = featuredRestaurants.length > 0
    ? featuredRestaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category || 'Experiencia Gourmet',
        image: restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
      }))
    : [
        { id: 'demo-1', name: 'BuenProvecho Club', category: 'Experiencias', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80' },
        { id: 'demo-2', name: 'Promos VIP', category: 'Ofertas', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0f?auto=format&fit=crop&q=80' },
        { id: 'demo-3', name: 'Mesa Premium', category: 'Reservas', image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80' },
      ];

  const quickActions = [
    { eyebrow: 'Explora', action: 'Ver menú', icon: Utensils, onClick: () => navigate(firstFeaturedMenuPath) },
    { eyebrow: 'Eventos', action: 'Ver ofertas', icon: PartyPopper, onClick: () => navigate('/dashboard/events?type=promotion') },
    { eyebrow: 'Beneficios', action: 'Mi historial', icon: BadgeDollarSign, onClick: () => navigate('/dashboard/history') },
  ];

  return (
    <div className="relative min-h-screen bg-[#fcf8f2] text-[#2b2015]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(215,183,127,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(139,100,53,0.08),transparent_38%)]" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(201,163,99,0.18),_transparent_52%)]" />
      <div className="absolute inset-x-0 top-20 mx-auto h-72 w-[72rem] rounded-full bg-[#f1d7b1]/30 blur-3xl" />

      <div className="relative z-10 pt-24 pb-20 md:pt-32">
        <main className="flex min-w-0 flex-col gap-10">
        <motion.section
          variants={fadeUpSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/88 p-6 shadow-[0_30px_100px_rgba(110,80,45,0.12)] backdrop-blur-2xl md:rounded-[4rem] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,183,127,0.2),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(139,100,53,0.08),transparent_44%)]" />
            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-3xl">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-[#b98c52]">BuenProvecho Club</p>
                <h1 className="mb-5 text-5xl font-black leading-[0.96] tracking-tighter text-zinc-900 uppercase md:text-6xl">
                  Tu pase <span className="text-[#b98c52]">VIP</span> al sabor
                </h1>
                <p className="max-w-2xl text-[10px] font-semibold uppercase leading-relaxed tracking-[0.24em] text-zinc-600 md:text-xs">
                  Gestiona tus puntos, explora sedes y reserva con un solo toque. El dashboard editorial diseñado para los amantes del buen comer.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(firstFeaturedMenuPath)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#2b2015] px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:scale-[1.02] hover:bg-[#3d2d1e] active:scale-95 shadow-lg shadow-black/10"
                  >
                    Ir al menú
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/events?type=promotion')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#dcc7a5] bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#8b6435] transition-all hover:scale-[1.02] hover:bg-[#fffaf2] active:scale-95 shadow-sm"
                  >
                    Ver promos
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="group relative rounded-[2rem] bg-[#2b2015] p-6 text-white shadow-[0_25px_60px_rgba(47,35,23,0.2)] md:p-8 transition-transform hover:-translate-y-1">
                  <div className="absolute top-4 right-4 opacity-10 transition-opacity group-hover:opacity-20">
                    <Trophy className="h-16 w-16 text-white" />
                  </div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#f3e4ca]">Nivel de socio</p>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-[0.1em] text-white">
                        {user?.points > 1000 ? 'Platino' : user?.points > 500 ? 'Oro' : 'Miembro Gourmet'}
                      </h2>
                      <div className="mt-4 flex items-center gap-3">
                        <p className="text-5xl font-black leading-none">{user?.points || 0}</p>
                        <span className="text-[10px] font-bold uppercase text-[#f3e4ca] tracking-widest">Puntos</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((user?.points || 0) / 15, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#dcc7a5] to-white" 
                    />
                  </div>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-widest text-white/50">
                    {(user?.points || 0) < 1500 ? `Te faltan ${1500 - (user?.points || 0)} para el siguiente nivel` : 'Nivel máximo alcanzado'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.75rem] border border-[#dcc7a5] bg-white p-4 shadow-[0_15px_40px_rgba(110,80,45,0.06)] md:p-5 flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">Sedes</p>
                    <p className="mt-2 text-3xl font-black text-zinc-900">{restaurants.length}</p>
                  </div>
                  <div className="rounded-[1.75rem] border border-[#dcc7a5] bg-white p-4 shadow-[0_15px_40px_rgba(110,80,45,0.06)] md:p-5 flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">Categorías</p>
                    <p className="mt-2 text-3xl font-black text-zinc-900">{categories.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            variants={fadeUpSection}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-[2rem] border border-white/70 bg-white/92 p-5 shadow-[0_20px_70px_rgba(58,43,21,0.10)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#a07845]">Accesos rápidos</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#2b2015]">Atajos que sí se usan</h2>
              </div>
              <div className="rounded-full border border-[#dcc7a5] bg-[#fffaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#8b6435]">
                Scroll normal, sin traba
              </div>
            </div>

            <motion.div variants={staggerList} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="space-y-3">
              {quickActions.map((card) => {
                const Icon = card.icon;

                return (
                  <motion.button
                    key={card.action}
                    variants={staggerItem}
                    type="button"
                    onClick={card.onClick}
                    className="group w-full rounded-[1.6rem] border border-[#eadac0] bg-gradient-to-br from-white to-[#fff4e1] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(110,79,34,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">{card.eyebrow}</p>
                        <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-[#2b2015]">{card.action}</h3>
                      </div>
                      <Icon className="h-5 w-5 text-[#8b6435] transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          id="featured"
          variants={fadeUpSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-[2.5rem] border border-[#dcc7a5]/70 bg-white/75 overflow-hidden shadow-[0_30px_100px_rgba(110,80,45,0.12)] backdrop-blur-2xl md:rounded-[4rem]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#dcc7a5]/50 px-6 pb-4 pt-6 md:px-10 md:pt-8">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Sedes destacadas</p>
              <h2 className="text-2xl font-black tracking-tighter text-zinc-900 md:text-3xl">Una experiencia más viva y visual</h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[#dcc7a5] bg-[#fffaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#8b6435] md:flex">
              <Sparkles className="h-4 w-4" />
              Recomendadas para ti
            </div>
          </div>

          <div className="px-4 py-5 md:px-6 md:py-6">
            <LogoLoop
              logos={loopItems}
              speed={70}
              direction="left"
              logoHeight={88}
              gap={16}
              hoverSpeed={0}
              fadeOut
              fadeOutColor="#fffaf3"
              scaleOnHover
              ariaLabel="Restaurantes destacados"
              renderItem={(item) => (
                <button
                  type="button"
                  onClick={() => navigate(`/menu/${item.id}`)}
                  className="group flex items-center gap-3 rounded-[2rem] border border-[#dcc7a5]/70 bg-white/95 px-4 py-3 text-left shadow-[0_18px_45px_rgba(110,80,45,0.08)] transition-all hover:-translate-y-1 hover:border-[#b98c52]/50 hover:shadow-[0_22px_55px_rgba(185,140,82,0.18)]"
                >
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">{item.category}</p>
                    <p className="text-sm font-black uppercase tracking-tight text-zinc-900">{item.name}</p>
                  </div>
                  <ArrowRight className="ml-2 h-4 w-4 text-[#8b6435] transition-transform group-hover:translate-x-1" />
                </button>
              )}
            />
          </div>
        </motion.section>

        <motion.section
          id="promotions"
          variants={fadeUpSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#dcc7a5]/70 bg-white/80 shadow-[0_30px_100px_rgba(110,80,45,0.12)] backdrop-blur-2xl md:rounded-[4rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,183,127,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(139,100,53,0.09),transparent_44%)]" />
            <div className="relative z-10 grid min-h-auto grid-cols-1 gap-0 md:grid-cols-1">
              <div className="flex flex-col justify-between gap-8 p-6 md:p-10">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Sede recomendada</p>
                  <h3 className="text-3xl font-black uppercase leading-[1.02] tracking-tighter text-zinc-900 md:text-5xl">
                    {featuredRestaurant?.name || 'Restaurante destacado'}
                  </h3>
                  <p className="mt-5 max-w-xl font-medium leading-7 text-zinc-600">
                    {featuredRestaurant?.address || 'Ubicación premium para una experiencia más cercana y visual.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dcc7a5] bg-[#fffaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#8b6435]">
                    <MapPin className="h-4 w-4" />
                    {featuredRestaurant?.category || 'Casual'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dcc7a5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-700">
                    <Star className="h-4 w-4 text-[#b98c52]" />
                    {featuredRestaurant?.rating || '4.5'} / 5
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dcc7a5] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-700">
                    <ChefHat className="h-4 w-4 text-[#b98c52]" />
                    Menú listo para explorar
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(firstFeaturedMenuPath)}
                  className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#2b2015] px-5 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Abrir menú
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div id="vip" className="relative overflow-hidden rounded-[2.5rem] border border-[#dcc7a5]/70 bg-[#2f2317] p-5 text-white shadow-[0_30px_100px_rgba(47,35,23,0.26)] md:rounded-[4rem] md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,183,127,0.22),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_45%)]" />
            <div className="relative z-10 flex h-full flex-col gap-6">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#f3e4ca]">Atajos rápidos</p>
                <h3 className="text-2xl font-black tracking-tighter md:text-3xl">Todo el cliente se siente más vivo</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((card) => {
                  const Icon = card.icon;

                  return (
                    <button
                      key={card.action}
                      type="button"
                      onClick={card.onClick}
                      className="group rounded-[2rem] border border-white/10 bg-white/10 p-5 text-left transition-all hover:bg-white/15"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#f3e4ca]">{card.eyebrow}</p>
                          <p className="text-xl font-black tracking-tight">{card.action}</p>
                        </div>
                        <Icon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto rounded-[2rem] border border-white/10 bg-white/8 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#f3e4ca]">Club VIP BuenProvecho</p>
                    <h4 className="mt-2 text-xl font-black uppercase tracking-tight">Puntos acumulados</h4>
                  </div>
                  <Trophy className="h-7 w-7 text-[#f3e4ca]" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-[#f3e4ca]" />
                    <p className="text-5xl font-black leading-none">{user?.points || 0}</p>
                  </div>
                  <p className="max-w-[10rem] text-right text-[10px] font-black uppercase tracking-[0.2em] text-[#f3e4ca]">
                    Canjeable por Q{(user?.points || 0) * 0.5} en tu próxima cena
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <ScrollStack useWindowScroll={true} itemStackDistance={20} baseScale={0.9} rotationAmount={0.5} blurAmount={2}>
          <ScrollStackItem itemClassName="bg-transparent shadow-none my-0 p-0 h-auto">
            <motion.div
              variants={fadeUpSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex items-center gap-3 overflow-x-auto px-2 pb-8 scroll-mt-28 scrollbar-hide md:px-0"
              id="restaurants"
            >
              {['Todos', ...categories].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveTab(category)}
                className={`rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === category
                    ? 'border border-[#d7b77f]/50 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white shadow-lg shadow-[rgba(185,140,82,0.18)]'
                    : 'border border-[#dcc7a5] bg-white/70 text-zinc-600 hover:border-[#b98c52]/30 hover:text-[#8b6435]'
                }`}
              >
                {category === 'Todos' ? '🍽️ Todos' : category}
              </button>
            ))}
          </motion.div>
        </ScrollStackItem>

          <div className="min-h-[300px] md:min-h-[400px]">
            {loading ? (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-10">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-64 animate-pulse rounded-[3rem] border border-[#dcc7a5] bg-white/70 md:h-96" />
                ))}
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="rounded-[3rem] border border-dashed border-[#dcc7a5] bg-white/70 py-24 text-center">
                <ChefHat className="mx-auto mb-6 h-16 w-16 text-[#d7b77f]" />
                <h3 className="text-xl font-black uppercase text-zinc-900">No hay opciones en esta categoría</h3>
                <p className="mt-2 text-xs font-medium text-zinc-500">Explora otras delicias o vuelve más tarde.</p>
              </div>
            ) : (
              <motion.div variants={staggerList} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-10">
                <AnimatePresence mode="popLayout">
                  {filteredRestaurants.map((restaurant, index) => (
                    <ScrollStackItem key={restaurant.id} itemClassName="bg-transparent shadow-none p-0 my-0 h-auto">
                      <motion.button
                        type="button"
                        variants={staggerItem}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/menu/${restaurant.id}`)}
                        className="group relative w-full overflow-hidden rounded-[2.5rem] border border-[#dcc7a5]/70 bg-white/90 text-left shadow-[0_28px_90px_rgba(110,80,45,0.12)] backdrop-blur-3xl transition-all hover:-translate-y-1 hover:border-[#b98c52]/35 hover:shadow-[0_34px_110px_rgba(185,140,82,0.16)]"
                      >
                        <div className="relative h-52 overflow-hidden md:h-60">
                          <img
                            src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt={restaurant.name}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2f2317]/70 via-transparent to-transparent opacity-80" />
                          <div className="absolute left-5 top-5 rounded-full border border-[#dcc7a5] bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#8b6435] shadow-lg backdrop-blur-xl">
                            {restaurant.category || 'Casual'}
                          </div>
                          <div className="absolute right-5 top-5 rounded-full border border-[#dcc7a5] bg-white/85 px-4 py-2 text-[10px] font-black text-[#8b6435] shadow-lg backdrop-blur-xl">
                            {restaurant.rating || '4.5'} ⭐
                          </div>
                        </div>

                        <div className="p-6 text-zinc-900 md:p-8">
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#b98c52]">Restaurante</p>
                              <h3 className="text-2xl font-black uppercase leading-[1.02] tracking-tight md:text-[1.85rem]">{restaurant.name}</h3>
                            </div>
                            <span className="inline-flex whitespace-nowrap rounded-full border border-[#dcc7a5] bg-[#f3e4ca] px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[#8b6435]">
                              {restaurant.rating || '4.5'}
                            </span>
                          </div>
                          <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            <MapPin className="h-4 w-4 shrink-0 text-[#b98c52]" />
                            <span className="truncate">{restaurant.address || 'Ubicación Premium'}</span>
                          </div>

                          <div className="mb-6 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-[#dcc7a5] bg-[#fffaf3] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#8b6435]">Abierto hoy</span>
                            <span className="inline-flex items-center rounded-full border border-[#dcc7a5] bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Menú directo</span>
                          </div>

                          <span className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#2b2015] bg-[#2b2015] py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-all group-hover:border-[#d7b77f]/30 group-hover:bg-gradient-to-r group-hover:from-[#d7b77f] group-hover:to-[#b98c52] group-hover:shadow-lg group-hover:shadow-[rgba(185,140,82,0.18)]">
                            Explorar Menú <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </motion.button>
                    </ScrollStackItem>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </ScrollStack>
      </main>
    </div>
  </div>
);
};
