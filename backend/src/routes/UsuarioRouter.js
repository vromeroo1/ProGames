const express = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const { validarCorpo, schemas } = require('../middlewares/validation_middleware');
const asyncHandler = require('../utils/asyncHandler');

class UsuarioRouter {
  constructor(controller = new UsuarioController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('admin'));
    this.router.get('/', asyncHandler(this.controller.listar.bind(this.controller)));
    this.router.get('/:id', asyncHandler(this.controller.buscarPorId.bind(this.controller)));
    this.router.post('/', validarCorpo(schemas.usuario), asyncHandler(this.controller.criar.bind(this.controller)));
    this.router.put('/:id', validarCorpo(schemas.usuarioAtualizacao), asyncHandler(this.controller.atualizar.bind(this.controller)));
    this.router.delete('/:id', asyncHandler(this.controller.remover.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = UsuarioRouter;
