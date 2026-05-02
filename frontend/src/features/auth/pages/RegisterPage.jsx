import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Upload, Sparkles, ChefHat, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import Grainient from '../../../shared/components/ui/Grainient';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        profilePicture: null
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('surname', formData.surname);
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('phone', formData.phone);
        if (formData.profilePicture) {
            data.append('profilePicture', formData.profilePicture);
        }

        const result = await register(data);

        if (result.success) {
            toast.success(result.message || '¡Registro exitoso! Por favor verifica tu correo.');
            navigate('/login');
        } else {
            toast.error(result.error);
            if (result.details && result.details.length > 0) {
                toast.error(result.details[0].message);
            }
        }
    };

    return (
        <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden font-inter py-12 px-6">
            {/* Background Effect */}
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
                    color1="#4B1F4B"
                    color2="#2F0F6F"
                    color3="#3A243A"
                />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-12">

                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-[600px]"
                >
                    <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-purple-500/20 shadow-2xl p-8 lg:p-12 h-full">
                        <div className="mb-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <ChefHat className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Crear Cuenta</h2>
                            </div>
                            <p className="text-zinc-400 font-medium">Únete a la plataforma de gestión gastronómica líder.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            name="name" type="text" required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-800 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="Tu nombre"
                                            value={formData.name} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Apellido</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            name="surname" type="text" required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-800 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="Tu apellido"
                                            value={formData.surname} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Usuario</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            name="username" type="text" required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-800 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="usuario_123"
                                            value={formData.username} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            name="phone" type="text" required pattern="\d{8}"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-800 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="12345678"
                                            value={formData.phone} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="group md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Email Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            name="email" type="email" required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-800 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="tu@email.com"
                                            value={formData.email} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="group md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Contraseña de Acceso</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            name="password" type="password" required minLength="8"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-800 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                            placeholder="••••••••"
                                            value={formData.password} onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="group md:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Foto de Perfil (Opcional)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-800 rounded-3xl cursor-pointer bg-black/20 hover:bg-black/40 hover:border-purple-500/50 transition-all">
                                        <Upload className="w-6 h-6 text-zinc-700 mb-1" />
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase">Subir Imagen</p>
                                        <input name="profilePicture" type="file" className="hidden" onChange={handleChange} />
                                    </label>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" disabled={isLoading}
                                className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        <span>Registrarse</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>

                            <div className="text-center">
                                <p className="text-zinc-500 text-sm font-medium">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link to="/login" className="text-purple-400 font-black hover:text-purple-300">
                                        Inicia Sesión
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Right Section (Visual) */}
                <div className="hidden lg:flex flex-1 flex-col justify-center items-start text-white">
                    <div className="p-8 bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-purple-500/10 max-w-md">
                        <ShieldCheck className="w-12 h-12 text-purple-500 mb-6" />
                        <h3 className="text-4xl font-black mb-6 leading-tight">Seguridad y Control <br /> en un solo <span className="text-purple-500 italic">Lugar</span></h3>
                        <ul className="space-y-6">
                            {[
                                "Protección de datos AES-256",
                                "Gestión multi-restaurante",
                                "Analítica avanzada en tiempo real"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    <span className="text-zinc-300 font-medium">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};