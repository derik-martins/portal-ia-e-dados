const dotenv = require('dotenv');
const { Pool } = require('pg');
const UserModel = require('./src/models/UserModel');

dotenv.config();

// Create a local pool that connects to localhost instead of 'db'
const localPool = new Pool({
    host: 'localhost', // Changed from process.env.DB_HOST
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

const initLocalDatabase = async () => {
    try {
        await localPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('Tabelas criadas com sucesso!');
    } catch (error) {
        console.error('Erro ao criar tabelas:', error);
        throw error;
    }
};

async function createTestUser() {
    try {
        console.log('Conectando ao banco de dados local...');
        console.log('Environment variables:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_PORT:', process.env.DB_PORT);
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASS:', process.env.DB_PASS ? '[HIDDEN]' : 'UNDEFINED');

        await initLocalDatabase();
        console.log('Conectado com sucesso!');

        const userData = {
            email: 'derik@monge.com.br',
            password: '123456',
            name: 'Administrador'
        };

        console.log('Verificando se o usuário já existe...');

        // Use the local pool for UserModel operations
        const originalPool = require('./src/config/database').pool;
        require('./src/config/database').pool = localPool;

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

        await localPool.end();
        process.exit(0);
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
        await localPool.end();
        process.exit(1);
    }
}

createTestUser();