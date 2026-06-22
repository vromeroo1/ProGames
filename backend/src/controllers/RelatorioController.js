const RelatorioService = require('../services/RelatorioService');

class RelatorioController {
  constructor(relatorioService = new RelatorioService()) {
    this.relatorioService = relatorioService;
  }

  async jogos(req, res) {
    const pdf = await this.relatorioService.gerarJogosPdf(req.query, req.usuario, contextoLog(req));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-jogos.pdf"');
    return res.send(pdf);
  }

  async emprestimos(req, res) {
    const pdf = await this.relatorioService.gerarEmprestimosPdf(req.query, req.usuario, contextoLog(req));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-emprestimos.pdf"');
    return res.send(pdf);
  }
}

function contextoLog(req) {
  return {
    endpoint: req.originalUrl,
    metodo: req.method,
    ip: req.ip
  };
}

module.exports = RelatorioController;
