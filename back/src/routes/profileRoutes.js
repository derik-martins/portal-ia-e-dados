const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/ProfileController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Validação para atualização de perfil
const validateProfileUpdate = [
  body('name')
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres')
    .trim()
    .escape(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio deve ter no máximo 500 caracteres')
    .trim(),
  body('linkedin_url')
    .optional()
    .isURL()
    .withMessage('URL do LinkedIn inválida'),
  body('github_url')
    .optional()
    .isURL()
    .withMessage('URL do GitHub inválida'),
  body('website_url')
    .optional()
    .isURL()
    .withMessage('URL do website inválida'),
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Localização deve ter no máximo 255 caracteres')
    .trim(),
  body('phone')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Telefone deve ter no máximo 50 caracteres')
    .trim(),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interesses devem ser um array'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills devem ser um array')
];

// Rotas
router.get('/', ProfileController.getProfile);
router.put('/', validateProfileUpdate, ProfileController.updateProfile);
router.post('/image', upload.single('profileImage'), ProfileController.updateProfileImage);
router.delete('/image', ProfileController.removeProfileImage);
router.post('/banner', upload.single('bannerImage'), ProfileController.updateBannerImage);
router.delete('/banner', ProfileController.removeBannerImage);

module.exports = router;
