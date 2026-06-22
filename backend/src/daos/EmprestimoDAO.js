const pool = require('../config/mysql');
const IDAO = require('../interfaces/IDAO');
const AppError = require('../utils/AppError');
const { montarUpdate } = require('../utils/sql');

class EmprestimoDAO extends IDAO {
  async listar(filtros = {}) {
    let sql = `
      SELECT
        e.id, e.usuario_id, u.nome AS usuario_nome, u.email AS usuario_email,
        e.data_emprestimo, e.data_prevista_devolucao, e.data_devolucao_real,
        CASE
          WHEN e.status IN ('pendente', 'aprovado', 'retirado') AND e.data_prevista_devolucao < CURDATE() THEN 'atrasado'
          ELSE e.status
        END AS status,
        e.dias_aluguel, e.desconto, e.valor_total, e.observacoes,
        COALESCE(SUM(i.quantidade), 0) AS total_itens,
        COALESCE(GROUP_CONCAT(CONCAT(j.titulo, ' (', i.quantidade, 'x)') ORDER BY j.titulo SEPARATOR ', '), '-') AS jogos_resumo
      FROM emprestimos e
      INNER JOIN usuarios u ON u.id = e.usuario_id
      LEFT JOIN itens_emprestimo i ON i.emprestimo_id = e.id
      LEFT JOIN jogos j ON j.id = i.jogo_id
      WHERE 1 = 1
    `;
    const params = [];

    if (filtros.situacao === 'ativas') {
      sql += " AND e.status IN ('pendente', 'aprovado', 'retirado')";
    }

    if (filtros.situacao === 'historico') {
      sql += " AND e.status IN ('devolvido', 'cancelado')";
    }

    if (filtros.status) {
      if (filtros.status === 'atrasado') {
        sql += " AND e.status IN ('pendente', 'aprovado', 'retirado') AND e.data_prevista_devolucao < CURDATE()";
      } else {
        sql += ' AND e.status = ?';
        params.push(filtros.status);
      }
    }

    if (filtros.usuario_id) {
      sql += ' AND e.usuario_id = ?';
      params.push(filtros.usuario_id);
    }

    if (filtros.atrasados === '1' || filtros.atrasados === true) {
      sql += " AND e.status IN ('pendente', 'aprovado', 'retirado') AND e.data_prevista_devolucao < CURDATE()";
    }

    sql += `
      GROUP BY e.id, u.nome, u.email
      ORDER BY e.id DESC
    `;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  async buscarPorId(id) {
    const [emprestimos] = await pool.execute(
      `SELECT
        e.id, e.usuario_id, u.nome AS usuario_nome, u.email AS usuario_email,
        e.data_emprestimo, e.data_prevista_devolucao, e.data_devolucao_real,
        CASE
          WHEN e.status IN ('pendente', 'aprovado', 'retirado') AND e.data_prevista_devolucao < CURDATE() THEN 'atrasado'
          ELSE e.status
        END AS status,
        e.dias_aluguel, e.desconto, e.valor_total, e.observacoes
       FROM emprestimos e
       INNER JOIN usuarios u ON u.id = e.usuario_id
       WHERE e.id = ?`,
      [id]
    );

    const emprestimo = emprestimos[0];
    if (!emprestimo) {
      return null;
    }

    const [itens] = await pool.execute(
      `SELECT
        i.id, i.emprestimo_id, i.jogo_id, j.titulo AS jogo_titulo,
        j.imagem AS jogo_imagem, i.quantidade, i.valor_unitario
       FROM itens_emprestimo i
       INNER JOIN jogos j ON j.id = i.jogo_id
       WHERE i.emprestimo_id = ?
       ORDER BY j.titulo ASC`,
      [id]
    );

    const diasAluguel = Number(emprestimo.dias_aluguel || 1);
    const itensComTotais = itens.map((item) => {
      const quantidade = Number(item.quantidade || 0);
      const valorUnitario = Number(item.valor_unitario || 0);
      const subtotal = Number((quantidade * valorUnitario * diasAluguel).toFixed(2));
      const desconto = calcularDescontoItem(diasAluguel, valorUnitario, quantidade);

      return {
        ...item,
        subtotal,
        desconto,
        total: Number((subtotal - desconto).toFixed(2))
      };
    });

    return { ...emprestimo, itens: itensComTotais };
  }

  async listarPorUsuario(usuarioId, filtros = {}) {
    return this.listar({ ...filtros, usuario_id: usuarioId });
  }

  async criar(dados, statusInicial = 'aprovado') {
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();

      const [usuarios] = await conexao.execute(
        'SELECT id FROM usuarios WHERE id = ?',
        [dados.usuario_id]
      );

      if (usuarios.length === 0) {
        throw new AppError('Usuario informado nao existe.', 404);
      }

      const { dataRetirada, diasAluguel } = prepararPeriodo(dados.data_retirada || dados.data_emprestimo, dados.data_prevista_devolucao);
      let subtotal = 0;
      let desconto = 0;
      const itensProcessados = [];
      const itensAgrupados = agruparItens(dados.itens);

      for (const item of itensAgrupados) {
        const quantidade = Number(item.quantidade);
        const [jogos] = await conexao.execute(
          'SELECT id, titulo, valor_aluguel, estoque FROM jogos WHERE id = ? FOR UPDATE',
          [item.jogo_id]
        );

        const jogo = jogos[0];
        if (!jogo) {
          throw new AppError(`Jogo ${item.jogo_id} nao encontrado.`, 404);
        }

        if (jogo.estoque < quantidade) {
          throw new AppError(`Estoque insuficiente para o jogo ${jogo.titulo}.`, 422);
        }

        const valorUnitario = Number(jogo.valor_aluguel);
        const subtotalItem = valorUnitario * quantidade * diasAluguel;
        const descontoItem = calcularDescontoItem(diasAluguel, valorUnitario, quantidade);

        subtotal += subtotalItem;
        desconto += descontoItem;
        itensProcessados.push({
          jogo_id: jogo.id,
          quantidade,
          valor_unitario: valorUnitario
        });
      }

      desconto = Number(desconto.toFixed(2));
      const valorTotal = Number((subtotal - desconto).toFixed(2));

      const [resultado] = await conexao.execute(
        `INSERT INTO emprestimos
         (usuario_id, data_emprestimo, data_prevista_devolucao, status, dias_aluguel, desconto, valor_total, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dados.usuario_id,
          formatarDataHoraMysql(dataRetirada),
          dados.data_prevista_devolucao,
          statusInicial,
          diasAluguel,
          desconto,
          valorTotal,
          dados.observacoes || null
        ]
      );

      for (const item of itensProcessados) {
        await conexao.execute(
          `INSERT INTO itens_emprestimo
           (emprestimo_id, jogo_id, quantidade, valor_unitario)
           VALUES (?, ?, ?, ?)`,
          [resultado.insertId, item.jogo_id, item.quantidade, item.valor_unitario]
        );

        await conexao.execute(
          `UPDATE jogos
           SET estoque = estoque - ?
           WHERE id = ? AND estoque >= ?`,
          [item.quantidade, item.jogo_id, item.quantidade]
        );
      }

      await conexao.commit();
      return this.buscarPorId(resultado.insertId);
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async atualizar(id, dados) {
    const antes = await this.buscarPorId(id);
    const deveRestaurarEstoque = dados.status === 'cancelado' && antes && statusReservaEstoque(antes.status);

    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const camposPermitidos = [
        'data_emprestimo',
        'data_prevista_devolucao',
        'status',
        'observacoes'
      ];
      const dadosAtualizacao = { ...dados };
      let dataInicioRecalculo = antes?.data_emprestimo;

      if (dados.data_retirada) {
        dataInicioRecalculo = dados.data_retirada;
        const dataRetiradaAtualizada = normalizarData(dados.data_retirada);
        if (!dataRetiradaAtualizada) {
          throw new AppError('Informe uma data de retirada valida.', 422);
        }

        dadosAtualizacao.data_emprestimo = formatarDataHoraMysql(dataRetiradaAtualizada);
        delete dadosAtualizacao.data_retirada;
      }

      if ((dados.data_prevista_devolucao || dados.data_retirada) && antes) {
        const totais = await recalcularTotais(
          conexao,
          id,
          dataInicioRecalculo,
          dados.data_prevista_devolucao || antes.data_prevista_devolucao
        );
        dadosAtualizacao.dias_aluguel = totais.diasAluguel;
        dadosAtualizacao.desconto = totais.desconto;
        dadosAtualizacao.valor_total = totais.valorTotal;
        camposPermitidos.push('dias_aluguel', 'desconto', 'valor_total');
      }

      const { sets, valores } = montarUpdate(dadosAtualizacao, camposPermitidos);

      if (sets.length > 0) {
        await conexao.execute(
          `UPDATE emprestimos SET ${sets.join(', ')} WHERE id = ?`,
          [...valores, id]
        );
      }

      if (deveRestaurarEstoque) {
        const [itens] = await conexao.execute(
          'SELECT jogo_id, quantidade FROM itens_emprestimo WHERE emprestimo_id = ?',
          [id]
        );

        for (const item of itens) {
          await conexao.execute(
            'UPDATE jogos SET estoque = estoque + ? WHERE id = ?',
            [item.quantidade, item.jogo_id]
          );
        }
      }

      await conexao.commit();
      return this.buscarPorId(id);
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async devolver(id) {
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();

      const [emprestimos] = await conexao.execute(
        'SELECT * FROM emprestimos WHERE id = ? FOR UPDATE',
        [id]
      );
      const emprestimo = emprestimos[0];

      if (!emprestimo) {
        throw new AppError('Emprestimo nao encontrado.', 404);
      }

      if (!['aprovado', 'retirado', 'atrasado'].includes(emprestimo.status)) {
        throw new AppError('Este emprestimo nao esta em aberto para devolucao.', 422);
      }

      const [itens] = await conexao.execute(
        'SELECT jogo_id, quantidade FROM itens_emprestimo WHERE emprestimo_id = ?',
        [id]
      );

      await conexao.execute(
        `UPDATE emprestimos
         SET status = 'devolvido',
             data_devolucao_real = NOW()
         WHERE id = ? AND status IN ('aprovado', 'retirado', 'atrasado')`,
        [id]
      );

      for (const item of itens) {
        await conexao.execute(
          'UPDATE jogos SET estoque = estoque + ? WHERE id = ?',
          [item.quantidade, item.jogo_id]
        );
      }

      await conexao.commit();
      return this.buscarPorId(id);
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  async remover(id) {
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const [emprestimos] = await conexao.execute(
        'SELECT id, status FROM emprestimos WHERE id = ? FOR UPDATE',
        [id]
      );
      const emprestimo = emprestimos[0];

      if (!emprestimo) {
        await conexao.rollback();
        return false;
      }

      if (statusReservaEstoque(emprestimo.status)) {
        const [itens] = await conexao.execute(
          'SELECT jogo_id, quantidade FROM itens_emprestimo WHERE emprestimo_id = ?',
          [id]
        );

        for (const item of itens) {
          await conexao.execute(
            'UPDATE jogos SET estoque = estoque + ? WHERE id = ?',
            [item.quantidade, item.jogo_id]
          );
        }
      }

      await conexao.execute('DELETE FROM emprestimos WHERE id = ?', [id]);
      await conexao.commit();
      return true;
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

}

function calcularDiasAluguel(dataInicio, dataPrevista) {
  const inicio = normalizarData(dataInicio);
  const fim = normalizarData(dataPrevista);

  if (!inicio || !fim || fim <= inicio) {
    return 1;
  }

  const umDia = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((fim - inicio) / umDia));
}

function normalizarData(data) {
  if (!data) {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  }

  if (data instanceof Date) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  }

  const texto = String(data).slice(0, 10);
  const normalizada = new Date(`${texto}T00:00:00`);
  return Number.isNaN(normalizada.getTime()) ? null : normalizada;
}

function prepararPeriodo(dataRetirada, dataPrevista) {
  const inicio = normalizarData(dataRetirada);
  const fim = normalizarData(dataPrevista);

  if (!inicio || !fim) {
    throw new AppError('Informe datas validas para o emprestimo.', 422);
  }

  if (fim < inicio) {
    throw new AppError('A data de devolucao deve ser igual ou posterior a data de retirada.', 422);
  }

  return {
    dataRetirada: inicio,
    diasAluguel: calcularDiasAluguel(inicio, fim)
  };
}

function calcularDescontoItem(diasAluguel, valorUnitario, quantidade = 1) {
  if (diasAluguel < 3) {
    return 0;
  }

  const descontoPorUnidade = Math.min(10, Number(valorUnitario) * diasAluguel);
  return Number((descontoPorUnidade * Number(quantidade || 1)).toFixed(2));
}

function formatarDataHoraMysql(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia} 00:00:00`;
}

function agruparItens(itens) {
  const agrupados = new Map();

  itens.forEach((item) => {
    const jogoId = Number(item.jogo_id);
    const quantidade = Number(item.quantidade);
    const atual = agrupados.get(jogoId) || { jogo_id: jogoId, quantidade: 0 };
    atual.quantidade += quantidade;
    agrupados.set(jogoId, atual);
  });

  return [...agrupados.values()];
}

async function recalcularTotais(conexao, emprestimoId, dataInicio, dataPrevista) {
  const [itens] = await conexao.execute(
    'SELECT quantidade, valor_unitario FROM itens_emprestimo WHERE emprestimo_id = ?',
    [emprestimoId]
  );

  const diasAluguel = calcularDiasAluguel(dataInicio, dataPrevista);
  const totais = calcularTotaisItens(itens, diasAluguel);
  const { subtotal, desconto } = totais;
  const valorTotal = Number((subtotal - desconto).toFixed(2));

  return { diasAluguel, desconto, valorTotal };
}

function calcularTotaisItens(itens, diasAluguel) {
  const totais = itens.reduce((total, item) => {
    const quantidade = Number(item.quantidade || 0);
    const valorUnitario = Number(item.valor_unitario || 0);
    const subtotalItem = quantidade * valorUnitario * diasAluguel;
    const descontoItem = calcularDescontoItem(diasAluguel, valorUnitario, quantidade);

    return {
      subtotal: total.subtotal + subtotalItem,
      desconto: total.desconto + descontoItem
    };
  }, { subtotal: 0, desconto: 0 });

  return {
    subtotal: Number(totais.subtotal.toFixed(2)),
    desconto: Number(totais.desconto.toFixed(2))
  };
}

function statusReservaEstoque(status) {
  return ['pendente', 'aprovado', 'retirado', 'atrasado'].includes(status);
}

module.exports = EmprestimoDAO;
