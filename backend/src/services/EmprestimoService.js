const IService = require('../interfaces/IService');
const EmprestimoDAO = require('../daos/EmprestimoDAO');
const AppError = require('../utils/AppError');
const LogService = require('./LogService');

class EmprestimoService extends IService {
  constructor(emprestimoDAO = new EmprestimoDAO(), logService = new LogService()) {
    super();
    this.emprestimoDAO = emprestimoDAO;
    this.logService = logService;
  }

  async listar(filtros) {
    return this.emprestimoDAO.listar(filtros);
  }

  async listarPorUsuario(usuarioId, filtros) {
    return this.emprestimoDAO.listarPorUsuario(usuarioId, filtros);
  }

  async buscarPorId(id) {
    const emprestimo = await this.emprestimoDAO.buscarPorId(id);
    if (!emprestimo) throw new AppError('Emprestimo nao encontrado.', 404);
    return emprestimo;
  }

  async criar(dados, autor) {
    this.validarItens(dados.itens);

    const emprestimo = await this.emprestimoDAO.criar({
      ...dados,
      usuario_id: Number(dados.usuario_id)
    }, dados.status || 'aprovado');

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'CRIAR_EMPRESTIMO',
      detalhes: { tabela: 'emprestimos', registro_id: emprestimo.id, dados_inseridos: emprestimo }
    });

    return emprestimo;
  }

  async criarReserva(dados, autor) {
    this.validarItens(dados.itens);

    const reserva = await this.emprestimoDAO.criar({
      ...dados,
      usuario_id: Number(autor.id),
      observacoes: dados.observacoes || 'Reserva solicitada pelo catalogo.'
    }, 'pendente');

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'CRIAR_RESERVA',
      detalhes: { tabela: 'emprestimos', registro_id: reserva.id, dados_inseridos: reserva }
    });

    return reserva;
  }

  async atualizar(id, dados, autor) {
    const antes = await this.buscarPorId(id);
    const emprestimo = await this.emprestimoDAO.atualizar(id, dados);

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'ATUALIZAR_EMPRESTIMO',
      detalhes: { tabela: 'emprestimos', registro_id: id, antes, depois: emprestimo }
    });

    return emprestimo;
  }

  async devolver(id, autor) {
    const antes = await this.buscarPorId(id);
    const emprestimo = await this.emprestimoDAO.devolver(id);

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'DEVOLVER_EMPRESTIMO',
      detalhes: { tabela: 'emprestimos', registro_id: id, antes, depois: emprestimo }
    });

    return emprestimo;
  }

  async remover(id, autor) {
    const antes = await this.buscarPorId(id);
    const removido = await this.emprestimoDAO.remover(id);

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'REMOVER_EMPRESTIMO',
      detalhes: { tabela: 'emprestimos', registro_id: id, dados_excluidos: antes }
    });

    return removido;
  }

  validarItens(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new AppError('Informe pelo menos um jogo no emprestimo.', 422);
    }

    itens.forEach((item) => {
      const jogoId = Number(item.jogo_id);
      const quantidade = Number(item.quantidade);

      if (!Number.isInteger(jogoId) || jogoId <= 0 || !Number.isFinite(quantidade) || quantidade <= 0) {
        throw new AppError('Cada item deve possuir jogo_id e quantidade maior que zero.', 422);
      }
    });
  }
}

module.exports = EmprestimoService;
