const LogService = require('../services/LogService');

const logService = new LogService();

function logMiddleware(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    if (deveIgnorarLog(req, res)) {
      return;
    }

    logService.registrar({
      usuario: req.usuario?.email || 'anonimo',
      endpoint: req.originalUrl,
      metodo: req.method,
      status_code: res.statusCode,
      acao: 'ACESSO_ROTA',
      ip: req.ip,
      detalhes: {
        tempo_resposta_ms: Date.now() - inicio,
        user_agent: req.headers['user-agent']
      }
    }).catch(() => {});
  });

  return next();
}

module.exports = logMiddleware;

function deveIgnorarLog(req, res) {
  const endpoint = req.originalUrl || '';

  if (res.statusCode === 304) {
    return true;
  }

  if (res.statusCode === 401) {
    return true;
  }

  if (!endpoint.startsWith('/api')) {
    return true;
  }

  if (res.statusCode < 400) {
    return true;
  }

  return ['GET /api/health', 'POST /api/auth/login', 'POST /api/auth/logout'].includes(`${req.method} ${endpoint}`);
}
