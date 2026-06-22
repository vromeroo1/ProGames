import { apiFetch, exigirUsuarioAutenticado } from './api.js';
import { montarNavbar, tratarErro, moeda, badgeStatus, textoPt } from './ui.js';

exigirUsuarioAutenticado();
montarNavbar('minhas-reservas');
carregarReservas();

async function carregarReservas() {
  try {
    const resposta = await apiFetch('/minhas-reservas?situacao=ativas');
    renderizarTabela(resposta.dados);
  } catch (erro) {
    tratarErro(erro);
  }
}

function renderizarTabela(reservas) {
  const tbody = document.getElementById('tabelaReservas');
  tbody.innerHTML = reservas.map((reserva) => `
    <tr>
      <td>#${reserva.id}</td>
      <td class="loan-games-cell">${escaparHtml(textoPt(reserva.jogos_resumo || '-'))}</td>
      <td>${String(reserva.data_emprestimo).slice(0, 10)}</td>
      <td>${String(reserva.data_prevista_devolucao).slice(0, 10)}</td>
      <td>${badgeStatus(reserva.status)}</td>
      <td class="text-end">${reserva.dias_aluguel || 1}</td>
      <td class="text-end">${moeda(reserva.valor_total)}</td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="text-center text-muted">Nenhuma reserva ativa no momento.</td></tr>';
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
