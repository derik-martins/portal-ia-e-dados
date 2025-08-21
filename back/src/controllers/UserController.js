const UserModel = require('../models/UserModel');

class UserController {
  // Listar todos os usuários (público, com perfis básicos)
  static async listarUsuarios(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      let usuarios;
      let total;

      if (search) {
        // Buscar usuários com nome ou email contendo o termo de busca
        const searchResult = await pool.query(`
          SELECT id, email, name, role, bio, profile_image, banner_image, 
                 linkedin_url, github_url, website_url, interests, skills, 
                 location, created_at, updated_at 
          FROM users 
          WHERE ativo = true AND (
            name ILIKE $1 OR 
            email ILIKE $1 OR 
            bio ILIKE $1 OR 
            location ILIKE $1
          )
          ORDER BY created_at DESC 
          LIMIT $2 OFFSET $3
        `, [`%${search}%`, limit, offset]);

        const countResult = await pool.query(`
          SELECT COUNT(*) as total 
          FROM users 
          WHERE ativo = true AND (
            name ILIKE $1 OR 
            email ILIKE $1 OR 
            bio ILIKE $1 OR 
            location ILIKE $1
          )
        `, [`%${search}%`]);

        usuarios = searchResult.rows;
        total = parseInt(countResult.rows[0].total);
      } else {
        // Buscar todos os usuários ativos
        const { pool } = require('../config/database');
        
        const result = await pool.query(`
          SELECT id, email, name, role, bio, profile_image, banner_image, 
                 linkedin_url, github_url, website_url, interests, skills, 
                 location, created_at, updated_at 
          FROM users 
          WHERE ativo = true 
          ORDER BY created_at DESC 
          LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countResult = await pool.query('SELECT COUNT(*) as total FROM users WHERE ativo = true');
        
        usuarios = result.rows;
        total = parseInt(countResult.rows[0].total);
      }

      const pages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          usuarios,
          pagination: {
            page,
            limit,
            total,
            pages,
            hasNext: page < pages,
            hasPrev: page > 1
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

  // Buscar usuário por ID (público, perfil completo)
  static async buscarUsuarioPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuário inválido'
        });
      }

      const usuario = await UserModel.findById(parseInt(id));
      
      if (!usuario || !usuario.ativo) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Remover informações sensíveis
      const { password, ...usuarioPublico } = usuario;

      res.status(200).json({
        success: true,
        data: { usuario: usuarioPublico }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Buscar usuários por skill ou interesse
  static async buscarPorSkillOuInteresse(req, res) {
    try {
      const { skill, interesse } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      if (!skill && !interesse) {
        return res.status(400).json({
          success: false,
          message: 'Informe uma skill ou interesse para buscar'
        });
      }

      const { pool } = require('../config/database');
      let query, params;

      if (skill) {
        query = `
          SELECT id, email, name, role, bio, profile_image, banner_image, 
                 linkedin_url, github_url, website_url, interests, skills, 
                 location, created_at, updated_at 
          FROM users 
          WHERE ativo = true AND skills @> ARRAY[$1]
          ORDER BY created_at DESC 
          LIMIT $2 OFFSET $3
        `;
        params = [skill, limit, offset];
      } else {
        query = `
          SELECT id, email, name, role, bio, profile_image, banner_image, 
                 linkedin_url, github_url, website_url, interests, skills, 
                 location, created_at, updated_at 
          FROM users 
          WHERE ativo = true AND interests @> ARRAY[$1]
          ORDER BY created_at DESC 
          LIMIT $2 OFFSET $3
        `;
        params = [interesse, limit, offset];
      }

      const result = await pool.query(query, params);
      
      res.status(200).json({
        success: true,
        data: { usuarios: result.rows }
      });
    } catch (error) {
      console.error('Erro ao buscar usuários por skill/interesse:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar skills mais populares
  static async listarSkillsPopulares(req, res) {
    try {
      const { pool } = require('../config/database');
      
      const result = await pool.query(`
        SELECT unnest(skills) as skill, COUNT(*) as count
        FROM users 
        WHERE ativo = true AND skills IS NOT NULL 
        GROUP BY skill 
        ORDER BY count DESC 
        LIMIT 20
      `);

      res.status(200).json({
        success: true,
        data: { skills: result.rows }
      });
    } catch (error) {
      console.error('Erro ao listar skills populares:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar interesses mais populares
  static async listarInteressesPopulares(req, res) {
    try {
      const { pool } = require('../config/database');
      
      const result = await pool.query(`
        SELECT unnest(interests) as interesse, COUNT(*) as count
        FROM users 
        WHERE ativo = true AND interests IS NOT NULL 
        GROUP BY interesse 
        ORDER BY count DESC 
        LIMIT 20
      `);

      res.status(200).json({
        success: true,
        data: { interesses: result.rows }
      });
    } catch (error) {
      console.error('Erro ao listar interesses populares:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = UserController;
