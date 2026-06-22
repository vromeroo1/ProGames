const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth_middleware');
const { validarCorpo, schemas } = require('../middlewares/validation_middleware');
const asyncHandler = require('../utils/asyncHandler');

class AuthRouter {
  constructor(controller = new AuthController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post('/login', validarCorpo(schemas.login), asyncHandler(this.controller.login.bind(this.controller)));
    this.router.post('/logout', authMiddleware, asyncHandler(this.controller.logout.bind(this.controller)));
    this.router.get('/me', authMiddleware, asyncHandler(this.controller.me.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = AuthRouter;
