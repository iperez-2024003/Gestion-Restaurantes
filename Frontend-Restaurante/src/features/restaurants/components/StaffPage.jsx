import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStaffStore } from '../store/useStaffStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { UserPlus, Search, UserCircle, Mail, Phone, Calendar, ArrowLeftRight, ShieldCheck, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../../shared/utils/getImageUrl';

const StaffAvatar = ({ name, surname, profilePicture }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const fullName = `${name || ''} ${surname || ''}`.trim();

  if (!profilePicture || imageFailed) {
    return <span className="font-black text-[#8b6435]">{name?.charAt(0) || 'U'}</span>;
  }

  return (
    <img
      src={getImageUrl(profilePicture)}
      alt={fullName || 'Perfil'}
      className="w-full h-full object-cover"
      onError={() => setImageFailed(true)}
    />
  );
};

export const StaffPage = () => {
  const { id } = useParams();
  const { staff, loading, getStaff, updateRole, createStaff } = useStaffStore();
  const { restaurants } = useRestaurantStore();

  const [formData, setFormData] = useState({
    name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'STAFF_ROLE'
  });

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    if (id) getStaff(id);
  }, [id]);

  const handleToggleRole = async (member) => {
    const newRole = member.role === 'STAFF_ROLE' ? 'RESTAURANT_ADMIN_ROLE' : 'STAFF_ROLE';
    const confirmMsg = `¿Deseas cambiar el rango de ${member.name} a ${newRole === 'RESTAURANT_ADMIN_ROLE' ? 'Administrador' : 'Staff'}?`;

    if (window.confirm(confirmMsg)) {
      await updateRole(id, member.id, newRole);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createStaff(id, formData);
    if (success) {
      setFormData({ name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'STAFF_ROLE' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] mb-2">
          Gestión de <span className="text-[#b98c52]">Staff</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
          Control operativo de {restaurant?.name || 'la sede'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Formulario de Registro */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.12)]">
            <h2 className="text-2xl font-black text-ink mb-8 tracking-tight uppercase">Alta de Personal</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink/80 uppercase tracking-widest px-1">Nombre</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#fffdf9] border border-[#dcc7a5] rounded-xl px-4 py-3 text-sm font-medium text-ink focus:border-[#b98c52] focus:ring-2 focus:ring-[#d7b77f]/20 outline-none transition-all placeholder:text-zinc-400" placeholder="Juan" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink/80 uppercase tracking-widest px-1">Apellido</label>
                  <input required name="surname" value={formData.surname} onChange={handleChange} className="w-full bg-[#fffdf9] border border-[#dcc7a5] rounded-xl px-4 py-3 text-sm font-medium text-ink focus:border-[#b98c52] focus:ring-2 focus:ring-[#d7b77f]/20 outline-none transition-all placeholder:text-zinc-400" placeholder="Pérez" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink/80 uppercase tracking-widest px-1">Usuario</label>
                <input required name="username" value={formData.username} onChange={handleChange} className="w-full bg-[#fffdf9] border border-[#dcc7a5] rounded-xl px-4 py-3 text-sm font-medium text-ink focus:border-[#b98c52] focus:ring-2 focus:ring-[#d7b77f]/20 outline-none transition-all placeholder:text-zinc-400" placeholder="juan_p" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink/80 uppercase tracking-widest px-1">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#fffdf9] border border-[#dcc7a5] rounded-xl px-4 py-3 text-sm font-medium text-ink focus:border-[#b98c52] focus:ring-2 focus:ring-[#d7b77f]/20 outline-none transition-all placeholder:text-zinc-400" placeholder="staff@correo.com" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink/80 uppercase tracking-widest px-1">Contraseña</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#fffdf9] border border-[#dcc7a5] rounded-xl px-4 py-3 text-sm font-medium text-ink focus:border-[#b98c52] focus:ring-2 focus:ring-[#d7b77f]/20 outline-none transition-all placeholder:text-zinc-400" placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink/80 uppercase tracking-widest px-1">Rol Operativo</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#fffdf9] border border-[#dcc7a5] rounded-xl px-4 py-3 text-sm font-medium text-ink focus:border-[#b98c52] focus:ring-2 focus:ring-[#d7b77f]/20 outline-none transition-all appearance-none cursor-pointer">
                  <option value="STAFF_ROLE">Personal de Sala</option>
                  <option value="RESTAURANT_ADMIN_ROLE">Administrador de Sede</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black hover:to-[#a97d45] transition-all uppercase tracking-widest text-xs shadow-lg shadow-[rgba(185,140,82,0.2)] disabled:opacity-50">
                {loading ? 'Procesando...' : 'Registrar Miembro'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de Staff */}
        <div className="flex-1">
          {loading && staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="w-12 h-12 text-[#b98c52] animate-spin" />
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Plantilla...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-zinc-900/20 rounded-[4rem] p-24 text-center border border-dashed border-zinc-800 h-full flex flex-col justify-center">
              <User className="w-20 h-20 text-zinc-800 mx-auto mb-8" />
              <h3 className="text-2xl font-black text-white uppercase">Sede sin Personal</h3>
              <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-widest">Inicia el registro para gestionar tu equipo.</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-[#dcc7a5]/70 overflow-hidden shadow-[0_30px_100px_rgba(110,80,45,0.12)]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/50 border-b border-[#dcc7a5]/50">
                    <th className="px-6 md:px-10 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ink/80">Colaborador</th>
                    <th className="px-6 md:px-10 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ink/80 text-center">Rango</th>
                    <th className="px-6 md:px-10 py-5 md:py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ink/80 text-right">Mando</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dcc7a5]/20">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-[#fffaf3]/60 transition-colors group">
                      <td className="px-6 md:px-10 py-6 md:py-8">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#fffaf3] border border-[#dcc7a5] overflow-hidden flex items-center justify-center shrink-0">
                            <StaffAvatar name={member.name} surname={member.surname} profilePicture={member.profilePicture} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-ink text-sm md:text-base tracking-tight truncate">{member.name} {member.surname}</div>
                            <div className="text-[9px] md:text-[10px] text-muted-brown font-black uppercase tracking-widest truncate">@{member.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                        <span className={`inline-block px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black tracking-widest uppercase border ${member.role === 'RESTAURANT_ADMIN_ROLE'
                            ? 'border-[#d7b77f]/30 text-[#b98c52] bg-[#fffaf3]'
                            : 'border-emerald-500/30 text-emerald-700 bg-emerald-50'
                          }`}>
                          {member.role === 'RESTAURANT_ADMIN_ROLE' ? '👑 Admin' : '🛡️ Staff'}
                        </span>
                      </td>
                      <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                        <button
                          onClick={() => handleToggleRole(member)}
                          className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white hover:to-[#a97d45] transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-[#d7b77f]/30 flex items-center gap-2 md:gap-3 ml-auto"
                        >
                          <ArrowLeftRight className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Alternar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
