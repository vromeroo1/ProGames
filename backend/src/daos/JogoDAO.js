const pool = require('../config/mysql');
const IDAO = require('../interfaces/IDAO');
const { montarUpdate } = require('../utils/sql');

class JogoDAO extends IDAO {
  async listar(filtros = {}) {
    let sql = `
      SELECT
        j.id, j.titulo, j.descricao, j.categoria_id, c.nome AS categoria_nome,
        j.tipo_jogo, j.plataforma, j.valor_aluguel, j.estoque, j.imagem, j.created_at
      FROM jogos j
      INNER JOIN categorias c ON c.id = j.categoria_id
      WHERE 1 = 1
    `;
    const params = [];

    if (filtros.busca) {
      sql += ' AND (j.titulo LIKE ? OR j.descricao LIKE ? OR j.plataforma LIKE ?)';
      const busca = `%${filtros.busca}%`;
      params.push(busca, busca, busca);
    }

    if (filtros.categoria_id) {
      sql += ' AND j.categoria_id = ?';
      params.push(filtros.categoria_id);
    }

    if (filtros.tipo_jogo) {
      sql += ' AND j.tipo_jogo = ?';
      params.push(filtros.tipo_jogo);
    }

    if (filtros.plataforma) {
      sql += ' AND j.plataforma = ?';
      params.push(filtros.plataforma);
    }

    if (filtros.disponiveis === '1' || filtros.disponiveis === true) {
      sql += ' AND j.estoque > 0';
    }

    sql += ' ORDER BY j.titulo ASC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.execute(
      `SELECT
        j.id, j.titulo, j.descricao, j.categoria_id, c.nome AS categoria_nome,
        j.tipo_jogo, j.plataforma, j.valor_aluguel, j.estoque, j.imagem, j.created_at
       FROM jogos j
       INNER JOIN categorias c ON c.id = j.categoria_id
       WHERE j.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async criar(jogo) {
    const [resultado] = await pool.execute(
      `INSERT INTO jogos
       (titulo, descricao, categoria_id, tipo_jogo, plataforma, valor_aluguel, estoque, imagem)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jogo.titulo,
        jogo.descricao || null,
        jogo.categoria_id,
        jogo.tipo_jogo,
        jogo.plataforma || null,
        jogo.valor_aluguel,
        jogo.estoque,
        jogo.imagem || null
      ]
    );

    return this.buscarPorId(resultado.insertId);
  }

  async atualizar(id, dados) {
    const { sets, valores } = montarUpdate(dados, [
      'titulo',
      'descricao',
      'categoria_id',
      'tipo_jogo',
      'plataforma',
      'valor_aluguel',
      'estoque',
      'imagem'
    ]);

    if (sets.length === 0) {
      return this.buscarPorId(id);
    }

    await pool.execute(
      `UPDATE jogos SET ${sets.join(', ')} WHERE id = ?`,
      [...valores, id]
    );

    return this.buscarPorId(id);
  }

  async remover(id) {
    const [resultado] = await pool.execute('DELETE FROM jogos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }

  async ajustarEstoque(id, quantidade) {
    const [resultado] = await pool.execute(
      `UPDATE jogos
       SET estoque = estoque + ?
       WHERE id = ? AND estoque + ? >= 0`,
      [quantidade, id, quantidade]
    );

    return resultado.affectedRows > 0 ? this.buscarPorId(id) : null;
  }
}

module.exports = JogoDAO;
