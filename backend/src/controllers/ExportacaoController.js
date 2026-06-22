const ExportacaoService = require('../services/ExportacaoService');
const { sucesso } = require('../utils/resposta');

class ExportacaoController {
  constructor(exportacaoService = new ExportacaoService()) {
    this.exportacaoService = exportacaoService;
  }

  async exportar(req, res) {
    const dados = await this.exportacaoService.exportar(req.params.entidade);
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.entidade}.json"`);
    return sucesso(res, 'Dados exportados com sucesso.', dados);
  }

  async importar(req, res) {
    const resultado = await this.exportacaoService.importar(req.params.entidade, req.file, req.usuario);
    return sucesso(res, 'Dados importados com sucesso.', resultado, 201);
  }
}

module.exports = ExportacaoController;
