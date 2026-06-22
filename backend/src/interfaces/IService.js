class IService {
  async listar() {
    throw new Error('Metodo listar deve ser implementado pelo Service.');
  }

  async buscarPorId() {
    throw new Error('Metodo buscarPorId deve ser implementado pelo Service.');
  }

  async criar() {
    throw new Error('Metodo criar deve ser implementado pelo Service.');
  }

  async atualizar() {
    throw new Error('Metodo atualizar deve ser implementado pelo Service.');
  }

  async remover() {
    throw new Error('Metodo remover deve ser implementado pelo Service.');
  }
}

module.exports = IService;
