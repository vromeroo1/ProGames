import { apiFetch, exigirAdmin, baixarBlob } from './api.js';
import { montarNavbar, tratarErro } from './ui.js';

exigirAdmin();
montarNavbar('relatorios');

document.getElementById('btnPdfJogos').addEventListener('click', () => baixarPdf('/relatorios/jogos/pdf', 'relatorio-jogos.pdf'));
document.getElementById('btnPdfEmprestimos').addEventListener('click', () => baixarPdf('/relatorios/emprestimos/pdf', 'relatorio-emprestimos.pdf'));

async function baixarPdf(caminho, nome) {
  try {
    const pdf = await apiFetch(caminho);
    baixarBlob(pdf, nome);
  } catch (erro) {
    tratarErro(erro);
  }
}

