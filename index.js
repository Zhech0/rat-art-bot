const { Client } = require('@fluxerjs/core');
const client = new Client();
const TOKEN = process.env
console.log('Token length:', TOKEN? TOKEN.length: 'undefined');
console.log('Token starts with:', TOKEN? TOKEN.substring(0, 5): 'undefined');
client.login(TOKEN);
