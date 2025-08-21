const { pool } = require('../config/database');

class ConversaModel {
  static async criarTabela() {
    const query = `
      CREATE TABLE IF NOT EXISTS conversas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
  }

  static async criarTabelaMensagens() {
    const query = `
      CREATE TABLE IF NOT EXISTS mensagens (
        id SERIAL PRIMARY KEY,
        conversa_id INTEGER NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
  }

  static async criarConversa(userId, titulo) {
    const query = `
      INSERT INTO conversas (user_id, titulo)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, titulo]);
    return result.rows[0];
  }

  static async listarConversas(userId) {
    const query = `
      SELECT c.*, 
             (SELECT content FROM mensagens WHERE conversa_id = c.id ORDER BY created_at DESC LIMIT 1) as ultima_mensagem,
             (SELECT COUNT(*) FROM mensagens WHERE conversa_id = c.id) as total_mensagens
      FROM conversas c 
      WHERE c.user_id = $1 
      ORDER BY c.updated_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async buscarConversaPorId(conversaId, userId) {
    const query = `
      SELECT * FROM conversas 
      WHERE id = $1 AND user_id = $2;
    `;
    const result = await pool.query(query, [conversaId, userId]);
    return result.rows[0];
  }

  static async atualizarTitulo(conversaId, titulo, userId) {
    const query = `
      UPDATE conversas 
      SET titulo = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
        const result = await pool.query(query, [titulo, conversaId, userId]);
    return result.rows[0];
  }

  static async deletarConversa(conversaId, userId) {
    const query = `
      DELETE FROM conversas 
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [conversaId, userId]);
    return result.rows[0];
  }

  static async adicionarMensagem(conversaId, role, content) {
    const query = `
      INSERT INTO mensagens (conversa_id, role, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [conversaId, role, content]);
    
    // Atualizar o timestamp da conversa
    await pool.query(
      'UPDATE conversas SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversaId]
    );

    return result.rows[0];
  }

  static async buscarMensagens(conversaId, userId) {
    // Verificar se a conversa pertence ao usuário
    const conversaQuery = `
      SELECT id FROM conversas 
      WHERE id = $1 AND user_id = $2;
    `;
    const conversaResult = await pool.query(conversaQuery, [conversaId, userId]);
    
    if (conversaResult.rows.length === 0) {
      throw new Error('Conversa não encontrada');
    }

    const query = `
      SELECT * FROM mensagens 
      WHERE conversa_id = $1 
      ORDER BY created_at ASC;
    `;
    const result = await pool.query(query, [conversaId]);
    return result.rows;
  }
}

module.exports = ConversaModel;
