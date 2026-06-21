const { Client } = require('@fluxerjs/core');
const client = new Client();
const TOKEN=1518038615047806976.XbHyyRzyhjlzbiu7X6iKPo_Dm4lIKRI2Z0QFxIFa2SM.env
console.log('Token length:', TOKEN? TOKEN.length: 'undefined');
console.log('Token starts with:', TOKEN? TOKEN.substring(0, 5): 'undefined');
console.log('Available env vars:', Object.keys(process.env));
client.login(TOKEN);
