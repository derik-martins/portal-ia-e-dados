  const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

const initDatabase = async () => {
  try {
    // Tabela de usuários com role
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Adicionar colunas se não existirem (para usuários existentes)
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Adicionar colunas de perfil
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255)
    `);

    // Adicionar novas colunas para perfil estendido
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS banner_image VARCHAR(255)
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255)
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS github_url VARCHAR(255)
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS website_url VARCHAR(255)
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS interests TEXT[]
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS skills TEXT[]
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `);
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
    `);
    
    // Tabela de eventos do calendário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        event_type VARCHAR(50) DEFAULT 'aula',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de dicas
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
    
    // Índices para otimização das dicas
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_dicas_categoria ON dicas(categoria);
      CREATE INDEX IF NOT EXISTS idx_dicas_autor ON dicas(autor_id);
      CREATE INDEX IF NOT EXISTS idx_dicas_ativo ON dicas(ativo);
      CREATE INDEX IF NOT EXISTS idx_dicas_created ON dicas(created_at DESC);
    `);
    
    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase };
