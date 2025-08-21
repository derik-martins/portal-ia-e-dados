const { pool } = require('../config/database');

class DicaModel {
  static async criarTabelaDicas() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS dicas (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          categoria VARCHAR(100) NOT NULL,
          descricao_breve TEXT NOT NULL,
          conteudo JSONB NOT NULL,
          tempo_leitura INTEGER DEFAULT 1,
          imagem_header VARCHAR(255),
          tags TEXT[],
          autor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          visualizacoes INTEGER DEFAULT 0,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Índices para otimização
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_dicas_categoria ON dicas(categoria);
        CREATE INDEX IF NOT EXISTS idx_dicas_autor ON dicas(autor_id);
        CREATE INDEX IF NOT EXISTS idx_dicas_ativo ON dicas(ativo);
        CREATE INDEX IF NOT EXISTS idx_dicas_created ON dicas(created_at DESC);
      `);
      
      console.log('Tabela de dicas criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tabela de dicas:', error);
      throw error;
    }
  }

  static async criar(dadosDica) {
    try {
      const {
        titulo,
        categoria,
        descricao_breve,
        conteudo,
        tempo_leitura,
        imagem_header,
        tags,
        autor_id
      } = dadosDica;

      const result = await pool.query(`
        INSERT INTO dicas (
          titulo, categoria, descricao_breve, conteudo, 
          tempo_leitura, imagem_header, tags, autor_id, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING *
      `, [titulo, categoria, descricao_breve, JSON.stringify(conteudo), tempo_leitura, imagem_header, tags, autor_id]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar dica:', error);
      throw error;
    }
  }

  static async buscarTodas(filtros = {}) {
    try {
      let query = `
        SELECT d.*, u.name as autor_nome 
        FROM dicas d 
        JOIN users u ON d.autor_id = u.id 
        WHERE d.ativo = true
      `;
      const params = [];
      let paramCount = 1;

      if (filtros.categoria) {
        query += ` AND d.categoria = $${paramCount}`;
        params.push(filtros.categoria);
        paramCount++;
      }

      if (filtros.tag) {
        query += ` AND $${paramCount} = ANY(d.tags)`;
        params.push(filtros.tag);
        paramCount++;
      }

      if (filtros.busca) {
        query += ` AND (d.titulo ILIKE $${paramCount} OR d.descricao_breve ILIKE $${paramCount})`;
        params.push(`%${filtros.busca}%`);
        paramCount++;
      }

      query += ` ORDER BY d.created_at DESC`;

      if (filtros.limite) {
        query += ` LIMIT $${paramCount}`;
        params.push(filtros.limite);
        paramCount++;
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar dicas:', error);
      throw error;
    }
  }

  static async buscarPorId(id) {
    try {
      const result = await pool.query(`
        SELECT d.*, u.name as autor_nome 
        FROM dicas d 
        JOIN users u ON d.autor_id = u.id 
        WHERE d.id = $1 AND d.ativo = true
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      // Incrementar visualizações
      await pool.query(`
        UPDATE dicas SET visualizacoes = visualizacoes + 1 
        WHERE id = $1
      `, [id]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar dica:', error);
      throw error;
    }
  }

  static async buscarPorAutor(autorId) {
    try {
      const result = await pool.query(`
        SELECT d.*, u.name as autor_nome 
        FROM dicas d 
        JOIN users u ON d.autor_id = u.id 
        WHERE d.autor_id = $1 AND d.ativo = true
        ORDER BY d.created_at DESC
      `, [autorId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar dicas por autor:', error);
      throw error;
    }
  }

  static async atualizar(id, dadosDica, autorId) {
    try {
      const {
        titulo,
        categoria,
        descricao_breve,
        conteudo,
        tempo_leitura,
        imagem_header,
        tags
      } = dadosDica;

      const result = await pool.query(`
        UPDATE dicas SET 
          titulo = $1, categoria = $2, descricao_breve = $3, 
          conteudo = $4, tempo_leitura = $5, imagem_header = $6, 
          tags = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND autor_id = $9 AND ativo = true
        RETURNING *
      `, [titulo, categoria, descricao_breve, JSON.stringify(conteudo), tempo_leitura, imagem_header, tags, id, autorId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar dica:', error);
      throw error;
    }
  }

  static async excluir(id, autorId) {
    try {
      const result = await pool.query(`
        UPDATE dicas SET ativo = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND autor_id = $2
        RETURNING id
      `, [id, autorId]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Erro ao excluir dica:', error);
      throw error;
    }
  }

  static async buscarCategorias() {
    try {
      const result = await pool.query(`
        SELECT categoria, COUNT(*) as total
        FROM dicas 
        WHERE ativo = true 
        GROUP BY categoria 
        ORDER BY total DESC, categoria ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  static async buscarTags() {
    try {
      const result = await pool.query(`
        SELECT DISTINCT unnest(tags) as tag, COUNT(*) as total
        FROM dicas 
        WHERE ativo = true AND tags IS NOT NULL
        GROUP BY tag 
        ORDER BY total DESC, tag ASC
        LIMIT 50
      `);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
      throw error;
    }
  }
}

module.exports = DicaModel;
