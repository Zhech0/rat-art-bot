const Fluxer = require('fluxer');

const { Client } = require('fluxer@0.2.4');

const client = new Client({
 intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers']
});

const TOKEN = process.env.TOKEN
