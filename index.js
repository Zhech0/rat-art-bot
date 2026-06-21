const { Client } = require('@fluxerjs/core');
const client = new Client();
const TOKEN = process.env.TOKEN
client.login(TOKEN);
