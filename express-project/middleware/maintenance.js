/**
 * 维护模式中间件
 * 当维护模式开启时，阻止普通用户访问网站
 */

const { getSystemSetting } = require('../routes/systemSettings');

/**
 * 维护模式检查中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
async function maintenanceCheck(req, res, next) {
  try {
    // 检查是否开启维护模式
    const isMaintenanceMode = await getSystemSetting('maintenance_mode', false);
    
    if (isMaintenanceMode === 'true' || isMaintenanceMode === true) {
      // 管理员路径和登录接口不受维护模式影响
      const adminPaths = ['/api/admin', '/api/auth/login'];
      const isAdminPath = adminPaths.some(path => req.path.startsWith(path));
      
      if (!isAdminPath) {
        // 检查用户是否为管理员
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          try {
            const { verifyToken } = require('../utils/jwt');
            const decoded = verifyToken(token);
            
            // 如果是管理员，允许访问
            if (decoded.type === 'admin') {
              return next();
            }
          } catch (error) {
            // token无效，继续执行维护模式逻辑
          }
        }
        
        // 返回维护模式信息
        return res.status(503).json({
          code: 503,
          message: '网站正在维护中，请稍后访问',
          data: {
            maintenance: true,
            title: '系统维护中',
            description: '我们正在对系统进行维护升级，为您提供更好的服务体验。请稍后再试。'
          }
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('维护模式检查失败:', error);
    // 发生错误时允许访问，避免因维护模式检查导致整站不可用
    next();
  }
}

module.exports = {
  maintenanceCheck
};
