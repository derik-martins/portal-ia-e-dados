const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const noticiaRoutes = require('./routes/noticiaRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const NoticiaModel = require('./models/NoticiaModel');
const rssService = require('./services/rssService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/noticias', noticiaRoutes);
app.use('/api/eventos', eventoRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Geração Caldeira API', 
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/noticias', '/api/eventos', '/health']
  });
});

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database conectado com sucesso!');
    
    // Criar tabela de notícias
    await NoticiaModel.criarTabela();
    
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
