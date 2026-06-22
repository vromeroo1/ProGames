const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`Servidor da ProGames rodando em http://localhost:${env.port}`);
});
