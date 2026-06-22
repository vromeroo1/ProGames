const express = require('express');
const EmprestimoController = require('../controllers/EmprestimoController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const { validarCorpo, schemas } = require('../middlewares/validation_middleware');
const asyncHandler = require('../utils/asyncHandler');

class EmprestimoRouter {
  constructor(controller = new EmprestimoController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('admin'));
    this.router.get('/', asyncHandler(this.controller.listar.bind(this.controller)));
    this.router.get('/:id', asyncHandler(this.controller.buscarPorId.bind(this.controller)));
    this.router.post('/', validarCorpo(schemas.emprestimo), asyncHandler(this.controller.criar.bind(this.controller)));
    this.router.put('/:id', validarCorpo(schemas.emprestimoAtualizacao), asyncHandler(this.controller.atualizar.bind(this.controller)));
    this.router.post('/:id/devolver', asyncHandler(this.controller.devolver.bind(this.controller)));
    this.router.delete('/:id', asyncHandler(this.controller.remover.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = EmprestimoRouter;
