const pool = require('../config/mysql');
const AppError = require('../utils/AppError');

const consultas = {
  usuarios: `SELECT id, nome, email, telefone, tipo_usuario, created_at FROM usuarios ORDER BY nome`,
  categorias: 'SELECT id, nome, descricao FROM categorias ORDER BY nome',
  jogos: `
    SELECT j.*, c.nome AS categoria_nome
    FROM jogos j
    INNER JOIN categorias c ON c.id = j.categoria_id
    ORDER BY j.titulo
  `,
  emprestimos: `
    SELECT e.*, u.nome AS usuario_nome, u.email AS usuario_email
    FROM emprestimos e
    INNER JOIN usuarios u ON u.id = e.usuario_id
    ORDER BY e.data_emprestimo DESC
  `
};

class ExportacaoDAO {
  async listarEntidade(entidade) {
    if (!consultas[entidade]) {
      throw new AppError('Entidade nao permitida para exportacao.', 400);
    }

    const [rows] = await pool.execute(consultas[entidade]);
    return rows;
  }
}

module.exports = ExportacaoDAO;
