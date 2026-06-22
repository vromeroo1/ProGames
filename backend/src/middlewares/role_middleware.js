const AppError = require('../utils/AppError');

function roleMiddleware(...perfisPermitidos) {
  return (req, res, next) => {
    const perfil = req.usuario?.tipo_usuario;

    if (!perfil || !perfisPermitidos.includes(perfil)) {
      throw new AppError('Usuario sem permissao para acessar este recurso.', 403);
    }

    return next();
  };
}

module.exports = roleMiddleware;
