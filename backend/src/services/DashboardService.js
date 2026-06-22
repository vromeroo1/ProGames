const DashboardDAO = require('../daos/DashboardDAO');

class DashboardService {
  constructor(dashboardDAO = new DashboardDAO()) {
    this.dashboardDAO = dashboardDAO;
  }

  async resumoCompleto() {
    const [resumo, jogosMaisAlugados, emprestimosPorStatus] = await Promise.all([
      this.dashboardDAO.resumo(),
      this.dashboardDAO.jogosMaisAlugados(),
      this.dashboardDAO.emprestimosPorStatus()
    ]);

    return {
      resumo,
      jogosMaisAlugados,
      emprestimosPorStatus
    };
  }
}

module.exports = DashboardService;
