const InsigniaModel = require('../models/InsigniaModel');
const { validationResult } = require('express-validator');

class InsigniaController {
  // Listar todas as insígnias (admin)
  static async listarTodas(req, res) {
    try {
      const apenasAtivas = req.query.ativas !== 'false';
      const insignias = await InsigniaModel.listarTodas(apenasAtivas);
      
      res.json({
        success: true,
        data: { insignias }
      });
    } catch (error) {
      console.error('Erro ao listar insígnias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar insígnia por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const insignia = await InsigniaModel.buscarPorId(parseInt(id));
      
      if (!insignia) {
        return res.status(404).json({
          success: false,
          message: 'Insígnia não encontrada'
        });
      }
      
      res.json({
        success: true,
        data: { insignia }
      });
    } catch (error) {
      console.error('Erro ao buscar insígnia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar nova insígnia (admin)
  static async criar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { nome, descricao, imagem_url, pontos, cor } = req.body;
      
      const insignia = await InsigniaModel.criar({
        nome,
        descricao,
        imagem_url,
        pontos: parseInt(pontos),
        cor
      });
      
      res.status(201).json({
        success: true,
        message: 'Insígnia criada com sucesso',
        data: { insignia }
      });
    } catch (error) {
      console.error('Erro ao criar insígnia:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Uma insígnia com este nome já existe'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar insígnia (admin)
  static async atualizar(req, res) {
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
      const { nome, descricao, imagem_url, pontos, cor, ativo } = req.body;
      
      const insigniaExistente = await InsigniaModel.buscarPorId(parseInt(id));
      if (!insigniaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Insígnia não encontrada'
        });
      }
      
      const insignia = await InsigniaModel.atualizar(parseInt(id), {
        nome,
        descricao,
        imagem_url,
        pontos: parseInt(pontos),
        cor,
        ativo: ativo !== undefined ? ativo : true
      });
      
      res.json({
        success: true,
        message: 'Insígnia atualizada com sucesso',
        data: { insignia }
      });
    } catch (error) {
      console.error('Erro ao atualizar insígnia:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Uma insígnia com este nome já existe'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar insígnia (admin)
  static async deletar(req, res) {
    try {
      const { id } = req.params;
      
      const insigniaExistente = await InsigniaModel.buscarPorId(parseInt(id));
      if (!insigniaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Insígnia não encontrada'
        });
      }
      
      await InsigniaModel.deletar(parseInt(id));
      
      res.json({
        success: true,
        message: 'Insígnia deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar insígnia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Conceder insígnia para usuário (admin)
  static async concederParaUsuario(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { userId, insigniaId, observacoes } = req.body;
      const concedidaPor = req.userId;
      
      const resultado = await InsigniaModel.concederParaUsuario(
        parseInt(userId),
        parseInt(insigniaId),
        concedidaPor,
        observacoes
      );
      
      if (!resultado) {
        return res.status(400).json({
          success: false,
          message: 'Usuário já possui esta insígnia'
        });
      }
      
      res.json({
        success: true,
        message: 'Insígnia concedida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao conceder insígnia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Remover insígnia do usuário (admin)
  static async removerDoUsuario(req, res) {
    try {
      const { userId, insigniaId } = req.params;
      
      await InsigniaModel.removerDoUsuario(
        parseInt(userId),
        parseInt(insigniaId)
      );
      
      res.json({
        success: true,
        message: 'Insígnia removida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover insígnia:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar insígnias de um usuário (público)
  static async listarPorUsuario(req, res) {
    try {
      const { userId } = req.params;
      
      const insignias = await InsigniaModel.listarPorUsuario(parseInt(userId));
      const pontos = await InsigniaModel.calcularPontosUsuario(parseInt(userId));
      
      res.json({
        success: true,
        data: {
          insignias,
          total_pontos: pontos
        }
      });
    } catch (error) {
      console.error('Erro ao listar insígnias do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Ranking de usuários por pontos (público)
  static async rankingUsuarios(req, res) {
    try {
      const limite = parseInt(req.query.limite) || 10;
      const ranking = await InsigniaModel.rankingUsuarios(limite);
      
      res.json({
        success: true,
        data: { ranking }
      });
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = InsigniaController;
