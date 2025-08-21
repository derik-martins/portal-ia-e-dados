const DicaModel = require('../models/DicaModel');
const { validationResult } = require('express-validator');

class DicaController {
  static async listarDicas(req, res) {
    try {
      const { categoria, tag, busca, limite } = req.query;
      
      const filtros = {};
      if (categoria) filtros.categoria = categoria;
      if (tag) filtros.tag = tag;
      if (busca) filtros.busca = busca;
      if (limite) filtros.limite = parseInt(limite);

      const dicas = await DicaModel.buscarTodas(filtros);
      
      res.json({
        success: true,
        data: dicas,
        total: dicas.length
      });
    } catch (error) {
      console.error('Erro ao listar dicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async obterDica(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const dica = await DicaModel.buscarPorId(parseInt(id));
      
      if (!dica) {
        return res.status(404).json({
          success: false,
          message: 'Dica não encontrada'
        });
      }

      res.json({
        success: true,
        data: dica
      });
    } catch (error) {
      console.error('Erro ao obter dica:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async criarDica(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const {
        titulo,
        categoria,
        descricao_breve,
        conteudo,
        tempo_leitura,
        imagem_header,
        tags
      } = req.body;

      const dadosDica = {
        titulo,
        categoria,
        descricao_breve,
        conteudo,
        tempo_leitura: tempo_leitura || 1,
        imagem_header: imagem_header || null,
        tags: tags || [],
        autor_id: req.userId
      };

      const novaDica = await DicaModel.criar(dadosDica);
      
      res.status(201).json({
        success: true,
        message: 'Dica criada com sucesso',
        data: novaDica
      });
    } catch (error) {
      console.error('Erro ao criar dica:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async atualizarDica(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const {
        titulo,
        categoria,
        descricao_breve,
        conteudo,
        tempo_leitura,
        imagem_header,
        tags
      } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const dadosDica = {
        titulo,
        categoria,
        descricao_breve,
        conteudo,
        tempo_leitura,
        imagem_header,
        tags: tags || []
      };

      const dicaAtualizada = await DicaModel.atualizar(parseInt(id), dadosDica, req.userId);
      
      if (!dicaAtualizada) {
        return res.status(404).json({
          success: false,
          message: 'Dica não encontrada ou você não tem permissão para editá-la'
        });
      }

      res.json({
        success: true,
        message: 'Dica atualizada com sucesso',
        data: dicaAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar dica:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async excluirDica(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const sucesso = await DicaModel.excluir(parseInt(id), req.userId);
      
      if (!sucesso) {
        return res.status(404).json({
          success: false,
          message: 'Dica não encontrada ou você não tem permissão para excluí-la'
        });
      }

      res.json({
        success: true,
        message: 'Dica excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir dica:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async listarMinhasDicas(req, res) {
    try {
      const dicas = await DicaModel.buscarPorAutor(req.userId);
      
      res.json({
        success: true,
        data: dicas,
        total: dicas.length
      });
    } catch (error) {
      console.error('Erro ao listar minhas dicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async obterCategorias(req, res) {
    try {
      const categorias = await DicaModel.buscarCategorias();
      
      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async obterTags(req, res) {
    try {
      const tags = await DicaModel.buscarTags();
      
      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Erro ao obter tags:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = DicaController;
