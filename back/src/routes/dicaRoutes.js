const express = require('express');
const { body } = require('express-validator');
const DicaController = require('../controllers/DicaController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validações para criar/atualizar dicas
const validacoesDica = [
  body('titulo')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 5, max: 255 })
    .withMessage('Título deve ter entre 5 e 255 caracteres'),
  
  body('categoria')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .isLength({ min: 2, max: 100 })
    .withMessage('Categoria deve ter entre 2 e 100 caracteres'),
  
  body('descricao_breve')
    .notEmpty()
    .withMessage('Descrição breve é obrigatória')
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição breve deve ter entre 10 e 500 caracteres'),
  
  body('conteudo')
    .notEmpty()
    .withMessage('Conteúdo é obrigatório')
    .custom((value) => {
      if (typeof value !== 'object') {
        throw new Error('Conteúdo deve ser um objeto JSON válido');
      }
      // Aceitar tanto array quanto objeto com propriedade blocks
      if (Array.isArray(value.blocks) || (typeof value.blocks === 'object' && value.blocks !== null)) {
        return true;
      }
      throw new Error('Conteúdo deve ter pelo menos um bloco');
    }),
  
  body('tempo_leitura')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Tempo de leitura deve ser um número entre 1 e 120 minutos'),
  
  body('imagem_header')
    .optional()
    .custom((value) => {
      // Aceitar string vazia ou URL válida
      if (value === '' || value === null || value === undefined) {
        return true;
      }
      // Se não for vazio, deve ser uma URL válida
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      if (urlRegex.test(value)) {
        return true;
      }
      throw new Error('URL da imagem do header deve ser válida');
    }),
  
  body('tags')
    .optional()
    .custom((tags) => {
      // Se for undefined/null, aceitar
      if (!tags) return true;
      
      // Se for um objeto (como { '0': 'tag1', '1': 'tag2' }), converter para array
      if (typeof tags === 'object' && !Array.isArray(tags)) {
        const tagArray = Object.values(tags).filter(tag => tag && typeof tag === 'string');
        if (tagArray.length > 10) {
          throw new Error('Máximo de 10 tags permitidas');
        }
        return true;
      }
      
      // Se for array, validar normalmente
      if (Array.isArray(tags)) {
        if (tags.length > 10) {
          throw new Error('Máximo de 10 tags permitidas');
        }
        for (let tag of tags) {
          if (typeof tag !== 'string' || tag.length < 2 || tag.length > 50) {
            throw new Error('Cada tag deve ser uma string entre 2 e 50 caracteres');
          }
        }
        return true;
      }
      
      throw new Error('Tags deve ser um array ou objeto');
    })
];

// Rotas públicas
router.get('/', DicaController.listarDicas);
router.get('/categorias', DicaController.obterCategorias);
router.get('/tags', DicaController.obterTags);

// Rotas protegidas (requer autenticação)
router.get('/usuario/minhas', authMiddleware, DicaController.listarMinhasDicas);
router.post('/', authMiddleware, validacoesDica, DicaController.criarDica);
router.put('/:id', authMiddleware, validacoesDica, DicaController.atualizarDica);
router.delete('/:id', authMiddleware, DicaController.excluirDica);

// Rota específica deve vir por último
router.get('/:id', DicaController.obterDica);

module.exports = router;
