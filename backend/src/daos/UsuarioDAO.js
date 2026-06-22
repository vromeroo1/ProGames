const pool = require('../config/mysql');
const IDAO = require('../interfaces/IDAO');
const { montarUpdate } = require('../utils/sql');

class UsuarioDAO extends IDAO {
  async listar(filtros = {}) {
    let sql = `
      SELECT id, nome, email, telefone, tipo_usuario, created_at
      FROM usuarios
      WHERE 1 = 1
    `;
    const params = [];

    if (filtros.busca) {
      sql += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?';
      const busca = `%${filtros.busca}%`;
      params.push(busca, busca, busca);

      const buscaNumeros = String(filtros.busca).replace(/\D/g, '');
      if (buscaNumeros) {
        sql += " OR REPLACE(REPLACE(REPLACE(REPLACE(telefone, '(', ''), ')', ''), '-', ''), ' ', '') LIKE ?";
        params.push(`%${buscaNumeros}%`);
      }

      sql += ')';
    }

    if (filtros.tipo_usuario) {
      sql += ' AND tipo_usuario = ?';
      params.push(filtros.tipo_usuario);
    }

    sql += ' ORDER BY nome ASC';

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, telefone, tipo_usuario, created_at
       FROM usuarios
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async buscarPorEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, nome, email, senha, telefone, tipo_usuario, created_at
       FROM usuarios
       WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  async criar(usuario) {
    const [resultado] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario)
       VALUES (?, ?, ?, ?, ?)`,
      [
        usuario.nome,
        usuario.email,
        usuario.senha,
        usuario.telefone || null,
        usuario.tipo_usuario || 'usuario'
      ]
    );

    return this.buscarPorId(resultado.insertId);
  }

  async atualizar(id, dados) {
    const { sets, valores } = montarUpdate(dados, [
      'nome',
      'email',
      'senha',
      'telefone',
      'tipo_usuario'
    ]);

    if (sets.length === 0) {
      return this.buscarPorId(id);
    }

    await pool.execute(
      `UPDATE usuarios SET ${sets.join(', ')} WHERE id = ?`,
      [...valores, id]
    );

    return this.buscarPorId(id);
  }

  async remover(id) {
    const [resultado] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = UsuarioDAO;
