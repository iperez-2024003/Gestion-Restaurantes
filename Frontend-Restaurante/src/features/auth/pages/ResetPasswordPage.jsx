import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { DarkVeil } from '../../../shared/components/ui/DarkVeil';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';

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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-outfit bg-[#f7f1e7] text-zinc-900">
      <DarkVeil baseColor="#f7f1e7" veilColor="#d7b77f" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md p-8">
        <div className="bg-white/80 backdrop-blur-3xl p-12 rounded-[3rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)]">
          <div className="flex justify-center mb-8">
            <BrandLogo size="md" className="w-full max-w-[18rem]" imageClassName="p-0" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase mb-2">
              Nueva <span className="text-[#b98c52]">Credencial</span>
            </h2>
            <p className="text-zinc-600 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
              Define tu nueva llave de acceso para restaurar la integridad de tu cuenta.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4" htmlFor="newPassword">
                Nueva Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-[#b98c52] transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength="8"
                  className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl py-4 pl-14 pr-6 text-zinc-900 text-sm focus:border-[#b98c52] focus:ring-1 focus:ring-[#d7b77f]/25 transition-all placeholder:text-zinc-500"
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
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-[#b98c52] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="w-full bg-[#fffaf3] border border-[#dcc7a5] rounded-2xl py-4 pl-14 pr-6 text-zinc-900 text-sm focus:border-[#b98c52] focus:ring-1 focus:ring-[#d7b77f]/25 transition-all placeholder:text-zinc-500"
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
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-[0.3em] text-[10px] hover:to-[#a97d45] shadow-2xl shadow-[rgba(185,140,82,0.18)] transition-all border border-[#d7b77f]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar Protocolo'}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-[10px] font-black text-zinc-500 hover:text-[#8b6435] transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <ArrowLeft className="w-3 h-3 text-[#b98c52]" /> Volver al Portal de Acceso
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
