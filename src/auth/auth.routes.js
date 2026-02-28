import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateProfileByIdBody } from '../../middlewares/validate-params.js';
import {
  authRateLimit,
  requestLimit,
} from '../../middlewares/request-limit.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
} from '../../middlewares/validation.js';
import { validatePasswordStrength } from '../../utils/password-utils.js';
import { body } from 'express-validator';

const router = Router();

// ─── Validaciones para actualizar perfil ──────────────────────────────────────
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ max: 25 }).withMessage('El nombre no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),

  body('surname')
    .optional()
    .trim()
    .notEmpty().withMessage('El apellido no puede estar vacío')
    .isLength({ max: 25 }).withMessage('El apellido no puede tener más de 25 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras y espacios'),

  body('username')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre de usuario no puede estar vacío')
    .isLength({ max: 50 }).withMessage('El nombre de usuario no puede tener más de 50 caracteres'),

  body('phone')
    .optional()
    .matches(/^\d{8}$/).withMessage('El teléfono debe tener exactamente 8 dígitos'),

  handleValidationErrors,
];

// ─── Validaciones para cambiar contraseña ────────────────────────────────────
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es obligatoria'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 8, max: 255 }).withMessage('La nueva contraseña debe tener entre 8 y 255 caracteres')
    .custom((value) => {
      const { isValid, errors: strengthErrors } = validatePasswordStrength(value);
      if (!isValid) throw new Error(strengthErrors.join('. '));
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es obligatoria'),

  handleValidationErrors,
];

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Registra un nuevo usuario
 */
router.post(
  '/register',
  authRateLimit,
  upload.single('profilePicture'),
  handleUploadError,
  validateRegister,
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Autentica un usuario
 */
router.post('/login', authRateLimit, validateLogin, authController.login);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     tags: [Authentication]
 *     summary: Verifica el email del usuario
 */
router.post(
  '/verify-email',
  requestLimit,
  validateVerifyEmail,
  authController.verifyEmail
);

/**
 * @swagger
 * /api/v1/auth/resend-verification:
 *   post:
 *     tags: [Authentication]
 *     summary: Reenvía el email de verificación
 */
router.post(
  '/resend-verification',
  authRateLimit,
  validateResendVerification,
  authController.resendVerification
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Inicia recuperación de contraseña
 */
router.post(
  '/forgot-password',
  authRateLimit,
  validateForgotPassword,
  authController.forgotPassword
);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Resetea la contraseña
 */
router.post(
  '/reset-password',
  authRateLimit,
  validateResetPassword,
  authController.resetPassword
);

// ─── PROFILE ROUTES ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Obtiene el perfil del usuario autenticado
 */
router.get('/profile', validateJWT, authController.getProfile);

/**
 * @swagger
 * /api/v1/auth/profile/by-id:
 *   post:
 *     tags: [Profile]
 *     summary: Obtiene el perfil del usuario por ID
 */
router.post('/profile/by-id', requestLimit, validateProfileByIdBody, authController.getProfileById);

/**
 * IMPORTANTE: change-password va ANTES de /profile (PUT)
 * para que Express no confunda la ruta
 *
 * @swagger
 * /api/v1/auth/profile/change-password:
 *   put:
 *     tags: [Profile]
 *     summary: Cambia la contraseña (requiere la contraseña actual)
 */
router.put(
  '/profile/change-password',
  validateJWT,
  validateChangePassword,
  authController.changePassword
);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Edita el perfil (name, surname, username, phone, foto)
 */
router.put(
  '/profile',
  validateJWT,
  upload.single('profilePicture'),
  handleUploadError,
  validateUpdateProfile,
  authController.updateProfile
);

export default router;