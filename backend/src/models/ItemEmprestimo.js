class ItemEmprestimo {
  constructor({ id, emprestimo_id, jogo_id, quantidade, valor_unitario }) {
    this.id = id;
    this.emprestimo_id = emprestimo_id;
    this.jogo_id = jogo_id;
    this.quantidade = quantidade;
    this.valor_unitario = valor_unitario;
  }
}

module.exports = ItemEmprestimo;
