const { AdminAction } = require('../models');
const logger = require('../logger');

// Функция для логирования действий администрации
const logAdminAction = async (req, actionType, targetType, targetId, details = null) => {
  try {
    await AdminAction.create({
      admin_id: req.user.id,
      actionType,
      targetType,
      targetId,
      details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    logger.error('Failed to log admin action:', error);
  }
};

// Middleware для проверки ролей
const requireRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }
    
    if (!roles.includes(req.user.role)) {
      await logAdminAction(
        req, 
        'unauthorized_access', 
        'route', 
        null, 
        `Attempted to access ${req.path} without proper role. Required: ${roles.join(', ')}, Has: ${req.user.role}`
      );
      
      return res.status(403).json({ 
        error: 'Недостаточно прав доступа',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Специализированные middleware для конкретных ролей
const requireAdmin = requireRole(['admin']);
const requireModerator = requireRole(['moderator', 'admin']);
const requireAccountant = requireRole(['accountant', 'admin']);
const requireEmployee = requireRole(['employee', 'moderator', 'accountant', 'admin']);

// Middleware для проверки прав на управление пользователями
const canManageUsers = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Админ может управлять всеми пользователями
  }
  
  if (req.user.role === 'moderator') {
    // Модератор может управлять только customer и carrier
    const allowedRoles = ['customer', 'carrier'];
    if (req.body.role && !allowedRoles.includes(req.body.role)) {
      return res.status(403).json({ 
        error: 'Модератор может управлять только клиентами и перевозчиками' 
      });
    }
    return next();
  }
  
  return res.status(403).json({ error: 'Недостаточно прав для управления пользователями' });
};

module.exports = {
  requireRole,
  requireAdmin,
  requireModerator,
  requireAccountant,
  requireEmployee,
  canManageUsers,
  logAdminAction
};