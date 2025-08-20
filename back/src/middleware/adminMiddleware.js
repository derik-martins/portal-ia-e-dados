const UserModel = require('../models/UserModel');

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
      });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = adminMiddleware;