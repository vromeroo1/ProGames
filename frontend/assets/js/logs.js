import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, toast, tratarErro, atualizarIcones } from './ui.js';

exigirAdmin();
montarNavbar('logs');
carregarLogs();

document.getElementById('btnExportarXml').addEventListener('click', exportarXml);
document.getElementById('formFiltroLogs').addEventListener('submit', (evento) => {
  evento.preventDefault();
  carregarLogs();
});

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

