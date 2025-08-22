const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');
const compression = require('compression');
const morgan = require('morgan');
const hpp = require('hpp');
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

// Middlewares de segurança
const { 
  securityHeaders, 
  securityLogger, 
  originValidator,
  bruteForceProtection,
  contentTypeValidator,
  inputSanitizer 
} = require('./middleware/securityMiddleware');

// Middleware de métricas
const { 
  metricsMiddleware, 
  metricsEndpoint,
  recordRssUpdate 
} = require('./middleware/metricsMiddleware');

const { 
  generalLimiter,
  loginLimiter,
  registerLimiter,
  speedLimiter,
  chatLimiter,
  uploadLimiter,
  dicasLimiter,
  suspiciousActivityLimiter
} = require('./middleware/rateLimitMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Configurar trust proxy para funcionar atrás de nginx/proxy
// Configuração mais específica para Docker Compose
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal', '172.20.0.0/16']);

// CORS deve ser uma das primeiras configurações
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Permitir requisições sem origem (mobile apps, Postman em dev)
    if (!origin) {
      console.log('[CORS] Request without origin header - allowing');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[SECURITY] Blocked CORS request from origin: ${origin}`);
      console.warn(`[SECURITY] Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Aplicar middlewares de segurança na ordem correta
app.use(securityHeaders);
app.use(compression());
app.use(hpp()); // Previne HTTP Parameter Pollution

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(securityLogger);
app.use(originValidator);
app.use(suspiciousActivityLimiter);
app.use(speedLimiter);

// Middleware de métricas Prometheus
app.use(metricsMiddleware);

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ success: false, message: 'JSON inválido' });
      throw new Error('JSON inválido');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(contentTypeValidator);
app.use(inputSanitizer);
app.use(bruteForceProtection);

// Servir arquivos estáticos (uploads) com segurança
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    // Headers de segurança para uploads
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self';");
  }
}));

// Endpoint para métricas Prometheus (sem rate limiting)
app.get('/metrics', metricsEndpoint);

// Aplicar rate limiting específico nas rotas
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api/dicas', dicasLimiter);
// Aplicar rate limiting geral por último para não interferir nos específicos
app.use('/api', generalLimiter);

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
  res.status(200).json({ 
    status: 'OK', 
    message: 'API funcionando', 
    timestamp: new Date(),
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Endpoint temporário para debug de rate limiting
app.get('/api/debug/rate-limit', (req, res) => {
  res.json({
    ip: req.ip,
    headers: req.headers,
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Geração Caldeira API', 
    version: '2.0.0',
    security: 'Enhanced',
    endpoints: [
      '/api/auth', 
      '/api/admin', 
      '/api/noticias', 
      '/api/eventos', 
      '/api/dicas', 
      '/api/chat', 
      '/api/profile', 
      '/api/users', 
      '/api/insignias', 
      '/health'
    ]
  });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: err.message,
      stack: err.stack 
    });
  }
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.warn(`[404] Rota não encontrada: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada' 
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
        recordRssUpdate('all_feeds', 'success');
      } catch (error) {
        console.error('Erro na atualização automática de feeds:', error);
        recordRssUpdate('all_feeds', 'error');
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
