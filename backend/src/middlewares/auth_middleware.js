const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [tipo, token] = authorization.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new AppError('Token JWT nao informado.', 401);
  }

  try {
    req.usuario = jwt.verify(token, env.jwt.secret);
    return next();
  } catch (erro) {
    throw new AppError('Token JWT invalido ou expirado.', 401);
  }
}

module.exports = authMiddleware;
