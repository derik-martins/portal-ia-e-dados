const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuração do Helmet para segurança de headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://openrouter.ai"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  }
});

// Middleware para logging de segurança
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log de requisições suspeitas
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempt
    /union.*select/i,  // SQL Injection
    /\/wp-admin/i,  // WordPress scan
    /\/admin\/config/i,  // Config access attempt
    /\.(php|asp|jsp)$/i,  // Script file access
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(req.body ? JSON.stringify(req.body) : '')
  );

  if (isSuspicious) {
    console.warn(`[SECURITY ALERT] Suspicious request from ${req.ip}: ${req.method} ${req.url}`);
    console.warn(`[SECURITY ALERT] User-Agent: ${req.get('User-Agent')}`);
    console.warn(`[SECURITY ALERT] Headers:`, req.headers);
  }

  // Log original para todas as requisições se habilitado
  if (process.env.LOG_SECURITY_EVENTS === 'true') {
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`[SECURITY LOG] ${req.ip} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
  }

  next();
};

// Middleware para validar origem das requisições
const originValidator = (req, res, next) => {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  const origin = req.get('Origin') || req.get('Referer');

  // Para requisições de API sem Origin (como Postman, curl), verificar User-Agent
  if (!origin && req.path.startsWith('/api/')) {
    const userAgent = req.get('User-Agent') || '';
    const suspiciousAgents = ['curl', 'wget', 'python-requests', 'postman'];
    
    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      console.warn(`[SECURITY] API access from suspicious User-Agent: ${userAgent} - IP: ${req.ip}`);
    }
  }

  next();
};

// Middleware para detectar ataques de força bruta
const bruteForceDetector = new Map();

const bruteForceProtection = (req, res, next) => {
  const key = `${req.ip}-${req.path}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutos
  const maxAttempts = 10;

  if (!bruteForceDetector.has(key)) {
    bruteForceDetector.set(key, { attempts: 1, firstAttempt: now });
  } else {
    const record = bruteForceDetector.get(key);
    
    // Reset se passou da janela de tempo
    if (now - record.firstAttempt > windowMs) {
      bruteForceDetector.set(key, { attempts: 1, firstAttempt: now });
    } else {
      record.attempts++;
      
      if (record.attempts > maxAttempts) {
        console.error(`[SECURITY ALERT] Brute force attack detected from ${req.ip} on ${req.path}`);
        return res.status(429).json({
          success: false,
          message: 'Muitas tentativas detectadas. Acesso temporariamente bloqueado.'
        });
      }
    }
  }

  next();
};

// Middleware para validar Content-Type
const contentTypeValidator = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header é obrigatório'
      });
    }
    
    const allowedTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded'
    ];
    
    if (!allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type não suportado'
      });
    }
  }
  
  next();
};

// Middleware para sanitizar inputs
const inputSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove scripts e HTML potencialmente perigosos
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
};

module.exports = {
  securityHeaders,
  securityLogger,
  originValidator,
  bruteForceProtection,
  contentTypeValidator,
  inputSanitizer
};
