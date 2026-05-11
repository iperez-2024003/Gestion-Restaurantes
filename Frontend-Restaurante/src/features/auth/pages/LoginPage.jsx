import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import Restaurante1 from '../../../assets/img/Restaurante1.webp';
import Restaurante2 from '../../../assets/img/Restaurante2.webp';
import Restaurante3 from '../../../assets/img/Restaurante3.webp';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Card } from '../../../shared/components/ui/Card';

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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success('¡Bienvenido de nuevo!');
      const loggedUser = useAuthStore.getState().user;
      navigate(loggedUser?.restaurantId ? `/dashboard/restaurants/${loggedUser.restaurantId}` : '/dashboard');
      return;
    }

    toast.error(result.error);
    if (result.error.toLowerCase().includes('verificar tu email')) {
      setNeedsVerification(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-primary-50 flex items-center justify-center overflow-hidden">
      {/* Fondo CSS Premium (Sin Lag) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 gap-8 lg:gap-16">
        {/* Lado Izquierdo: Formulario */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 lg:p-10 border-primary-200/50">
            <div className="text-center mb-8">
              <BrandLogo size="lg" className="mb-4" />
              <h1 className="text-3xl font-black text-ink mb-1">Bienvenido</h1>
              <p className="text-muted-brown text-sm font-medium">Gestiona tu restaurante con elegancia.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Correo Electrónico"
                icon={Mail}
                type="email"
                placeholder="admin@buenprovecho.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-1">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-brown">Contraseña</label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-brown hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full py-3.5 mt-2">
                Acceder al Sistema <ArrowRight size={18} />
              </Button>

              {/* Mensaje informativo removido por petición del cliente */}

              <AnimatePresence>
                {needsVerification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary-100 rounded-xl text-center border border-primary-200"
                  >
                    <p className="text-xs text-muted-brown font-medium mb-2">Verificación pendiente</p>
                    <button type="button" onClick={() => useAuthStore.getState().resendVerification(email)} className="text-xs font-black text-ink hover:text-primary-600 flex items-center justify-center gap-1 mx-auto">
                      <Sparkles size={14} /> Reenviar enlace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-8 pt-6 border-t border-primary-100 flex items-center justify-between">
              <span className="text-muted-brown text-sm">¿No tienes cuenta?</span>
              <Link to="/register" className="text-primary-600 font-black text-sm hover:underline flex items-center gap-1">
                Regístrate <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Lado Derecho: Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden lg:block flex-1 h-[600px] relative"
        >
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-primary-200/50 shadow-premium relative group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={uploadImages[currentImage]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary-500 rounded-lg">
                  <ShieldCheck size={16} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-200">Plataforma Certificada</span>
              </div>
              <h3 className="text-4xl font-black mb-3 leading-tight tracking-tighter">Sabor y Gestión <br /> en un solo lugar</h3>
              <p className="text-primary-100/80 text-lg font-medium max-w-md">La herramienta definitiva para el éxito de tu restaurante.</p>
            </div>

            <div className="absolute top-10 right-10 flex gap-2">
              {uploadImages.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImage ? 'w-8 bg-primary-400' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
