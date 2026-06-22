# ProGames

Sistema web full stack de locadora de jogos desenvolvido para a disciplina **Programacao Para Internet**.

Autores:

- Bruno Alexandre Holanda de Lima Silva
- Victor Romero Siqueira dos Santos

O ProGames foi criado para controlar uma locadora que trabalha com video games e board games. O sistema permite administrar usuarios, jogos, categorias, reservas, emprestimos, devolucoes, estoque, relatorios, importacao/exportacao de dados e logs.

## Tema do projeto

O tema escolhido foi uma locadora de jogos. A aplicacao atende dois perfis de uso:

- Administrador: gerencia cadastros, estoque, usuarios, emprestimos, relatorios, importacao/exportacao e logs.
- Usuario comum: consulta o catalogo, filtra jogos, solicita reservas, acompanha reservas ativas, visualiza historico e acessa o proprio perfil.

## Ferramentas e tecnologias utilizadas

Backend:

- Node.js
- Express
- JavaScript
- JWT para autenticacao
- bcryptjs para hash de senha
- Multer para upload de imagens
- PDFKit para relatorios PDF
- xml2js para exportacao XML

Frontend:

- HTML5
- CSS3
- JavaScript
- Bootstrap
- Chart.js no dashboard

Banco de dados:

- MySQL como banco relacional principal
- MongoDB para logs do sistema

Ferramentas de apoio:

- XAMPP para iniciar o MySQL localmente
- phpMyAdmin ou MySQL Workbench para visualizar e administrar as tabelas
- npm para instalacao das dependencias
- Git/GitHub para versionamento

## Requisitos do trabalho atendidos

O projeto foi organizado para atender aos principais requisitos do enunciado da disciplina:

- Aplicacao web full stack.
- Backend em Node.js com Express.
- Frontend em HTML, CSS, JavaScript e Bootstrap.
- Banco principal em MySQL.
- Banco NoSQL MongoDB para logs.
- Arquitetura MVC com Service Layer.
- Rotas separadas por recurso.
- Middlewares de autenticacao, autorizacao, validacao, logs e erros.
- Interfaces `IDAO`, `IService` e `IController`.
- Uso de orientacao a objetos.
- Uso de async/await.
- CRUD completo de usuarios, categorias, jogos e emprestimos.
- Relacionamentos 1:N e N:N no MySQL.
- Consultas com SELECT, INSERT, UPDATE, DELETE, WHERE e JOIN.
- Autenticacao com JWT.
- Controle de acesso por tipo de usuario.
- Upload de imagens dos jogos.
- Relatorios PDF.
- Exportacao/importacao JSON.
- Exportacao XML dos logs.
- Dashboard com Chart.js.
- Respostas JSON padronizadas.

## Estrutura do projeto

```text
backend/
  src/
    config/
    controllers/
    daos/
    interfaces/
    middlewares/
    models/
    routes/
    services/
    utils/
  uploads/
database/
frontend/
  assets/
    css/
    img/
    js/
  pages/
docs/
```

Resumo das pastas:

- `backend/src/routes`: define as rotas e os verbos HTTP.
- `backend/src/middlewares`: autentica, autoriza, valida dados, registra logs e trata erros.
- `backend/src/controllers`: recebe as requisicoes e devolve respostas JSON.
- `backend/src/services`: concentra as regras de negocio.
- `backend/src/daos`: executa consultas SQL e acesso aos dados.
- `backend/src/interfaces`: contem `IDAO`, `IService` e `IController`.
- `frontend/pages`: paginas HTML do sistema.
- `frontend/assets/js`: scripts de cada tela.
- `frontend/assets/img`: imagens padrao usadas no catalogo.
- `database/banco.sql`: script completo do banco MySQL.
- `docs/diagrama_der_progames.png`: imagem do DER do banco de dados.

## Diagrama do banco de dados

O diagrama DER do MySQL esta salvo em:

```text
docs/diagrama_der_progames.png
```

Tambem ha uma versao textual em Mermaid no arquivo:

```text
docs/DER.md
```

Esses arquivos mostram as tabelas principais e os relacionamentos:

- `usuarios` 1:N `emprestimos`
- `categorias` 1:N `jogos`
- `emprestimos` N:N `jogos` por meio de `itens_emprestimo`

## Banco de dados MySQL

O script principal esta em:

```text
database/banco.sql
```

Ele cria o banco `locacao_jogos`, as tabelas, chaves primarias, chaves estrangeiras, indices, regras de integridade e dados de teste.

Tabelas principais:

- `usuarios`
- `categorias`
- `jogos`
- `emprestimos`
- `itens_emprestimo`

O banco foi montado para demonstrar relacionamentos e consultas reais com filtros, joins e atualizacoes com `WHERE`.

## MongoDB e logs

O MongoDB e usado para armazenar logs do sistema na colecao `logs`.

Os logs registram informacoes como:

- usuario
- endpoint
- metodo HTTP
- data e hora
- status code
- acao
- IP
- detalhes da operacao

Se o MongoDB nao estiver ligado, o sistema possui um fallback local em:

```text
backend/logs/logs_fallback.jsonl
```

Esse arquivo nao e usado como banco principal; ele existe apenas para nao interromper o funcionamento da API durante testes locais.

## Regras de negocio

- Cada jogo possui valor de diaria no campo `valor_aluguel`.
- O valor do emprestimo considera a quantidade de dias entre retirada e devolucao prevista.
- A partir de 3 diarias, o sistema aplica desconto de R$ 10,00 por item/unidade.
- Um emprestimo pode possuir varios jogos.
- A tabela `itens_emprestimo` representa o relacionamento N:N entre emprestimos e jogos.
- O estoque e verificado antes de confirmar uma reserva ou emprestimo.
- Ao criar reserva/emprestimo, o estoque e reduzido conforme a quantidade solicitada.
- Ao registrar devolucao, o estoque retorna.
- O sistema controla atraso por status, sem cobranca de multa.
- O administrador pode aprovar, cancelar, editar e devolver emprestimos/reservas.
- O usuario comum solicita reservas e acompanha seus proprios registros.

## Imagens dos jogos

O administrador pode enviar uma capa propria para cada jogo. O upload e feito com Multer e os arquivos enviados ficam em:

```text
backend/uploads
```

Quando um jogo nao possui capa enviada, o frontend usa automaticamente uma imagem padrao de acordo com a plataforma. Essas imagens ficam em:

```text
frontend/assets/img
```

Arquivos padrao:

- `default-ps5.jpg`
- `default-xbox.jpg`
- `default-switch.jpg`
- `default-switch-2.jpg`
- `default-boardgame.jpg`

## Funcionalidades principais

Administrador:

- Dashboard com indicadores.
- CRUD de jogos.
- CRUD de categorias.
- CRUD de usuarios.
- Controle de estoque.
- Visualizacao de todos os emprestimos e reservas.
- Aprovacao, cancelamento, edicao e devolucao.
- Relatorios PDF.
- Importacao/exportacao JSON.
- Exportacao XML dos logs.
- Consulta de logs do sistema.

Usuario comum:

- Catalogo de jogos.
- Filtro por titulo, plataforma, categoria e tipo.
- Visualizacao de detalhes do jogo.
- Solicitacao de reserva/emprestimo.
- Tela Minhas Reservas com registros ativos.
- Historico pessoal.
- Meu Perfil.

## Relatorios e exportacoes

O sistema gera:

- Relatorio PDF de jogos.
- Relatorio PDF de emprestimos.
- Exportacao JSON de entidades do sistema.
- Importacao JSON para carga de dados.
- Exportacao XML dos logs.

Os PDFs sao gerados pelo backend com PDFKit. A exportacao XML dos logs usa xml2js.

## Como executar o projeto

1. Instale o Node.js.
2. Instale o XAMPP.
3. Inicie o MySQL pelo painel do XAMPP.
4. Abra o phpMyAdmin ou MySQL Workbench.
5. Execute o script:

```text
database/banco.sql
```

6. Instale as dependencias:

```bash
npm install
```

7. Copie o arquivo de ambiente:

```bash
copy .env.example .env
```

8. Confira o `.env`. Se o MySQL tiver senha, preencha `MYSQL_PASSWORD`.
9. Inicie a aplicacao:

```bash
npm start
```

10. Acesse no navegador:

```text
http://localhost:3000
```

Usuarios de teste:

```text
Admin: admin@locadora.com / 123456
Usuario: usuario@locadora.com / 123456
```

## Scripts disponiveis

```bash
npm start
npm run dev
npm run verificar
npm run documentacao:pdf
```

## Endpoints principais

Base da API:

```text
http://localhost:3000/api
```

Rotas de autenticacao:

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
```

Usuarios:

```text
GET    /usuarios
GET    /usuarios/:id
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id
```

Categorias:

```text
GET    /categorias
GET    /categorias/:id
POST   /categorias
PUT    /categorias/:id
DELETE /categorias/:id
```

Jogos:

```text
GET    /jogos
GET    /jogos/:id
POST   /jogos
PUT    /jogos/:id
PATCH  /jogos/:id/estoque
DELETE /jogos/:id
```

Emprestimos e reservas:

```text
GET    /emprestimos
GET    /emprestimos/:id
POST   /emprestimos
PUT    /emprestimos/:id
PATCH  /emprestimos/:id/devolver
DELETE /emprestimos/:id
POST   /reservas
GET    /minhas-reservas
```

Dashboard, relatorios e dados:

```text
GET  /dashboard/resumo
GET  /relatorios/jogos/pdf
GET  /relatorios/emprestimos/pdf
GET  /exportacao/:entidade
POST /importacao/:entidade
GET  /logs
GET  /logs/exportar/xml
```

As rotas privadas exigem token JWT no cabecalho:

```text
Authorization: Bearer TOKEN_JWT
```

## Observacoes para entrega

- O arquivo principal do banco esta em `database/banco.sql`.
- A imagem do DER esta em `docs/diagrama_der_progames.png`.
- A documentacao complementar esta em `docs/documentacao.md` e `docs/documentacao.pdf`.
- O arquivo `.env` nao deve ser enviado com senhas reais.
- A pasta `node_modules` nao deve ser enviada ao GitHub.
