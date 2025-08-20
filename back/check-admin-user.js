const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAndSetupAdminUser() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Verificar se o usuário existe
    const userResult = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      ['derik@monge.com.br']
    );
    
    if (userResult.rows.length === 0) {
      console.log('Usuário derik@monge.com.br não encontrado. Criando usuário admin...');
      
      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const createResult = await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        ['derik@monge.com.br', hashedPassword, 'Derik Monge', 'admin']
      );
      
      console.log('Usuário admin criado:', createResult.rows[0]);
    } else {
      const user = userResult.rows[0];
      console.log('Usuário encontrado:', user);
      
      if (user.role !== 'admin') {
        console.log('Atualizando usuário para admin...');
        const updateResult = await pool.query(
          'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
          ['admin', 'derik@monge.com.br']
        );
        console.log('Usuário atualizado:', updateResult.rows[0]);
      } else {
        console.log('Usuário já é admin!');
      }
    }
    
    // Listar todos os usuários admin
    console.log('\n--- Usuários Admin ---');
    const adminUsers = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE role = $1',
      ['admin']
    );
    
    adminUsers.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Nome: ${user.name}, Role: ${user.role}`);
    });
    
    console.log('\nVerificação concluída!');
    process.exit(0);
    
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkAndSetupAdminUser();