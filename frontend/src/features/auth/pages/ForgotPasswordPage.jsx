import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Grainient from '../../../shared/components/ui/Grainient';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email);

    if (result.success) {
      setIsSent(true);
      toast.success(result.message || 'Correo de recuperación enviado.');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f7f1e7] flex items-center justify-center overflow-hidden font-inter p-4 text-zinc-900">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Grainient
          timeSpeed={0.25}
          colorBalance={0.0}
          warpStrength={1.0}
          warpFrequency={5.0}
          warpSpeed={2.0}
          warpAmplitude={50.0}
          blendAngle={0.0}
          blendSoftness={0.05}
          rotationAmount={500.0}
          noiseScale={2.0}
          grainAmount={0.1}
          grainScale={2.0}
          contrast={1.5}
          gamma={1.0}
          saturation={1.0}
          color1="#f8ecd7"
          color2="#d6b47a"
          color3="#ead9bf"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="bg-white/80 backdrop-blur-3xl p-8 lg:p-12 rounded-[2.5rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] relative group">
          <div className="text-center mb-10">
            <BrandLogo size="md" className="mx-auto mb-6" imageClassName="p-0" />

            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.div
                  key="form-header"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-3xl font-black text-zinc-900 mb-3 tracking-tight">Recuperar Acceso</h2>
                  <p className="text-zinc-600 font-medium text-sm">Ingresa tu correo para recibir instrucciones de recuperación.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="success-header"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-3xl font-black text-[#b98c52] mb-3">¡Correo Enviado!</h2>
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="w-12 h-12 text-[#b98c52]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isSent ? (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Dirección de Destino</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-[#b98c52] transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#fffaf3] border border-[#dcc7a5] text-zinc-900 placeholder-zinc-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d7b77f]/25 focus:border-[#b98c52] transition-all"
                    placeholder="ejemplo@restaurante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(185,140,82,0.25)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black rounded-2xl shadow-xl shadow-[rgba(185,140,82,0.18)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Enviar Enlace</span>}
              </motion.button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <p className="text-zinc-700 font-medium">
                Hemos enviado un enlace seguro a: <br />
                <span className="text-zinc-900 font-black">{email}</span>
              </p>
              <p className="text-zinc-500 text-xs italic">Si no recibes el correo en unos minutos, revisa tu carpeta de spam.</p>
            </motion.div>
          )}

          <div className="mt-12 pt-8 border-t border-[#dcc7a5]/70 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#8b6435] transition-colors font-bold text-xs uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4 text-[#b98c52]" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
