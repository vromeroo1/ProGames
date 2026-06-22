const express = require('express');
const LogController = require('../controllers/LogController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const asyncHandler = require('../utils/asyncHandler');

class LogRouter {
  constructor(controller = new LogController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('admin'));
    this.router.get('/', asyncHandler(this.controller.listar.bind(this.controller)));
    this.router.get('/exportar/xml', asyncHandler(this.controller.exportarXml.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = LogRouter;
