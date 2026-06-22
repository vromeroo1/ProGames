import { apiFetch, salvarSessao } from './api.js';
import { toast, tratarErro, atualizarIcones } from './ui.js';

const form = document.getElementById('formLogin');

atualizarIcones();

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const dados = Object.fromEntries(new FormData(form));
  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;

  try {
    const resposta = await apiFetch('/auth/login', {
      method: 'POST',
      body: dados
    });
    salvarSessao(resposta.dados);
    toast('Login realizado com sucesso.');
    window.location.href = resposta.dados.usuario.tipo_usuario === 'admin'
      ? 'pages/dashboard.html'
      : 'pages/catalogo.html';
  } catch (erro) {
    tratarErro(erro);
  } finally {
    botao.disabled = false;
  }
});

