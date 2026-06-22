const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const asyncHandler = require('../utils/asyncHandler');

class DashboardRouter {
  constructor(controller = new DashboardController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('admin'));
    this.router.get('/resumo', asyncHandler(this.controller.resumo.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = DashboardRouter;
