const express = require('express');
const { Client, Events } = require('@fluxerjs/core');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// --- Express health check ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🐀 Rat Art Bot is alive!'));
app.listen(port, () => console.log(`Health server on port ${port}`));

// --- MongoDB setup ---
const mongoUri = process.env.MONGO_URI;
const dbName = 'ratartbot';
let db;

async function connectDB() {
 const client = new MongoClient(mongoUri);
 await client.connect();
 db = client.db(dbName);
 console.log('Connected to MongoDB');
}

// --- Fluxer bot setup ---
const client = new Client({
 prefix: '!',
 commandsDir: path.join(__dirname, 'commands'),
 intents: ['Guilds', 'GuildMessages', 'MessageContent']
});

client.on(Events.Ready, () => {
 console.log(`Logged in as ${client.user?.username || 'Rat Art Bot'}`);
});

client.login(process.env.FLUXER_BOT_TOKEN);

// --- Channel IDs from environment variables ---
const submissionsChannelId = process.env.SUBMISSIONS_CHANNEL_ID;
const galleryChannelId = process.env.GALLERY_CHANNEL_ID;
const artOfMonthChannelId = process.env.ART_OF_MONTH_CHANNEL_ID;

// --- Ensure art folder exists ---
const artFolder = path.join(__dirname, 'art');
if (!fs.existsSync(artFolder)) {
 fs.mkdirSync(artFolder, { recursive: true });
}

// ---!submit command ---
client.on(Events.MessageCreate, async (message) => {
 // Only respond in the Submissions channel
 if (message.channel.id!== submissionsChannelId) return;

 if (!message.content.startsWith('!submit')) return;

 // Check for attachment
const attachment = message.attachments.first();
if (!attachment) {
 await message.reply('❌ Please attach an image when using `!submit`.');
 return;
}

const ext = path.extname(attachment.name) || '.png';
const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

if (!allowedExts.includes(ext.toLowerCase())) {
 await message.reply('❌ Please attach a valid image file (png, jpg, gif, webp).');
 return;
}
console.log(`Attempting download: ${attachment.url}, ext: ${ext}`);

 // ---!submit command ---
client.on(Events.MessageCreate, async (message) => {
 // Only respond in the Submissions channel
 if (message.channel.id!== submissionsChannelId) return;

 if (!message.content.startsWith('!submit')) return;

 // Check for attachment
 const attachment = message.attachments.first();
 if (!attachment) {
 await message.reply('❌ Please attach an image when using `!submit`.');
 return;
 }

 // Debug log
 console.log('Attachment found:', {
 name: attachment.name,
 url: attachment.url,
 contentType: attachment.contentType,
 size: attachment.size
 });

 const ext = path.extname(attachment.name) || '.png';
 const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

 if (!allowedExts.includes(ext.toLowerCase())) {
 await message.reply('❌ Please attach a valid image file (png, jpg, gif, webp).');
 return;
 }

 try {
 console.log(`Attempting download: ${attachment.url}`);
 const response = await fetch(attachment.url);

 if (!response.ok) {
 throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 }

 const buffer = Buffer.from(await response.arrayBuffer());
 console.log(`Downloaded ${buffer.length} bytes`);

 // Store in MongoDB as binary
 const submissions = db.collection('submissions');
 await submissions.insertOne({
 fileName: `${Date.now()}_${attachment.name}`,
 imageData: buffer,
 submittedBy: message.author.id,
 submittedAt: new Date(),
 month: new Date().getMonth(),
 year: new Date().getFullYear()
 });

 await message.reply(`✅ Your submission has been saved! It will be posted in **The Gallery** at the end of the month.`);
 console.log(`Saved submission from user ${message.author.id}`);
 } catch (err) {
 console.error('Failed to save submission:', err);
 console.error('Error name:', err.name);
 console.error('Error message:', err.message);
 await message.reply('❌ Something went wrong saving your image. Try again later.');
 }
});

// --- Monthly art post: 1st of every month at noon ---
cron.schedule('0 12 1 * *', async () => {
 try {
 const files = fs.readdirSync(artFolder).filter(f =>
 /\.(png|jpg|jpeg|gif|webp)$/i.test(f)
 );

 if (files.length === 0) {
 console.log('No art files found in./art/');
 return;
 }

 const randomFile = files[Math.floor(Math.random() * files.length)];
 const filePath = path.join(artFolder, randomFile);
 const fileBuffer = fs.readFileSync(filePath);

 const channel = client.channels.cache.get(artOfMonthChannelId);
 if (channel) {
  await channel.send({
  content: '🐀 **Art of the Month!** Create your own version and submit in the submissions channel using the !submit command. At the end of the month, all submissions will be posted in The Gallery!',
  files: { name: randomFile, data: fileBuffer }
 });
 }
  
 console.log(`Posted ${randomFile} to Art of the Month channel`);
 } catch (err) {
 console.error('Failed to post monthly art:', err);
 }
});

// --- End-of-month gallery dump: last day at 6 PM ---
cron.schedule('0 18 28-31 * *', async () => {
 const now = new Date();
 const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

 if (now.getDate()!== lastDay) return;

 try {
 const submissions = db.collection('submissions');
 const cursor = submissions.find({
 month: now.getMonth(),
 year: now.getFullYear()
 });

 let count = 0;
 await cursor.forEach(async (doc}) => {
 await client.channels.cache.get(galleryChannelId).send, {
 content: '🐀 **Monthly Gallery Submission!**',
 files: { name: randomFile, data: fileBuffer }
 });
 await submissions.deleteOne({ _id: doc._id });
 count++;
 });

 console.log(`Posted ${count} submissions to The Gallery.`);
 } catch (err) {
 console.error('Failed to post gallery:', err);
 }
});

// --- Start ---
connectDB().catch(console.error);
