const LogService = require('../services/LogService');
const { sucesso } = require('../utils/resposta');

class LogController {
  constructor(logService = new LogService()) {
    this.logService = logService;
  }

  async listar(req, res) {
    const logs = await this.logService.listar(req.query);
    return sucesso(res, 'Logs listados com sucesso.', logs);
  }

  async exportarXml(req, res) {
    const xml = await this.logService.exportarXml(req.query);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="logs.xml"');
    return res.send(xml);
  }
}

module.exports = LogController;
