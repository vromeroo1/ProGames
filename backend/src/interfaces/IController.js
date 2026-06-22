class IController {
  async listar() {
    throw new Error('Metodo listar deve ser implementado pelo Controller.');
  }

  async buscarPorId() {
    throw new Error('Metodo buscarPorId deve ser implementado pelo Controller.');
  }

  async criar() {
    throw new Error('Metodo criar deve ser implementado pelo Controller.');
  }

  async atualizar() {
    throw new Error('Metodo atualizar deve ser implementado pelo Controller.');
  }

  async remover() {
    throw new Error('Metodo remover deve ser implementado pelo Controller.');
  }
}

module.exports = IController;
