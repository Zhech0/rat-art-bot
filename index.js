const { Client } = require('@fluxerjs/core');

const client = new Client({
 intents: ['Guilds', 'GuildMessages', 'MessageContent', 'GuildMembers']
});

const TOKEN = process.env.TOKEN
