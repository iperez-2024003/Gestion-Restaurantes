import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Card } from '../../../shared/components/ui/Card';

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
    <div className="relative min-h-screen bg-primary-50 flex items-center justify-center overflow-hidden p-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <Card className="p-8 lg:p-10 border-primary-200/50 text-center">
          <div className="mb-8">
            <BrandLogo size="md" className="mx-auto mb-6" />
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.div key="header" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-2xl font-black text-ink mb-2">Recuperar Acceso</h1>
                  <p className="text-muted-brown text-sm font-medium">Te enviaremos instrucciones a tu correo.</p>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-black text-ink mb-2">¡Enviado!</h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Tu Correo"
                icon={Mail}
                type="email"
                placeholder="ejemplo@buenprovecho.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" isLoading={isLoading} className="w-full py-4">
                Enviar Enlace
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-brown text-sm">
                Revisa tu bandeja de entrada en: <br />
                <span className="text-ink font-black">{email}</span>
              </p>
              <p className="text-[10px] text-muted-brown italic uppercase tracking-widest">No olvides revisar la carpeta de spam</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-primary-100">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black text-muted-brown hover:text-ink transition-colors uppercase tracking-widest">
              <ArrowLeft size={16} className="text-primary-500" />
              Volver al Inicio
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

