const AuthService = require('../services/AuthService');
const IController = require('../interfaces/IController');
const { sucesso } = require('../utils/resposta');

class AuthController extends IController {
  constructor(authService = new AuthService()) {
    super();
    this.authService = authService;
  }

  async login(req, res) {
    const dados = await this.authService.login(req.body, {
      endpoint: req.originalUrl,
      metodo: req.method,
      ip: req.ip
    });
    return sucesso(res, 'Login realizado com sucesso.', dados);
  }

  async logout(req, res) {
    await this.authService.logout(req.usuario, {
      endpoint: req.originalUrl,
      metodo: req.method,
      ip: req.ip
    });
    return sucesso(res, 'Logout registrado com sucesso.');
  }

  async me(req, res) {
    return sucesso(res, 'Usuario autenticado.', req.usuario);
  }
}

module.exports = AuthController;
