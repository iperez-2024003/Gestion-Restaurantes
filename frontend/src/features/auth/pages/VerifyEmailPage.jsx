import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Mail } from 'lucide-react';
import { DarkVeil } from "../../../shared/components/ui/DarkVeil";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Sincronizando identidad con el servidor...');
  const { verifyEmail } = useAuthStore();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de seguridad es inválido o ha expirado.');
      return;
    }

    const processVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Tu identidad ha sido confirmada exitosamente.');
      } else {
        setStatus('error');
        setMessage(result.error || 'No se pudo completar el protocolo de seguridad.');
      }
    };

    processVerification();
  }, [token, verifyEmail]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-outfit">
      <DarkVeil baseColor="#000000" veilColor="#A855F7" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="bg-zinc-900/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-purple-500/10 shadow-2xl text-center">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                 <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-purple-500">
                    <Mail className="w-8 h-8" />
                 </div>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">{message}</h2>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Acceso Autorizado</h2>
              <p className="text-zinc-500 font-bold mb-10 text-sm uppercase tracking-widest leading-relaxed">{message}</p>
              <Link
                to="/login"
                className="w-full py-5 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-purple-500 shadow-2xl shadow-purple-500/20 transition-all border border-purple-400/20"
              >
                Ingresar al Sistema
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mb-8">
                <AlertCircle className="w-12 h-12 text-rose-500" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Falla de Seguridad</h2>
              <p className="text-zinc-500 font-bold mb-10 text-sm uppercase tracking-widest leading-relaxed">{message}</p>
              <Link
                to="/login"
                className="w-full py-5 rounded-2xl bg-zinc-950 text-zinc-400 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-900 border border-zinc-800 transition-all"
              >
                Volver al Portal
              </Link>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
