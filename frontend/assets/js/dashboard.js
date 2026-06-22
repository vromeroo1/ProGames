import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, tratarErro, moeda, atualizarIcones, textoPt } from './ui.js';

let grafico;

exigirAdmin();
montarNavbar('dashboard');
carregarDashboard();

document.getElementById('btnPdfEmprestimos').addEventListener('click', baixarPdfEmprestimos);

async function carregarDashboard() {
  try {
    const resposta = await apiFetch('/dashboard/resumo');
    const { resumo, jogosMaisAlugados } = resposta.dados;

    document.getElementById('totalJogos').textContent = resumo.total_jogos;
    document.getElementById('ativos').textContent = resumo.emprestimos_ativos;
    document.getElementById('atrasados').textContent = resumo.emprestimos_atrasados;
    document.getElementById('arrecadado').textContent = moeda(resumo.total_arrecadado);

    renderizarRanking(jogosMaisAlugados);
    renderizarGrafico(jogosMaisAlugados);
    atualizarIcones();
  } catch (erro) {
    tratarErro(erro);
  }
}

function renderizarRanking(jogos) {
  const tbody = document.getElementById('tabelaRanking');
  tbody.innerHTML = jogos.length
    ? jogos.map((jogo) => `<tr><td>${textoPt(jogo.titulo)}</td><td class="text-end fw-semibold">${jogo.total_alugado}</td></tr>`).join('')
    : '<tr><td colspan="2" class="text-center text-muted">Sem empréstimos registrados.</td></tr>';
}

function renderizarGrafico(jogos) {
  const ctx = document.getElementById('graficoJogos');
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: jogos.map((jogo) => textoPt(jogo.titulo)),
      datasets: [{
        label: 'Quantidade Alugada',
        data: jogos.map((jogo) => jogo.total_alugado),
        backgroundColor: ['#0f9f8e', '#ef7d4f', '#d9a441', '#22252c', '#57b8a9', '#b86b47']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

async function baixarPdfEmprestimos() {
  try {
    const pdf = await apiFetch('/relatorios/emprestimos/pdf');
    baixarBlob(pdf, 'relatorio-emprestimos.pdf');
  } catch (erro) {
    tratarErro(erro);
  }
}

