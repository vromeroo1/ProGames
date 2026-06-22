const express = require('express');
const EmprestimoController = require('../controllers/EmprestimoController');
const authMiddleware = require('../middlewares/auth_middleware');
const roleMiddleware = require('../middlewares/role_middleware');
const { validarCorpo, schemas } = require('../middlewares/validation_middleware');
const asyncHandler = require('../utils/asyncHandler');

class ReservaRouter {
  constructor(controller = new EmprestimoController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.use(roleMiddleware('usuario', 'admin'));
    this.router.post('/reservas', validarCorpo(schemas.reserva), asyncHandler(this.controller.criarReserva.bind(this.controller)));
    this.router.get('/minhas-reservas', asyncHandler(this.controller.minhasReservas.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ReservaRouter;
