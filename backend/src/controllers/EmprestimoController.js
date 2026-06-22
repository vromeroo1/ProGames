const IController = require('../interfaces/IController');
const EmprestimoService = require('../services/EmprestimoService');
const { sucesso } = require('../utils/resposta');

class EmprestimoController extends IController {
  constructor(emprestimoService = new EmprestimoService()) {
    super();
    this.emprestimoService = emprestimoService;
  }

  async listar(req, res) {
    const emprestimos = await this.emprestimoService.listar(req.query);
    return sucesso(res, 'Emprestimos listados com sucesso.', emprestimos);
  }

  async buscarPorId(req, res) {
    const emprestimo = await this.emprestimoService.buscarPorId(req.params.id);
    return sucesso(res, 'Emprestimo encontrado.', emprestimo);
  }

  async criar(req, res) {
    const emprestimo = await this.emprestimoService.criar(req.body, req.usuario);
    return sucesso(res, 'Emprestimo criado com sucesso.', emprestimo, 201);
  }

  async criarReserva(req, res) {
    const reserva = await this.emprestimoService.criarReserva(req.body, req.usuario);
    return sucesso(res, 'Reserva solicitada com sucesso.', reserva, 201);
  }

  async minhasReservas(req, res) {
    const reservas = await this.emprestimoService.listarPorUsuario(req.usuario.id, req.query);
    return sucesso(res, 'Reservas do usuario listadas com sucesso.', reservas);
  }

  async atualizar(req, res) {
    const emprestimo = await this.emprestimoService.atualizar(req.params.id, req.body, req.usuario);
    return sucesso(res, 'Emprestimo atualizado com sucesso.', emprestimo);
  }

  async devolver(req, res) {
    const emprestimo = await this.emprestimoService.devolver(req.params.id, req.usuario);
    return sucesso(res, 'Devolucao registrada com sucesso.', emprestimo);
  }

  async remover(req, res) {
    await this.emprestimoService.remover(req.params.id, req.usuario);
    return sucesso(res, 'Emprestimo removido com sucesso.');
  }
}

module.exports = EmprestimoController;
