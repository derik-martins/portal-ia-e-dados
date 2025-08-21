const { body, check } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validação para criação de usuário por admin
const adminCreateUserValidation = [
  check('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  check('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  check('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Cargo deve ser user ou admin')
];

// Validação para atualização de usuário por admin
const adminUpdateUserValidation = [
  check('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  check('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Cargo deve ser user ou admin')
];

// Validação para alteração de status
const statusValidation = [
  check('ativo')
    .isBoolean()
    .withMessage('Status deve ser verdadeiro ou falso')
];

module.exports = {
  registerValidation,
  loginValidation,
  adminCreateUserValidation,
  adminUpdateUserValidation,
  statusValidation
};
