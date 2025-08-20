const { pool } = require('../config/database');

class NoticiaModel {
  static async criarTabela() {
    const query = `
      CREATE TABLE IF NOT EXISTS noticias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(500) NOT NULL,
        titulo_original VARCHAR(500),
        descricao TEXT,
        descricao_original TEXT,
        fonte VARCHAR(200) NOT NULL,
        url VARCHAR(1000) NOT NULL UNIQUE,
        data_publicacao TIMESTAMP NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        tags TEXT[],
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias(categoria);
      CREATE INDEX IF NOT EXISTS idx_noticias_data ON noticias(data_publicacao DESC);
    `;
    
    try {
      await pool.query(query);
      console.log('Tabela de notícias criada/verificada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela de notícias:', error);
      throw error;
    }
  }

  static async salvarNoticia(noticia) {
    const query = `
      INSERT INTO noticias (titulo, titulo_original, descricao, descricao_original, fonte, url, data_publicacao, categoria, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (url) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        descricao = EXCLUDED.descricao,
        data_publicacao = EXCLUDED.data_publicacao,
        tags = EXCLUDED.tags
      RETURNING id;
    `;
    
    const values = [
      noticia.titulo,
      noticia.titulo_original,
      noticia.descricao,
      noticia.descricao_original,
      noticia.fonte,
      noticia.url,
      noticia.data_publicacao,
      noticia.categoria,
      noticia.tags
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      throw error;
    }
  }

  static async buscarNoticias(categoria = null, limite = 20) {
    let query = `
      SELECT id, titulo, fonte, data_publicacao, categoria, tags, url
      FROM noticias
    `;
    
    const values = [];
    
    if (categoria) {
      query += ' WHERE categoria = $1';
      values.push(categoria);
    }
    
    query += ' ORDER BY data_publicacao DESC LIMIT $' + (values.length + 1);
    values.push(limite);
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      throw error;
    }
  }

  static async buscarNoticiasPorCategoria() {
    const query = `
      SELECT categoria, COUNT(*) as total
      FROM noticias
      GROUP BY categoria
      ORDER BY categoria;
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de notícias:', error);
      throw error;
    }
  }
}

module.exports = NoticiaModel;