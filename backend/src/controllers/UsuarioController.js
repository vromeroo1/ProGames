const IController = require('../interfaces/IController');
const UsuarioService = require('../services/UsuarioService');
const { sucesso } = require('../utils/resposta');

class UsuarioController extends IController {
  constructor(usuarioService = new UsuarioService()) {
    super();
    this.usuarioService = usuarioService;
  }

  async listar(req, res) {
    const usuarios = await this.usuarioService.listar(req.query);
    return sucesso(res, 'Usuarios listados com sucesso.', usuarios);
  }

  async buscarPorId(req, res) {
    const usuario = await this.usuarioService.buscarPorId(req.params.id);
    return sucesso(res, 'Usuario encontrado.', usuario);
  }

  async criar(req, res) {
    const usuario = await this.usuarioService.criar(req.body, req.usuario);
    return sucesso(res, 'Usuario cadastrado com sucesso.', usuario, 201);
  }

  async atualizar(req, res) {
    const usuario = await this.usuarioService.atualizar(req.params.id, req.body, req.usuario);
    return sucesso(res, 'Usuario atualizado com sucesso.', usuario);
  }

  async remover(req, res) {
    await this.usuarioService.remover(req.params.id, req.usuario);
    return sucesso(res, 'Usuario removido com sucesso.');
  }
}

module.exports = UsuarioController;
