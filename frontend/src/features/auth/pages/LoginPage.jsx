import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import Restaurante1 from '../../../assets/img/Restaurante1.webp';
import Restaurante2 from '../../../assets/img/Restaurante2.webp';
import Restaurante3 from '../../../assets/img/Restaurante3.webp';
import Grainient from '../../../shared/components/ui/Grainient';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, resendVerification, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const uploadImages = [Restaurante1, Restaurante2, Restaurante3];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % uploadImages.length);
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      return;
    }

    toast.error(result.error);
    if (result.error.toLowerCase().includes('verificar tu email')) {
      setNeedsVerification(true);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    const result = await resendVerification(email);
    if (result.success) {
      toast.success(result.message);
      setNeedsVerification(false);
      return;
    }

    toast.error(result.error);
  };

  return (
    <div className="relative min-h-screen bg-[#f7f1e7] flex items-center justify-center overflow-hidden font-inter text-zinc-900">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Grainient
          timeSpeed={0.2}
          colorBalance={0.0}
          warpStrength={0.9}
          warpFrequency={5.0}
          warpSpeed={1.8}
          warpAmplitude={42.0}
          blendAngle={0.0}
          blendSoftness={0.06}
          rotationAmount={320.0}
          noiseScale={1.8}
          grainAmount={0.08}
          grainScale={1.8}
          contrast={1.35}
          gamma={1.0}
          saturation={1.0}
          color1="#f8ecd7"
          color2="#d6b47a"
          color3="#ead9bf"
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between h-screen p-6 lg:p-12 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md lg:w-[480px] mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] relative overflow-hidden group">
            <div className="relative z-10 text-center lg:text-left mb-8">
              <div className="mb-6">
                <BrandLogo size="xl" className="mx-auto lg:mx-0 mb-5" imageClassName="p-0" />
                <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">BuenProvecho</h1>
                <p className="text-[#a97d45] text-[10px] font-black uppercase tracking-[0.2em]">Gestión Profesional</p>
              </div>
              <h2 className="text-4xl font-black text-zinc-900 mb-2 tracking-tight">Iniciar Sesión</h2>
              <p className="text-zinc-600 text-sm font-medium">Bienvenido al centro de control gastronómico.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Identificador / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#b98c52] transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#fffaf3] border border-[#dcc7a5] text-zinc-900 placeholder-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/25 focus:border-[#b98c52] transition-all"
                      placeholder="admin@restaurante.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contraseña</label>
                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-[#a97d45] hover:text-[#8b6435]">¿La olvidaste?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#b98c52] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#fffaf3] border border-[#dcc7a5] text-zinc-900 placeholder-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/25 focus:border-[#b98c52] transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#b98c52]"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(185,140,82,0.25)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] hover:to-[#a97d45] text-white font-black rounded-2xl shadow-xl shadow-[rgba(185,140,82,0.18)] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
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
                    className="p-4 bg-[#f1e4cd] border border-[#d7b77f]/30 rounded-2xl text-center"
                  >
                    <p className="text-xs text-[#8b6435] mb-3 font-bold uppercase tracking-widest">Verificación Pendiente</p>
                    <button type="button" onClick={handleResend} className="text-xs text-zinc-900 font-black hover:text-[#a97d45] transition-colors flex items-center justify-center gap-2 mx-auto">
                      <Sparkles className="w-4 h-4" />
                      Reenviar Enlace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-10 pt-6 border-t border-[#dcc7a5]/70 flex items-center justify-between">
              <p className="text-zinc-500 text-sm font-medium">¿Nuevo usuario?</p>
              <Link to="/register" className="text-[#a97d45] font-black hover:text-[#8b6435] transition-colors flex items-center gap-2">
                Regístrate
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="hidden lg:flex flex-1 h-[80vh] relative items-center justify-center">
          <div className="relative w-full h-full max-w-2xl rounded-[3rem] overflow-hidden border border-[#dcc7a5]/60 shadow-[0_35px_120px_rgba(110,80,45,0.12)] bg-[#fffaf3]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={uploadImages[currentImage]}
                initial={{ opacity: 0, scale: 1.04, x: 12 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -12 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-[#3a2a1a]/80 via-[#3a2a1a]/24 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,183,127,0.18),transparent_34%)]" />

            <div className="absolute top-10 left-10 z-20">
              <BrandLogo size="lg" className="w-full max-w-[18rem]" imageClassName="p-0" />
            </div>

            <div className="absolute bottom-12 left-12 right-12 text-white z-20">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#d7b77f]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#f0ddbf]">Plataforma Segura</span>
              </div>
              <h3 className="text-4xl font-black mb-4 leading-tight">Experiencia premium, fluida y elegante</h3>
              <p className="text-zinc-200 text-lg font-medium max-w-xl">Tres escenas visuales, una carga más suave y sin perder presencia.</p>
            </div>

            <div className="absolute top-12 right-12 flex gap-2 z-20">
              {uploadImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${i === currentImage ? 'w-8 bg-[#d7b77f]' : 'w-2 bg-white/45'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};