class Emprestimo {
  constructor({
    id,
    usuario_id,
    data_emprestimo,
    data_prevista_devolucao,
    data_devolucao_real,
    status,
    dias_aluguel,
    desconto,
    valor_total,
    observacoes
  }) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.data_emprestimo = data_emprestimo;
    this.data_prevista_devolucao = data_prevista_devolucao;
    this.data_devolucao_real = data_devolucao_real;
    this.status = status;
    this.dias_aluguel = dias_aluguel;
    this.desconto = desconto;
    this.valor_total = valor_total;
    this.observacoes = observacoes;
  }
}

module.exports = Emprestimo;
