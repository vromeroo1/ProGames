const IService = require('../interfaces/IService');
const JogoDAO = require('../daos/JogoDAO');
const CategoriaDAO = require('../daos/CategoriaDAO');
const AppError = require('../utils/AppError');
const LogService = require('./LogService');

class JogoService extends IService {
  constructor(
    jogoDAO = new JogoDAO(),
    categoriaDAO = new CategoriaDAO(),
    logService = new LogService()
  ) {
    super();
    this.jogoDAO = jogoDAO;
    this.categoriaDAO = categoriaDAO;
    this.logService = logService;
  }

  async listar(filtros) {
    return this.jogoDAO.listar(filtros);
  }

  async buscarPorId(id) {
    const jogo = await this.jogoDAO.buscarPorId(id);
    if (!jogo) throw new AppError('Jogo nao encontrado.', 404);
    return jogo;
  }

  async criar(dados, arquivo, autor) {
    await this.validarCategoria(dados.categoria_id);
    const jogo = await this.jogoDAO.criar({
      ...dados,
      valor_aluguel: Number(dados.valor_aluguel),
      estoque: Number(dados.estoque),
      imagem: arquivo ? `/uploads/${arquivo.filename}` : null
    });

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'CRIAR_JOGO',
      detalhes: { tabela: 'jogos', registro_id: jogo.id, dados_inseridos: jogo }
    });

    return jogo;
  }

  async atualizar(id, dados, arquivo, autor) {
    const antes = await this.buscarPorId(id);

    if (dados.categoria_id) {
      await this.validarCategoria(dados.categoria_id);
    }

    const jogo = await this.jogoDAO.atualizar(id, {
      ...dados,
      valor_aluguel: dados.valor_aluguel !== undefined ? Number(dados.valor_aluguel) : undefined,
      estoque: dados.estoque !== undefined ? Number(dados.estoque) : undefined,
      imagem: arquivo ? `/uploads/${arquivo.filename}` : undefined
    });

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'ATUALIZAR_JOGO',
      detalhes: { tabela: 'jogos', registro_id: id, antes, depois: jogo }
    });

    return jogo;
  }

  async remover(id, autor) {
    const antes = await this.buscarPorId(id);
    const removido = await this.jogoDAO.remover(id);
    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'REMOVER_JOGO',
      detalhes: { tabela: 'jogos', registro_id: id, dados_excluidos: antes }
    });
    return removido;
  }

  async atualizarEstoque(id, dados, autor) {
    const quantidade = Number(dados.quantidade);

    if (!Number.isInteger(quantidade) || quantidade === 0) {
      throw new AppError('Informe uma quantidade inteira diferente de zero para ajustar o estoque.', 422);
    }

    const antes = await this.buscarPorId(id);
    const jogo = await this.jogoDAO.ajustarEstoque(id, quantidade);

    if (!jogo) {
      throw new AppError('Nao foi possivel ajustar o estoque. Verifique se o saldo nao ficara negativo.', 422);
    }

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'AJUSTAR_ESTOQUE_JOGO',
      detalhes: { tabela: 'jogos', registro_id: id, quantidade, antes, depois: jogo }
    });

    return jogo;
  }

  async validarCategoria(categoriaId) {
    const categoria = await this.categoriaDAO.buscarPorId(categoriaId);
    if (!categoria) throw new AppError('Categoria informada nao existe.', 404);
  }
}

module.exports = JogoService;
