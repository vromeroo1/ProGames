import { apiFetch, exigirUsuarioAutenticado } from './api.js';
import { montarNavbar, tratarErro, moeda, badgeStatus, atualizarIcones, textoPt } from './ui.js';

exigirUsuarioAutenticado();
montarNavbar('historico');
carregarHistorico();

async function carregarHistorico() {
  try {
    const resposta = await apiFetch('/minhas-reservas?situacao=historico');
    const tbody = document.getElementById('tabelaReservas');
    tbody.innerHTML = resposta.dados.map((item) => `
      <tr>
        <td>#${item.id}</td>
        <td class="loan-games-cell">${escaparHtml(textoPt(item.jogos_resumo || '-'))}</td>
        <td>${String(item.data_emprestimo).slice(0, 10)}</td>
        <td>${String(item.data_prevista_devolucao).slice(0, 10)}</td>
        <td>${badgeStatus(item.status)}</td>
        <td class="text-end">${item.dias_aluguel || 1}</td>
        <td class="text-end">${moeda(item.valor_total)}</td>
        <td class="text-end text-muted">Consulta</td>
      </tr>
    `).join('') || '<tr><td colspan="8" class="text-center text-muted">Histórico vazio.</td></tr>';
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

