const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const UsuarioDAO = require('../daos/UsuarioDAO');
const AppError = require('../utils/AppError');
const LogService = require('./LogService');

class AuthService {
  constructor(usuarioDAO = new UsuarioDAO(), logService = new LogService()) {
    this.usuarioDAO = usuarioDAO;
    this.logService = logService;
  }

  async login({ email, senha }, contexto = {}) {
    const usuario = await this.usuarioDAO.buscarPorEmail(email);

    if (!usuario) {
      await this.registrarLogin(email, false, contexto);
      throw new AppError('Email ou senha invalidos.', 401);
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      await this.registrarLogin(email, false, contexto);
      throw new AppError('Email ou senha invalidos.', 401);
    }

    const payload = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };

    const token = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

    await this.registrarLogin(email, true, contexto);

    return {
      token,
      usuario: payload
    };
  }

  async logout(usuario, contexto = {}) {
    await this.logService.registrar({
      usuario: usuario?.email || 'anonimo',
      endpoint: contexto.endpoint,
      metodo: contexto.metodo,
      status_code: 200,
      acao: 'LOGOUT',
      ip: contexto.ip,
      detalhes: { descricao: 'Usuario saiu do sistema.' }
    });
  }

  async registrarLogin(email, sucesso, contexto) {
    if (!sucesso) return;

    await this.logService.registrar({
      usuario: email,
      endpoint: contexto.endpoint,
      metodo: contexto.metodo,
      status_code: sucesso ? 200 : 401,
      acao: sucesso ? 'LOGIN_SUCESSO' : 'LOGIN_FALHA',
      ip: contexto.ip,
      detalhes: { sucesso }
    });
  }
}

module.exports = AuthService;
