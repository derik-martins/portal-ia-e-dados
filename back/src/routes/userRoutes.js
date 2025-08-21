const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Rotas públicas (não requerem autenticação)
router.get('/', UserController.listarUsuarios);
router.get('/skills-populares', UserController.listarSkillsPopulares);
router.get('/interesses-populares', UserController.listarInteressesPopulares);
router.get('/buscar', UserController.buscarPorSkillOuInteresse);
router.get('/:id', UserController.buscarUsuarioPorId);

module.exports = router;
