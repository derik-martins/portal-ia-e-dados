const express = require('express');
const ChatController = require('../controllers/ChatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Inicializar tabelas (pode ser removido após primeira execução)
router.post('/init', ChatController.inicializarTabelas);

// Listar conversas do usuário
router.get('/conversas', ChatController.listarConversas);

// Criar nova conversa
router.post('/conversas', ChatController.criarConversa);

// Buscar conversa específica
router.get('/conversas/:id', ChatController.buscarConversa);

// Enviar mensagem em uma conversa
router.post('/conversas/:id/mensagens', ChatController.enviarMensagem);

// Atualizar título da conversa
router.put('/conversas/:id/titulo', ChatController.atualizarTitulo);

// Deletar conversa
router.delete('/conversas/:id', ChatController.deletarConversa);

module.exports = router;
