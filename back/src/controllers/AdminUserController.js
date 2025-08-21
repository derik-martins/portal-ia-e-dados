const UserModel = require('../models/UserModel');
const { validationResult } = require('express-validator');

class AdminUserController {
  // Listar todos os usuários (apenas admin)
  static async listarUsuarios(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const result = await UserModel.listarTodos(limit, offset);
      const total = await UserModel.contarUsuarios();

      res.status(200).json({
        success: true,
        data: {
          usuarios: result,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar novo usuário (apenas admin)
  static async criarUsuario(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password, name, role = 'user' } = req.body;
      
      // Verificar se o email já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      // Criar usuário
      const user = await UserModel.create({ email, password, name, role });
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user }
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar usuário por ID (apenas admin)
  static async buscarUsuario(req, res) {
    try {
      const { id } = req.params;
      
      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar usuário (apenas admin)
  static async atualizarUsuario(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { name, email, role } = req.body;
      
      // Verificar se o usuário existe
      const existingUser = await UserModel.findById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se o email já está em uso por outro usuário
      if (email && email !== existingUser.email) {
        const emailExists = await UserModel.findByEmail(email);
        if (emailExists && emailExists.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Email já está em uso por outro usuário'
          });
        }
      }

      // Atualizar usuário
      const updatedUser = await UserModel.atualizarUsuario(parseInt(id), { name, email, role });
      
      res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Excluir usuário (apenas admin)
  static async excluirUsuario(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se o usuário existe
      const existingUser = await UserModel.findById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Não permitir que um admin exclua a si mesmo
      if (parseInt(id) === req.userId) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode excluir sua própria conta'
        });
      }

      // Excluir usuário
      await UserModel.excluirUsuario(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Alterar status do usuário (ativo/inativo)
  static async alterarStatusUsuario(req, res) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;
      
      // Verificar se o usuário existe
      const existingUser = await UserModel.findById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Não permitir que um admin desative a si mesmo
      if (parseInt(id) === req.userId && !ativo) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode desativar sua própria conta'
        });
      }

      // Atualizar status
      const updatedUser = await UserModel.alterarStatus(parseInt(id), ativo);
      
      res.status(200).json({
        success: true,
        message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AdminUserController;
