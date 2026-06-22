const IService = require('../interfaces/IService');
const CategoriaDAO = require('../daos/CategoriaDAO');
const AppError = require('../utils/AppError');
const LogService = require('./LogService');

class CategoriaService extends IService {
  constructor(categoriaDAO = new CategoriaDAO(), logService = new LogService()) {
    super();
    this.categoriaDAO = categoriaDAO;
    this.logService = logService;
  }

  async listar(filtros) {
    return this.categoriaDAO.listar(filtros);
  }

  async buscarPorId(id) {
    const categoria = await this.categoriaDAO.buscarPorId(id);
    if (!categoria) throw new AppError('Categoria nao encontrada.', 404);
    return categoria;
  }

  async criar(dados, autor) {
    const categoria = await this.categoriaDAO.criar(dados);
    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'CRIAR_CATEGORIA',
      detalhes: { tabela: 'categorias', registro_id: categoria.id, dados_inseridos: categoria }
    });
    return categoria;
  }

  async atualizar(id, dados, autor) {
    const antes = await this.buscarPorId(id);
    const categoria = await this.categoriaDAO.atualizar(id, dados);
    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'ATUALIZAR_CATEGORIA',
      detalhes: { tabela: 'categorias', registro_id: id, antes, depois: categoria }
    });
    return categoria;
  }

  async remover(id, autor) {
    const antes = await this.buscarPorId(id);
    const removido = await this.categoriaDAO.remover(id);
    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'REMOVER_CATEGORIA',
      detalhes: { tabela: 'categorias', registro_id: id, dados_excluidos: antes }
    });
    return removido;
  }
}

module.exports = CategoriaService;
