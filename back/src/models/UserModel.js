const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  static async create(userData) {
    const { email, password, name, role = 'user' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role, ativo) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, ativo, created_at',
      [email, hashedPassword, name, role, true]
    );
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  }
  
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Métodos para administração de usuários
  static async listarTodos(limit = 10, offset = 0) {
    const result = await pool.query(
      'SELECT id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    return result.rows;
  }

  static async contarUsuarios() {
    const result = await pool.query('SELECT COUNT(*) as total FROM users');
    return parseInt(result.rows[0].total);
  }

  static async atualizarUsuario(id, userData) {
    const { name, email, role } = userData;
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at',
      [name, email, role, id]
    );
    
    return result.rows[0];
  }

  static async excluirUsuario(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    return result.rowCount > 0;
  }

  static async alterarStatus(id, ativo) {
    const result = await pool.query(
      'UPDATE users SET ativo = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at',
      [ativo, id]
    );
    
    return result.rows[0];
  }

  // Métodos específicos para o perfil do usuário
  static async atualizarPerfil(id, profileData) {
    const { 
      name, 
      bio, 
      linkedin_url, 
      github_url, 
      website_url, 
      interests, 
      skills, 
      location, 
      phone 
    } = profileData;
    
    const result = await pool.query(
      `UPDATE users SET 
        name = $1, 
        bio = $2, 
        linkedin_url = $3, 
        github_url = $4, 
        website_url = $5, 
        interests = $6, 
        skills = $7, 
        location = $8, 
        phone = $9, 
        updated_at = NOW() 
      WHERE id = $10 
      RETURNING id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at`,
      [name, bio, linkedin_url, github_url, website_url, interests, skills, location, phone, id]
    );
    
    return result.rows[0];
  }

  static async atualizarFotoPerfil(id, profile_image) {
    const result = await pool.query(
      'UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at',
      [profile_image, id]
    );
    
    return result.rows[0];
  }

  static async atualizarBannerPerfil(id, banner_image) {
    const result = await pool.query(
      'UPDATE users SET banner_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, ativo, bio, profile_image, banner_image, linkedin_url, github_url, website_url, interests, skills, location, phone, created_at, updated_at',
      [banner_image, id]
    );
    
    return result.rows[0];
  }
}

module.exports = UserModel;
