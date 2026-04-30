import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Antigravity } from '../../../shared/components/ui/Antigravity';

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
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden font-inter p-4">
      {/* Background Effect */}
      <Antigravity 
        count={200} 
        color="#A855F7" 
        magnetRadius={15} 
        ringRadius={8} 
        particleSize={1.2}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="bg-zinc-900/40 backdrop-blur-3xl p-8 lg:p-12 rounded-[2.5rem] border border-purple-500/20 shadow-2xl relative group">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-3xl mb-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <KeyRound className="w-10 h-10 text-purple-500" />
            </div>
            
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.div
                  key="form-header"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Recuperar Acceso</h2>
                  <p className="text-zinc-400 font-medium text-sm">Ingresa tu correo para recibir instrucciones de recuperación.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="success-header"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-3xl font-black text-purple-400 mb-3">¡Correo Enviado!</h2>
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="w-12 h-12 text-purple-500" />
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-zinc-800 text-white placeholder-zinc-700 focus:bg-black focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="ejemplo@restaurante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Enviar Enlace</span>
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <p className="text-zinc-300 font-medium">
                Hemos enviado un enlace seguro a: <br />
                <span className="text-white font-black">{email}</span>
              </p>
              <p className="text-zinc-500 text-xs italic">
                Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
              </p>
            </motion.div>
          )}

          <div className="mt-12 pt-8 border-t border-zinc-800/50 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4 text-purple-500" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
