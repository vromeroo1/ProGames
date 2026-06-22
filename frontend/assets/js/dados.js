import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, toast, tratarErro, atualizarIcones } from './ui.js';

exigirAdmin();
montarNavbar('dados');
carregarLogs();

document.getElementById('btnExportarJson').addEventListener('click', exportarJson);
document.getElementById('formImportar').addEventListener('submit', importarJson);
document.getElementById('btnExportarXml').addEventListener('click', exportarXml);
document.getElementById('btnPdfJogos').addEventListener('click', () => baixarPdf('/relatorios/jogos/pdf', 'relatorio-jogos.pdf'));
document.getElementById('btnPdfEmprestimos').addEventListener('click', () => baixarPdf('/relatorios/emprestimos/pdf', 'relatorio-emprestimos.pdf'));
document.getElementById('formFiltroLogs').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarLogs();
});

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

async function carregarLogs() {
  try {
    const params = new URLSearchParams({
      usuario: document.getElementById('usuarioLog')?.value || '',
      data_inicio: document.getElementById('dataInicioLog')?.value || '',
      data_fim: document.getElementById('dataFimLog')?.value || ''
    });
    const resposta = await apiFetch(`/logs?${params}`);
    const tbody = document.getElementById('tabelaLogs');
    tbody.innerHTML = resposta.dados.map((log) => `
      <tr>
        <td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
        <td>${log.usuario || 'anônimo'}</td>
        <td>${log.acao}</td>
        <td>${log.metodo || '-'}</td>
        <td>${log.status_code || '-'}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center text-muted">Nenhum log encontrado.</td></tr>';
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

async function exportarXml() {
  try {
    const params = new URLSearchParams({
      usuario: document.getElementById('usuarioLog').value,
      data_inicio: document.getElementById('dataInicioLog').value,
      data_fim: document.getElementById('dataFimLog').value
    });
    const xml = await apiFetch(`/logs/exportar/xml?${params}`);
    baixarBlob(xml, 'logs.xml');
    toast('Logs exportados em XML.');
  } catch (erro) {
    tratarErro(erro);
  }
}

async function baixarPdf(caminho, nome) {
  try {
    const pdf = await apiFetch(caminho);
    baixarBlob(pdf, nome);
  } catch (erro) {
    tratarErro(erro);
  }
}

