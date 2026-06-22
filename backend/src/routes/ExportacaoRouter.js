const express = require('express');
const ExportacaoController = require('../controllers/ExportacaoController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const { uploadJson } = require('../middlewares/upload_middleware');
const asyncHandler = require('../utils/asyncHandler');

class ExportacaoRouter {
  constructor(controller = new ExportacaoController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('admin'));
    this.router.get('/:entidade', asyncHandler(this.controller.exportar.bind(this.controller)));
    this.router.post('/:entidade', uploadJson.single('arquivo'), asyncHandler(this.controller.importar.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ExportacaoRouter;
