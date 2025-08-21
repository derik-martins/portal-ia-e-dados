const dotenv = require('dotenv');
const { initDatabase } = require('./src/config/database');
const UserModel = require('./src/models/UserModel');

dotenv.config();

async function createTestUser() {
  try {
    console.log('Conectando ao banco de dados...');
    await initDatabase();
    console.log('Conectado com sucesso!');

    const userData = {
      email: 'derik@iaedados',
      password: 'orienti@14',
      name: 'Administrador',
      role: 'admin'
    };

    console.log('Verificando se o usuário já existe...');
    const existingUser = await UserModel.findByEmail(userData.email);
    
    if (existingUser) {
      console.log('Usuário já existe! Dados:');
      console.log(`- ID: ${existingUser.id}`);
      console.log(`- Email: ${existingUser.email}`);
      console.log(`- Nome: ${existingUser.name}`);
      console.log(`- Criado em: ${existingUser.created_at}`);
    } else {
      console.log('Criando usuário de teste...');
      const user = await UserModel.create(userData);
      
      console.log('Usuário criado com sucesso!');
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Nome: ${user.name}`);
    }

    console.log('\nCredenciais para login:');
    console.log(`Email: ${userData.email}`);
    console.log(`Senha: ${userData.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    process.exit(1);
  }
}

createTestUser();
