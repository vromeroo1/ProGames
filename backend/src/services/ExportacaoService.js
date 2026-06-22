const ExportacaoDAO = require('../daos/ExportacaoDAO');
const UsuarioService = require('./UsuarioService');
const CategoriaService = require('./CategoriaService');
const JogoService = require('./JogoService');
const EmprestimoService = require('./EmprestimoService');
const AppError = require('../utils/AppError');

class ExportacaoService {
  constructor(
    exportacaoDAO = new ExportacaoDAO(),
    usuarioService = new UsuarioService(),
    categoriaService = new CategoriaService(),
    jogoService = new JogoService(),
    emprestimoService = new EmprestimoService()
  ) {
    this.exportacaoDAO = exportacaoDAO;
    this.usuarioService = usuarioService;
    this.categoriaService = categoriaService;
    this.jogoService = jogoService;
    this.emprestimoService = emprestimoService;
  }

  async exportar(entidade) {
    const registros = await this.exportacaoDAO.listarEntidade(entidade);
    return {
      entidade,
      gerado_em: new Date().toISOString(),
      total: registros.length,
      registros
    };
  }

  async importar(entidade, arquivo, autor) {
    if (!arquivo) {
      throw new AppError('Envie um arquivo JSON para importacao.', 422);
    }

    const conteudo = JSON.parse(arquivo.buffer.toString('utf8'));
    const registros = Array.isArray(conteudo) ? conteudo : conteudo.registros;

    if (!Array.isArray(registros)) {
      throw new AppError('O JSON deve ser um array ou possuir a propriedade registros.', 422);
    }

    let importados = 0;

    for (const registro of registros) {
      if (entidade === 'usuarios') {
        await this.usuarioService.criar({ senha: '123456', ...registro }, autor);
      } else if (entidade === 'categorias') {
        await this.categoriaService.criar(registro, autor);
      } else if (entidade === 'jogos') {
        await this.jogoService.criar(registro, null, autor);
      } else if (entidade === 'emprestimos') {
        await this.emprestimoService.criar(registro, autor);
      } else {
        throw new AppError('Entidade nao permitida para importacao.', 400);
      }
      importados += 1;
    }

    return { entidade, importados };
  }
}

module.exports = ExportacaoService;
