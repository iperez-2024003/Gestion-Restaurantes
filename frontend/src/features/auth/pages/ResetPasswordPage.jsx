import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { DarkVeil } from "../../../shared/components/ui/DarkVeil";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Protocolo inválido: Token de seguridad no detectado.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Error de sincronización: Las contraseñas no coinciden.');
      return;
    }

    const result = await resetPassword(token, newPassword);
    
    if (result.success) {
      toast.success(result.message || 'Credenciales actualizadas exitosamente.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-outfit">
      <DarkVeil baseColor="#000000" veilColor="#A855F7" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-zinc-900/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-purple-500/10 shadow-2xl">
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
              Nueva <span className="text-zinc-600">Credencial</span>
            </h2>
            <p className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
              Define tu nueva llave de acceso para restaurar la integridad de tu cuenta.
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4" htmlFor="newPassword">
                Nueva Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-purple-500 transition-colors">
                   <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength="8"
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-700"
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4" htmlFor="confirmPassword">
                Confirmar Identidad
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-purple-500 transition-colors">
                   <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-zinc-700"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full py-5 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-purple-500 shadow-2xl shadow-purple-500/20 transition-all border border-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar Protocolo'}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-[10px] font-black text-zinc-500 hover:text-purple-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <ArrowLeft className="w-3 h-3" /> Volver al Portal de Acceso
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
