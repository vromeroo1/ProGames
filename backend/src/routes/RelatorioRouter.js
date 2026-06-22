const express = require('express');
const RelatorioController = require('../controllers/RelatorioController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const asyncHandler = require('../utils/asyncHandler');

class RelatorioRouter {
  constructor(controller = new RelatorioController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('admin'));
    this.router.get('/jogos/pdf', asyncHandler(this.controller.jogos.bind(this.controller)));
    this.router.get('/emprestimos/pdf', asyncHandler(this.controller.emprestimos.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = RelatorioRouter;
