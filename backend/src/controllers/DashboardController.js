const DashboardService = require('../services/DashboardService');
const { sucesso } = require('../utils/resposta');

class DashboardController {
  constructor(dashboardService = new DashboardService()) {
    this.dashboardService = dashboardService;
  }

  async resumo(req, res) {
    const dashboard = await this.dashboardService.resumoCompleto();
    return sucesso(res, 'Dashboard carregado com sucesso.', dashboard);
  }
}

module.exports = DashboardController;
