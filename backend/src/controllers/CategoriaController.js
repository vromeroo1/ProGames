const IController = require('../interfaces/IController');
const CategoriaService = require('../services/CategoriaService');
const { sucesso } = require('../utils/resposta');

class CategoriaController extends IController {
  constructor(categoriaService = new CategoriaService()) {
    super();
    this.categoriaService = categoriaService;
  }

  async listar(req, res) {
    const categorias = await this.categoriaService.listar(req.query);
    return sucesso(res, 'Categorias listadas com sucesso.', categorias);
  }

  async buscarPorId(req, res) {
    const categoria = await this.categoriaService.buscarPorId(req.params.id);
    return sucesso(res, 'Categoria encontrada.', categoria);
  }

  async criar(req, res) {
    const categoria = await this.categoriaService.criar(req.body, req.usuario);
    return sucesso(res, 'Categoria cadastrada com sucesso.', categoria, 201);
  }

  async atualizar(req, res) {
    const categoria = await this.categoriaService.atualizar(req.params.id, req.body, req.usuario);
    return sucesso(res, 'Categoria atualizada com sucesso.', categoria);
  }

  async remover(req, res) {
    await this.categoriaService.remover(req.params.id, req.usuario);
    return sucesso(res, 'Categoria removida com sucesso.');
  }
}

module.exports = CategoriaController;
