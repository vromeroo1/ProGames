import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, toast, tratarErro } from './ui.js';

exigirAdmin();
montarNavbar('importacao');

document.getElementById('btnExportarJson').addEventListener('click', exportarJson);
document.getElementById('formImportar').addEventListener('submit', importarJson);

async function exportarJson() {
  try {
    const entidade = document.getElementById('entidadeExportar').value;
    const resposta = await apiFetch(`/exportacao/${entidade}`);
    const blob = new Blob([JSON.stringify(resposta.dados, null, 2)], { type: 'application/json' });
    baixarBlob(blob, `${entidade}.json`);
    toast('Arquivo JSON exportado.');
  } catch (erro) {
    tratarErro(erro);
  }
}

async function importarJson(evento) {
  evento.preventDefault();
  const arquivo = document.getElementById('arquivoJson').files[0];
  const entidade = document.getElementById('entidadeImportar').value;
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  try {
    const resposta = await apiFetch(`/importacao/${entidade}`, {
      method: 'POST',
      body: formData
    });
    toast(`${resposta.dados.importados} registros importados.`);
    evento.target.reset();
  } catch (erro) {
    tratarErro(erro);
  }
}

