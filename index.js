const { Client } = require('@fluxerjs/core');
const client = new Client();
const TOKEN = process.env
client.login(TOKEN);
