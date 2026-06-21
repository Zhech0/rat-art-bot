const http = require('http');
http.createServer((req, res) => res.end('Bot alive')).listen(process.env.PORT || 3000);

const { Client } = require('@fluxerjs/core');
const client = new Client();
const TOKEN = process.env.TOKEN
client.login(TOKEN);

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

cron.schedule('0 12 1 * *', async () => {
 // picks a random file from./art/ and posts it
});
