const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiting para API geral
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // máximo 500 requests por IP (aumentado)
  message: {
    success: false,
    message: process.env.RATE_LIMIT_MESSAGE || 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Função para gerar key baseada no IP
  keyGenerator: (req) => {
    // Log para debug em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[RATE LIMIT DEBUG] IP: ${req.ip}, X-Real-IP: ${req.get('X-Real-IP')}, X-Forwarded-For: ${req.get('X-Forwarded-For')}`);
    }
    return req.ip;
  },
  // Skip para IPs confiáveis e desenvolvimento
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    // Skip para localhost/desenvolvimento
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('172.20.0.');
    return trustedIPs.includes(req.ip) || isLocalhost;
  }
});

// Rate limiting mais restritivo para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  skipSuccessfulRequests: true, // não conta requisições bem-sucedidas
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }
});

// Rate limiting para rotas de registro/cadastro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por IP por hora
  message: {
    success: false,
    message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
  }
});

// Slow down para requests consecutivos
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // após 50 requests, começar a adicionar delay
  delayMs: () => 500, // delay fixo de 500ms por request excedente
  maxDelayMs: 20000, // máximo delay de 20 segundos
  validate: { delayMs: false } // desabilitar warning
});

// Rate limiting para API de chat/IA
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // máximo 20 mensagens de chat por IP
  message: {
    success: false,
    message: 'Limite de mensagens atingido. Tente novamente em 10 minutos.'
  }
});

// Rate limiting para upload de arquivos
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 uploads por IP por hora
  message: {
    success: false,
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
  }
});

// Rate limiting específico para dicas (mais permissivo)
const dicasLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 operações de dica por IP por 15min (aumentado)
  message: {
    success: false,
    message: 'Limite de operações de dicas atingido. Tente novamente em alguns minutos.'
  },
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('172.20.0.');
    return trustedIPs.includes(req.ip) || isLocalhost;
  }
});

// Middleware para detectar e bloquear IPs suspeitos
const suspiciousActivityLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 2000, // máximo 2000 requests em 5 minutos (aumentado para evitar falsos positivos)
  message: {
    success: false,
    message: 'Atividade suspeita detectada. Acesso temporariamente bloqueado.'
  },
  // Skip para IPs confiáveis, desenvolvimento e requisições de dicas/noticias
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('172.20.0.');
    
    // Skip para requisições de conteúdo normal (dicas, notícias, etc.)
    const isContentRequest = req.path.includes('/api/dicas') || 
                            req.path.includes('/api/noticias') || 
                            req.path.includes('/api/eventos') || 
                            req.path.includes('/api/insignias');
    
    return trustedIPs.includes(req.ip) || isLocalhost || isContentRequest;
  },
  handler: (req, res) => {
    console.warn(`[SECURITY] IP ${req.ip} atingiu limite de atividade suspeita`);
    // Aqui você pode implementar notificação via email ou webhook
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas detectadas. Acesso temporariamente bloqueado.'
    });
  }
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  speedLimiter,
  chatLimiter,
  uploadLimiter,
  dicasLimiter,
  suspiciousActivityLimiter
};
