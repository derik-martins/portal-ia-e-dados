const express = require('express');
const AdminUserController = require('../controllers/AdminUserController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { 
  adminCreateUserValidation, 
  adminUpdateUserValidation,
  statusValidation 
} = require('../middleware/validation');

const router = express.Router();

// Todas as rotas requerem autenticação e privilégios de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Listar usuários
router.get('/usuarios', AdminUserController.listarUsuarios);

// Criar novo usuário
router.post('/usuarios', adminCreateUserValidation, AdminUserController.criarUsuario);

// Buscar usuário por ID
router.get('/usuarios/:id', AdminUserController.buscarUsuario);

// Atualizar usuário
router.put('/usuarios/:id', adminUpdateUserValidation, AdminUserController.atualizarUsuario);

// Alterar status do usuário
router.patch('/usuarios/:id/status', statusValidation, AdminUserController.alterarStatusUsuario);

// Excluir usuário
router.delete('/usuarios/:id', AdminUserController.excluirUsuario);

module.exports = router;
