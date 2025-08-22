const express = require('express');
const { body, param } = require('express-validator');
const InsigniaController = require('../controllers/InsigniaController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validações
const insigniaValidation = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('imagem_url')
    .optional()
    .trim(),
  body('pontos')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Pontos deve ser um número inteiro entre 0 e 10000'),
  body('cor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)')
];

const concessaoValidation = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('ID do usuário deve ser um número válido'),
  body('insigniaId')
    .isInt({ min: 1 })
    .withMessage('ID da insígnia deve ser um número válido'),
  body('observacoes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres')
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

// Rotas públicas
router.get('/ranking', InsigniaController.rankingUsuarios);
router.get('/usuario/:userId', InsigniaController.listarPorUsuario);

// Rotas que requerem autenticação
router.use(authMiddleware);

// Rotas administrativas - requerem ser admin
router.get('/', adminMiddleware, InsigniaController.listarTodas);
router.get('/:id', [adminMiddleware, ...idValidation], InsigniaController.buscarPorId);
router.post('/', [adminMiddleware, ...insigniaValidation], InsigniaController.criar);
router.post('/upload-imagem', [adminMiddleware, upload.single('imagem')], InsigniaController.uploadImagem);
router.put('/:id', [adminMiddleware, ...idValidation, ...insigniaValidation], InsigniaController.atualizar);
router.delete('/:id', [adminMiddleware, ...idValidation], InsigniaController.deletar);

// Concessão e remoção de insígnias
router.post('/conceder', [adminMiddleware, ...concessaoValidation], InsigniaController.concederParaUsuario);
router.delete('/usuario/:userId/insignia/:insigniaId', adminMiddleware, InsigniaController.removerDoUsuario);

module.exports = router;
