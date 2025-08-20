const express = require('express');
const NoticiaController = require('../controllers/NoticiaController');

const router = express.Router();

// Buscar todas as notícias
router.get('/', NoticiaController.buscarNoticias);

// Buscar notícias por categoria (para o dashboard)
router.get('/categorias', NoticiaController.buscarNoticiasPorCategoria);

// Atualizar feeds RSS manualmente
router.post('/atualizar-feeds', NoticiaController.atualizarFeeds);

// Estatísticas das notícias
router.get('/estatisticas', NoticiaController.estatisticas);

module.exports = router;