import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Antigravity } from '../../../shared/components/ui/Antigravity';
import Restaurante1 from '../../../assets/img/Restaurante1.webp';
import Restaurante2 from '../../../assets/img/Restaurante2.webp';
import Restaurante3 from '../../../assets/img/Restaurante3.webp';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, resendVerification, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);
  const uploadImages = [
    Restaurante1,
    Restaurante2,
    Restaurante3,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % uploadImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNeedsVerification(false);
    
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('¡Bienvenido de nuevo!');
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser?.restaurantId) {
        navigate(`/dashboard/restaurants/${loggedUser.restaurantId}`);
      } else {
        navigate('/dashboard'); 
      }
    } else {
      toast.error(result.error);
      if (result.error.toLowerCase().includes('verificar tu email')) {
        setNeedsVerification(true);
      }
    }
  };

  const handleResend = async () => {
    if (!email) return;
    const result = await resendVerification(email);
    if (result.success) {
      toast.success(result.message);
      setNeedsVerification(false);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden font-inter">
      {/* Background Effect */}
      <Antigravity 
        count={200} 
        color="#A855F7" 
        magnetRadius={15} 
        ringRadius={8} 
        particleSize={1.2}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between h-screen p-6 lg:p-12 gap-12">
        
        {/* Left: Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-[450px]"
        >
          <div className="bg-zinc-900/40 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] border border-purple-500/20 shadow-2xl relative overflow-hidden group">
            
            <div className="relative z-10 text-center lg:text-left mb-8">
              <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tighter">RestauManager</h1>
                  <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Gestión Profesional</p>
                </div>
              </div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Iniciar Sesión</h2>
              <p className="text-zinc-400 text-sm font-medium">Bienvenido al centro de control gastronómico.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Identificador / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="admin@restaurante.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contraseña</label>
                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-purple-400 hover:text-purple-300">¿La olvidaste?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-purple-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Acceder al Sistema</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {needsVerification && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center"
                  >
                    <p className="text-xs text-purple-400 mb-3 font-bold uppercase tracking-widest">Verificación Pendiente</p>
                    <button type="button" onClick={handleResend} className="text-xs text-white font-black hover:text-purple-400 transition-colors flex items-center justify-center gap-2 mx-auto">
                      <Sparkles className="w-4 h-4" />
                      Reenviar Enlace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-10 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
              <p className="text-zinc-500 text-sm font-medium">¿Nuevo usuario?</p>
              <Link to="/register" className="text-purple-400 font-black hover:text-purple-300 transition-colors flex items-center gap-2">
                Regístrate
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right: Image Slider Showcase */}
        <div className="hidden lg:flex flex-1 h-[80vh] relative items-center justify-center">
          <div className="relative w-full h-full max-w-2xl rounded-[3rem] overflow-hidden border-2 border-purple-500/20 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={uploadImages[currentImage]}
                initial={{ opacity: 0, scale: 1.1, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-12 left-12 right-12 text-white">
              <motion.div
                key={`text-${currentImage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-purple-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400">Plataforma Segura</span>
                </div>
                <h3 className="text-4xl font-black mb-4 leading-tight">Optimiza tu Restaurante <br /> con <span className="text-purple-500 italic">Clase</span></h3>
                <p className="text-zinc-300 text-lg font-medium">Únete a cientos de negocios que ya usan nuestra tecnología.</p>
              </motion.div>
            </div>

            {/* Slider Dots */}
            <div className="absolute top-12 right-12 flex gap-2">
              {uploadImages.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentImage ? 'bg-purple-500 w-8' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
