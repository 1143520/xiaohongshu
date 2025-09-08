/**
 * 维护模式中间件
 * 当系统处于维护模式时，阻止普通用户访问
 */

const { isMaintenanceMode } = require('../routes/systemSettings');

/**
 * 维护模式检查中间件
 * 如果系统处于维护模式，普通用户将无法访问
 * 管理员不受影响
 */
const maintenanceCheck = async (req, res, next) => {
  try {
    // 跳过健康检查接口
    if (req.path === '/api/health') {
      return next();
    }

    // 跳过管理员相关接口
    if (req.path.startsWith('/api/auth/admin') || 
        req.path.startsWith('/api/admin') || 
        req.path.startsWith('/api/system') ||
        req.path.startsWith('/api/export')) {
      return next();
    }

    // 检查是否处于维护模式
    const maintenanceEnabled = await isMaintenanceMode();
    
    if (maintenanceEnabled) {
      // 如果是管理员用户，允许访问
      if (req.user && req.user.type === 'admin') {
        return next();
      }

      // 普通用户在维护模式下无法访问
      return res.status(503).json({
        code: 503,
        message: '系统正在维护中，请稍后再试',
        data: {
          maintenance: true,
          retry_after: '1小时后'
        }
      });
    }

    next();
  } catch (error) {
    console.error('维护模式检查失败:', error);
    // 如果检查失败，允许访问（避免阻塞正常功能）
    next();
  }
};

module.exports = {
  maintenanceCheck
};