const client = require('prom-client');
const responseTime = require('response-time');

// Criar um registro de métricas
const register = new client.Registry();

// Adicionar métricas padrão do Node.js
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
});

// Métricas customizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route', 'method', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['route', 'method', 'status_code'],
});

const activeConnections = new client.Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
});

const databaseQueries = new client.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.1, 0.5, 1, 5],
});

const rssUpdates = new client.Counter({
  name: 'rss_updates_total',
  help: 'Total number of RSS feed updates',
  labelNames: ['feed', 'status'],
});

const chatMessages = new client.Counter({
  name: 'chat_messages_total',
  help: 'Total number of chat messages',
  labelNames: ['user_type', 'status'],
});

const apiErrors = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['route', 'method', 'error_type'],
});

const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['type', 'status'],
});

// Registrar métricas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueries);
register.registerMetric(databaseQueryDuration);
register.registerMetric(rssUpdates);
register.registerMetric(chatMessages);
register.registerMetric(apiErrors);
register.registerMetric(authAttempts);

// Inicializar métricas com valores zero para garantir que apareçam
authAttempts.labels('login', 'success').inc(0);
authAttempts.labels('login', 'failed').inc(0);
authAttempts.labels('register', 'success').inc(0);
authAttempts.labels('register', 'failed').inc(0);

chatMessages.labels('user', 'success').inc(0);
chatMessages.labels('assistant', 'success').inc(0);
chatMessages.labels('system', 'error').inc(0);

// Middleware para capturar métricas HTTP
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Incrementar conexões ativas
  activeConnections.inc();
  
  // Capturar quando a resposta termina
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Métricas de duração e contador
    httpRequestDuration
      .labels(route, method, statusCode)
      .observe(duration);
      
    httpRequestsTotal
      .labels(route, method, statusCode)
      .inc();
    
    // Decrementar conexões ativas
    activeConnections.dec();
    
    // Log de erro se status >= 400
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      apiErrors
        .labels(route, method, errorType)
        .inc();
    }
  });
  
  next();
};

// Função para métricas de banco de dados
const recordDatabaseQuery = (operation, table, duration) => {
  databaseQueries.labels(operation, table).inc();
  databaseQueryDuration.labels(operation, table).observe(duration / 1000);
};

// Função para métricas de RSS
const recordRssUpdate = (feed, status) => {
  rssUpdates.labels(feed, status).inc();
};

// Função para métricas de chat
const recordChatMessage = (userType, status) => {
  chatMessages.labels(userType, status).inc();
};

// Função para métricas de autenticação
const recordAuthAttempt = (type, status) => {
  authAttempts.labels(type, status).inc();
};

// Endpoint para exposição das métricas
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  recordDatabaseQuery,
  recordRssUpdate,
  recordChatMessage,
  recordAuthAttempt,
  register
};
