import { User, UserProfile, UserEmail } from '../src/users/user.model.js';
import { Role, UserRole } from '../src/auth/role.model.js';
import { hashPassword } from '../utils/password-utils.js';
import { ADMIN_ROLE } from './role-constants.js';

/**
 * Crea un usuario ADMIN por defecto si no existe
 */
export const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@restaurantes.com';
    const existingAdmin = await User.findOne({
      where: { Email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Usuario ADMIN por defecto ya existe en el sistema.');
      return;
    }

    // 1. Buscar o crear el rol ADMIN
    let adminRole = await Role.findOne({
      where: { Name: ADMIN_ROLE },
    });

    if (!adminRole) {
      adminRole = await Role.create({
        Name: ADMIN_ROLE,
      });
    }

    // 2. Hashear la contraseña por defecto
    const defaultPassword = 'Admin123!';
    const hashedPassword = await hashPassword(defaultPassword);

    // 3. Crear el usuario ADMIN
    const adminUser = await User.create({
      Name: 'Administrador',
      Surname: 'Sistema',
      Username: 'admin',
      Email: adminEmail,
      Password: hashedPassword,
      Status: true,
    });

    // 4. Crear el perfil del usuario
    await UserProfile.create({
      UserId: adminUser.Id,
      ProfilePicture: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
      Phone: '00000000',
    });

    // 5. Crear el registro de email (ya verificado)
    await UserEmail.create({
      UserId: adminUser.Id,
      EmailVerified: true,
      EmailVerificationToken: null,
      EmailVerificationTokenExpiry: null,
    });

    // 6. Asignar el rol ADMIN
    await UserRole.create({
      UserId: adminUser.Id,
      RoleId: adminRole.Id,
    });

    // Mensaje simple
    console.log('🎉 ADMIN creado por defecto: admin@restaurantes.com / Admin123!');
  } catch (error) {
    console.error('❌ Error al crear usuario ADMIN:', error.message);
  }
};