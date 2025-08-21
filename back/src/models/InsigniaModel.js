const { pool } = require('../config/database');

class InsigniaModel {
  // Criar tabelas de insígnias se não existirem
  static async criarTabelas() {
    try {
      // Tabela principal de insígnias
      await pool.query(`
        CREATE TABLE IF NOT EXISTS insignias (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(255) NOT NULL UNIQUE,
          descricao TEXT,
          imagem_url VARCHAR(500),
          pontos INTEGER NOT NULL DEFAULT 0,
          cor VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hex
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de insígnias dos usuários (many-to-many)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS usuario_insignias (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          insignia_id INTEGER NOT NULL REFERENCES insignias(id) ON DELETE CASCADE,
          concedida_por INTEGER NOT NULL REFERENCES users(id),
          data_conceicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          observacoes TEXT,
          UNIQUE(user_id, insignia_id)
        )
      `);

      console.log('✓ Tabelas de insígnias criadas/verificadas');
    } catch (error) {
      console.error('Erro ao criar tabelas de insígnias:', error);
      throw error;
    }
  }

  // Listar todas as insígnias
  static async listarTodas(apenasAtivas = true) {
    try {
      const query = `
        SELECT 
          i.*,
          COUNT(ui.id) as total_usuarios
        FROM insignias i
        LEFT JOIN usuario_insignias ui ON i.id = ui.insignia_id
        ${apenasAtivas ? 'WHERE i.ativo = true' : ''}
        GROUP BY i.id
        ORDER BY i.nome ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro ao listar insígnias:', error);
      throw error;
    }
  }

  // Buscar insígnia por ID
  static async buscarPorId(id) {
    try {
      const result = await pool.query(`
        SELECT 
          i.*,
          COUNT(ui.id) as total_usuarios
        FROM insignias i
        LEFT JOIN usuario_insignias ui ON i.id = ui.insignia_id
        WHERE i.id = $1
        GROUP BY i.id
      `, [id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar insígnia:', error);
      throw error;
    }
  }

  // Criar nova insígnia
  static async criar(dadosInsignia) {
    try {
      const { nome, descricao, imagem_url, pontos, cor } = dadosInsignia;
      
      const result = await pool.query(`
        INSERT INTO insignias (nome, descricao, imagem_url, pontos, cor)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [nome, descricao, imagem_url, pontos, cor || '#3B82F6']);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar insígnia:', error);
      throw error;
    }
  }

  // Atualizar insígnia
  static async atualizar(id, dadosInsignia) {
    try {
      const { nome, descricao, imagem_url, pontos, cor, ativo } = dadosInsignia;
      
      const result = await pool.query(`
        UPDATE insignias 
        SET 
          nome = $1, 
          descricao = $2, 
          imagem_url = $3, 
          pontos = $4, 
          cor = $5,
          ativo = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [nome, descricao, imagem_url, pontos, cor, ativo, id]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar insígnia:', error);
      throw error;
    }
  }

  // Deletar insígnia
  static async deletar(id) {
    try {
      await pool.query('DELETE FROM insignias WHERE id = $1', [id]);
    } catch (error) {
      console.error('Erro ao deletar insígnia:', error);
      throw error;
    }
  }

  // Conceder insígnia para usuário
  static async concederParaUsuario(userId, insigniaId, concedidaPor, observacoes) {
    try {
      const result = await pool.query(`
        INSERT INTO usuario_insignias (user_id, insignia_id, concedida_por, observacoes)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, insignia_id) DO NOTHING
        RETURNING *
      `, [userId, insigniaId, concedidaPor, observacoes]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao conceder insígnia:', error);
      throw error;
    }
  }

  // Remover insígnia do usuário
  static async removerDoUsuario(userId, insigniaId) {
    try {
      await pool.query(`
        DELETE FROM usuario_insignias 
        WHERE user_id = $1 AND insignia_id = $2
      `, [userId, insigniaId]);
    } catch (error) {
      console.error('Erro ao remover insígnia:', error);
      throw error;
    }
  }

  // Listar insígnias de um usuário
  static async listarPorUsuario(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          i.*,
          ui.data_conceicao,
          ui.observacoes,
          admin.name as concedida_por_nome
        FROM usuario_insignias ui
        JOIN insignias i ON ui.insignia_id = i.id
        LEFT JOIN users admin ON ui.concedida_por = admin.id
        WHERE ui.user_id = $1 AND i.ativo = true
        ORDER BY ui.data_conceicao DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Erro ao listar insígnias do usuário:', error);
      throw error;
    }
  }

  // Calcular pontos totais do usuário
  static async calcularPontosUsuario(userId) {
    try {
      const result = await pool.query(`
        SELECT COALESCE(SUM(i.pontos), 0) as total_pontos
        FROM usuario_insignias ui
        JOIN insignias i ON ui.insignia_id = i.id
        WHERE ui.user_id = $1 AND i.ativo = true
      `, [userId]);
      
      return parseInt(result.rows[0].total_pontos) || 0;
    } catch (error) {
      console.error('Erro ao calcular pontos do usuário:', error);
      throw error;
    }
  }

  // Ranking de usuários por pontos
  static async rankingUsuarios(limite = 10) {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.profile_image,
          COALESCE(SUM(i.pontos), 0) as total_pontos,
          COUNT(ui.id) as total_insignias
        FROM users u
        LEFT JOIN usuario_insignias ui ON u.id = ui.user_id
        LEFT JOIN insignias i ON ui.insignia_id = i.id AND i.ativo = true
        WHERE u.ativo = true
        GROUP BY u.id, u.name, u.profile_image
        ORDER BY total_pontos DESC, total_insignias DESC
        LIMIT $1
      `, [limite]);
      
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      throw error;
    }
  }
}

module.exports = InsigniaModel;
