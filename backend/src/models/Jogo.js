class Jogo {
  constructor({
    id,
    titulo,
    descricao,
    categoria_id,
    tipo_jogo,
    plataforma,
    valor_aluguel,
    estoque,
    imagem,
    created_at
  }) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.categoria_id = categoria_id;
    this.tipo_jogo = tipo_jogo;
    this.plataforma = plataforma;
    this.valor_aluguel = valor_aluguel;
    this.estoque = estoque;
    this.imagem = imagem;
    this.created_at = created_at;
  }
}

module.exports = Jogo;
