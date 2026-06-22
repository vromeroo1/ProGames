const { MongoClient } = require('mongodb');
const env = require('./env');

let client;
let database;

async function conectarMongo() {
  if (database) {
    return database;
  }

  client = new MongoClient(env.mongo.uri, { serverSelectionTimeoutMS: 1500 });
  await client.connect();
  database = client.db(env.mongo.database);
  return database;
}

async function obterColecao(nome) {
  const db = await conectarMongo();
  return db.collection(nome);
}

async function fecharMongo() {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

module.exports = {
  conectarMongo,
  obterColecao,
  fecharMongo
};
