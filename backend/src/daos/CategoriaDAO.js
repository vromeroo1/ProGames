const pool = require('../config/mysql');
const IDAO = require('../interfaces/IDAO');
const { montarUpdate } = require('../utils/sql');

class CategoriaDAO extends IDAO {
  async listar(filtros = {}) {
    let sql = `
      SELECT c.id, c.nome, c.descricao, COUNT(j.id) AS total_jogos
      FROM categorias c
      LEFT JOIN jogos j ON j.categoria_id = c.id
      WHERE 1 = 1
    `;
    const params = [];

    if (filtros.busca) {
      sql += ' AND (c.nome LIKE ? OR c.descricao LIKE ?)';
      const busca = `%${filtros.busca}%`;
      params.push(busca, busca);
    }

    sql += ' GROUP BY c.id, c.nome, c.descricao ORDER BY c.nome ASC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.execute(
      `SELECT id, nome, descricao
       FROM categorias
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async criar(categoria) {
    const [resultado] = await pool.execute(
      `INSERT INTO categorias (nome, descricao)
       VALUES (?, ?)`,
      [categoria.nome, categoria.descricao || null]
    );

    return this.buscarPorId(resultado.insertId);
  }

  async atualizar(id, dados) {
    const { sets, valores } = montarUpdate(dados, ['nome', 'descricao']);

    if (sets.length === 0) {
      return this.buscarPorId(id);
    }

    await pool.execute(
      `UPDATE categorias SET ${sets.join(', ')} WHERE id = ?`,
      [...valores, id]
    );

    return this.buscarPorId(id);
  }

  async remover(id) {
    const [resultado] = await pool.execute('DELETE FROM categorias WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = CategoriaDAO;
