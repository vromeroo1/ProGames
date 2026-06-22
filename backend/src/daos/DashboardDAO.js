const pool = require('../config/mysql');

class DashboardDAO {
  async resumo() {
    const [[usuarios]] = await pool.execute('SELECT COUNT(*) AS total_usuarios FROM usuarios');
    const [[jogos]] = await pool.execute(
      'SELECT COUNT(*) AS total_jogos, COALESCE(SUM(estoque), 0) AS estoque_total FROM jogos'
    );
    const [[emprestimos]] = await pool.execute(`
      SELECT
        SUM(CASE WHEN status IN ('pendente', 'aprovado', 'retirado') THEN 1 ELSE 0 END) AS emprestimos_ativos,
        SUM(CASE WHEN status IN ('pendente', 'aprovado', 'retirado') AND data_prevista_devolucao < CURDATE() THEN 1 ELSE 0 END) AS emprestimos_atrasados,
        COALESCE(SUM(CASE WHEN status = 'devolvido' THEN valor_total ELSE 0 END), 0) AS total_arrecadado
      FROM emprestimos
    `);

    return {
      total_usuarios: usuarios.total_usuarios,
      total_jogos: jogos.total_jogos,
      estoque_total: jogos.estoque_total,
      emprestimos_ativos: emprestimos.emprestimos_ativos || 0,
      emprestimos_atrasados: emprestimos.emprestimos_atrasados || 0,
      total_arrecadado: emprestimos.total_arrecadado || 0
    };
  }

  async jogosMaisAlugados() {
    const [rows] = await pool.execute(`
      SELECT j.titulo, SUM(i.quantidade) AS total_alugado
      FROM itens_emprestimo i
      INNER JOIN jogos j ON j.id = i.jogo_id
      GROUP BY j.id, j.titulo
      ORDER BY total_alugado DESC
      LIMIT 8
    `);
    return rows;
  }

  async emprestimosPorStatus() {
    const [rows] = await pool.execute(`
      SELECT
        CASE
          WHEN status IN ('pendente', 'aprovado', 'retirado') AND data_prevista_devolucao < CURDATE() THEN 'atrasado'
          ELSE status
        END AS status,
        COUNT(*) AS total
      FROM emprestimos
      GROUP BY
        CASE
          WHEN status IN ('pendente', 'aprovado', 'retirado') AND data_prevista_devolucao < CURDATE() THEN 'atrasado'
          ELSE status
        END
    `);
    return rows;
  }
}

module.exports = DashboardDAO;
