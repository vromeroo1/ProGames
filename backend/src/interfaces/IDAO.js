class IDAO {
  async listar() {
    throw new Error('Metodo listar deve ser implementado pelo DAO.');
  }

  async buscarPorId() {
    throw new Error('Metodo buscarPorId deve ser implementado pelo DAO.');
  }

  async criar() {
    throw new Error('Metodo criar deve ser implementado pelo DAO.');
  }

  async atualizar() {
    throw new Error('Metodo atualizar deve ser implementado pelo DAO.');
  }

  async remover() {
    throw new Error('Metodo remover deve ser implementado pelo DAO.');
  }
}

module.exports = IDAO;
