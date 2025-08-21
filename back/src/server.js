const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const noticiaRoutes = require('./routes/noticiaRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const dicaRoutes = require('./routes/dicaRoutes');
const chatRoutes = require('./routes/chatRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const insigniaRoutes = require('./routes/insigniaRoutes');
const NoticiaModel = require('./models/NoticiaModel');
const DicaModel = require('./models/DicaModel');
const ConversaModel = require('./models/ConversaModel');
const InsigniaModel = require('./models/InsigniaModel');
const rssService = require('./services/rssService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/dicas', dicaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insignias', insigniaRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Geração Caldeira API', 
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/admin', '/api/noticias', '/api/eventos', '/api/dicas', '/api/chat', '/api/profile', '/api/users', '/api/insignias', '/health']
  });
});

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database conectado com sucesso!');
    
    // Criar tabela de notícias
    await NoticiaModel.criarTabela();
    
    // Criar tabela de dicas
    await DicaModel.criarTabelaDicas();
    
    // Criar tabelas do chat
    await ConversaModel.criarTabela();
    await ConversaModel.criarTabelaMensagens();
    
    // Criar tabelas de insígnias
    await InsigniaModel.criarTabelas();
    
    // Fazer primeira busca de notícias
    console.log('Fazendo primeira busca de notícias...');
    await rssService.atualizarTodosFeeds();
    
    // Configurar cron job para atualizar feeds a cada 10 minutos
    cron.schedule('*/10 * * * *', async () => {
      console.log('Executando atualização automática de feeds RSS...');
      try {
        await rssService.atualizarTodosFeeds();
      } catch (error) {
        console.error('Erro na atualização automática de feeds:', error);
      }
    });
    
    app.listen(PORT, HOST, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV}`);
      console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log('Cron job configurado para atualizar feeds a cada 10 minutos');
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
