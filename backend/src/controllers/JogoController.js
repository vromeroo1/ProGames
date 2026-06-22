const IController = require('../interfaces/IController');
const JogoService = require('../services/JogoService');
const { sucesso } = require('../utils/resposta');

class JogoController extends IController {
  constructor(jogoService = new JogoService()) {
    super();
    this.jogoService = jogoService;
  }

  async listar(req, res) {
    const jogos = await this.jogoService.listar(req.query);
    return sucesso(res, 'Jogos listados com sucesso.', jogos);
  }

  async buscarPorId(req, res) {
    const jogo = await this.jogoService.buscarPorId(req.params.id);
    return sucesso(res, 'Jogo encontrado.', jogo);
  }

  async criar(req, res) {
    const jogo = await this.jogoService.criar(req.body, req.file, req.usuario);
    return sucesso(res, 'Jogo cadastrado com sucesso.', jogo, 201);
  }

  async atualizar(req, res) {
    const jogo = await this.jogoService.atualizar(req.params.id, req.body, req.file, req.usuario);
    return sucesso(res, 'Jogo atualizado com sucesso.', jogo);
  }

  async atualizarEstoque(req, res) {
    const jogo = await this.jogoService.atualizarEstoque(req.params.id, req.body, req.usuario);
    return sucesso(res, 'Estoque atualizado com sucesso.', jogo);
  }

  async remover(req, res) {
    await this.jogoService.remover(req.params.id, req.usuario);
    return sucesso(res, 'Jogo removido com sucesso.');
  }
}

module.exports = JogoController;
