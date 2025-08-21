const express = require('express');
const { body } = require('express-validator');
const EventoController = require('../controllers/EventoController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Validações
const eventoValidation = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título deve ter entre 3 e 255 caracteres'),
  body('start_date')
    .notEmpty()
    .withMessage('Data de início é obrigatória')
    .isISO8601()
    .withMessage('Data de início deve estar em formato válido'),
  body('end_date')
    .notEmpty()
    .withMessage('Data de fim é obrigatória')
    .isISO8601()
    .withMessage('Data de fim deve estar em formato válido')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    }),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('event_type')
    .optional()
    .isIn(['aula', 'evento', 'feriado', 'prova'])
    .withMessage('Tipo de evento inválido')
];

// Rotas públicas (apenas leitura para usuários autenticados)
router.get('/', authMiddleware, EventoController.getAll);
router.get('/:id', authMiddleware, EventoController.getById);

// Rotas administrativas (apenas admins)
router.post('/', authMiddleware, adminMiddleware, eventoValidation, EventoController.create);
router.put('/:id', authMiddleware, adminMiddleware, eventoValidation, EventoController.update);
router.put('/:id/similar', authMiddleware, adminMiddleware, eventoValidation, EventoController.updateSimilarEvents);
router.delete('/:id', authMiddleware, adminMiddleware, EventoController.delete);

// Rota especial para criar aulas recorrentes
router.post('/recurring/classes', authMiddleware, adminMiddleware, EventoController.createRecurringClasses);

// Rota especial para deletar aulas de 2024
router.delete('/classes/2024', authMiddleware, adminMiddleware, EventoController.delete2024Classes);

module.exports = router;