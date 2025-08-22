const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

// Blacklist de tokens (em produção, use Redis)
const tokenBlacklist = new Set();

// Cache de usuários (evitar consultas desnecessárias ao DB)
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido ou formato inválido'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verificar se token está na blacklist
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token revogado'
      });
    }

    // Verificar tamanho do token (evitar tokens muito longos)
    if (token.length > 500) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o token não expirou com margem de segurança
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    // Verificar cache primeiro
    const cacheKey = `user_${decoded.userId}`;
    let user = null;
    
    if (userCache.has(cacheKey)) {
      const cachedUser = userCache.get(cacheKey);
      if (Date.now() - cachedUser.timestamp < CACHE_DURATION) {
        user = cachedUser.data;
      } else {
        userCache.delete(cacheKey);
      }
    }

    // Se não estiver no cache, buscar no DB
    if (!user) {
      user = await UserModel.findById(decoded.userId);
      if (user) {
        userCache.set(cacheKey, {
          data: user,
          timestamp: Date.now()
        });
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    // Verificar se o token foi emitido antes de uma possível mudança de senha
    if (user.password_changed_at && decoded.iat < Math.floor(user.password_changed_at.getTime() / 1000)) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido devido à alteração de senha'
      });
    }

    // Log de acesso para auditoria
    if (process.env.LOG_SECURITY_EVENTS === 'true') {
      console.log(`[AUTH] User ${user.email} (${user.id}) accessed ${req.method} ${req.path} from ${req.ip}`);
    }
    
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role || user.role;
    req.user = user; // Adicionar objeto completo do usuário
    next();
  } catch (error) {
    // Log detalhado do erro para debug
    if (process.env.NODE_ENV === 'development') {
      console.error('[AUTH ERROR]', error);
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token malformado'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para revogar token (logout)
const revokeToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    tokenBlacklist.add(token);
    
    // Limpar cache do usuário
    if (req.userId) {
      userCache.delete(`user_${req.userId}`);
    }
  }
  next();
};

// Função para limpar tokens expirados da blacklist periodicamente
const cleanupBlacklist = () => {
  // Em produção, isso deve ser feito no Redis com TTL
  // Por agora, limpamos a cada hora
  setTimeout(() => {
    tokenBlacklist.clear();
    cleanupBlacklist();
  }, 60 * 60 * 1000); // 1 hora
};

// Iniciar limpeza da blacklist
cleanupBlacklist();

module.exports = { authMiddleware, revokeToken };
