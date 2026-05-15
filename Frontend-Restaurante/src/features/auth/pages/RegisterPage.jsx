import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Upload, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Card } from '../../../shared/components/ui/Card';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profilePicture: null
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Formato de correo inválido";
    }
    if (formData.password.length < 8) {
      errors.password = "La contraseña debe tener mínimo 8 caracteres";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (!formData.phone.match(/^\d{8,15}$/)) {
      errors.phone = "Solo números (8-15 dígitos)";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Por favor corrige los errores antes de continuar');
      return;
    }
    setFieldErrors({});

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword' && formData[key]) data.append(key, formData[key]);
    });

    const result = await register(data);
    if (result.success) {
      toast.success(result.message || '¡Registro exitoso! Verifica tu correo.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="relative min-h-screen bg-primary-50 flex items-center justify-center overflow-hidden py-12 px-6">
      {/* Fondo CSS Premium */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-300/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[650px]"
        >
          <Card className="p-8 lg:p-12 border-primary-200/50">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-black text-ink mb-1">Crea tu Cuenta</h1>
                <p className="text-muted-brown text-sm font-medium">Únete a la elite de la gestión gastronómica.</p>
              </div>
              <BrandLogo size="md" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Nombre" name="name" icon={User} placeholder="Ej. Juan" value={formData.name} onChange={handleChange} required />
                <Input label="Apellido" name="surname" icon={User} placeholder="Ej. Pérez" value={formData.surname} onChange={handleChange} required />
                <Input label="Usuario" name="username" icon={Sparkles} placeholder="juanp_24" value={formData.username} onChange={handleChange} required />
                <Input label="Teléfono" name="phone" icon={Phone} placeholder="12345678" value={formData.phone} onChange={handleChange} error={fieldErrors.phone} required />
                <Input label="Email Corporativo" name="email" type="email" icon={Mail} placeholder="admin@restaurante.com" value={formData.email} onChange={handleChange} error={fieldErrors.email} required className="md:col-span-2" />
                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Contraseña" name="password" type="password" icon={Lock} placeholder="••••••••" value={formData.password} onChange={handleChange} error={fieldErrors.password} required />
                  <Input label="Confirmar Contraseña" name="confirmPassword" type="password" icon={Lock} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} error={fieldErrors.confirmPassword} required />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-brown ml-1">Foto de Perfil</label>
                  <label className="flex items-center gap-4 p-4 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:bg-primary-100/50 transition-all group">
                    <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <Upload size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">Sube tu imagen</p>
                      <p className="text-[10px] text-muted-brown font-medium italic">Formatos: JPG, PNG, WEBP</p>
                    </div>
                    <input name="profilePicture" type="file" className="hidden" onChange={handleChange} />
                  </label>
                </div>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full py-4 mt-4">
                Comenzar ahora <ArrowRight size={18} />
              </Button>
              
              <p className="text-center text-muted-brown text-sm">
                ¿Ya eres parte?{' '}
                <Link to="/login" className="text-primary-600 font-black hover:underline">Inicia Sesión</Link>
              </p>
            </form>
          </Card>
        </motion.div>

        {/* Lado Derecho Visual */}
        <div className="hidden lg:flex flex-1 flex-col justify-center max-w-sm">
          <div className="space-y-12">
            <div className="space-y-4">
              <ShieldCheck size={48} className="text-primary-500" />
              <h3 className="text-4xl font-black text-ink leading-tight tracking-tighter">Tu negocio merece el <span className="text-primary-500 italic">máximo</span> nivel.</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { title: "Seguridad de Grado Bancario", desc: "Tus datos y órdenes están protegidos." },
                { title: "Gestión en Tiempo Real", desc: "Control total desde cualquier dispositivo." },
                { title: "Diseño Intuitivo", desc: "Pensado para la rapidez del servicio." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-ink">{item.title}</h4>
                    <p className="text-sm text-muted-brown font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

