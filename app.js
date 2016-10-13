'use strict';

const Botmaster = require('botmaster');
const SessionStore = Botmaster.storage.MemoryStore;
const express = require('express');
const config = require('config');
const CustomMessangerBot = require('./messenger/custom-bot');
const app = express();

// Webserver parameter
const PORT = process.env.PORT || 8445;

// FB Messenger configuration values
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN ? process.env.FB_PAGE_TOKEN : config.get('fbPageToken');
if (!FB_PAGE_TOKEN) { throw new Error('missing FB_PAGE_TOKEN') }
const FB_APP_SECRET = process.env.FB_APP_SECRET ? process.env.FB_APP_SECRET : config.get('fbAppSecret');
if (!FB_APP_SECRET) { throw new Error('missing FB_APP_SECRET') }
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN ? process.env.FB_VERIFY_TOKEN : config.get('fbVerifyToken');
if (!FB_VERIFY_TOKEN) { throw new Error('missing FB_VERIFY_TOKEN') }
const FB_WEB_HOOK = process.env.FB_WEB_HOOK ? process.env.FB_WEB_HOOK : config.get('fbWebhookEndpoint');
if (!FB_WEB_HOOK) { throw new Error('missing FB_WEB_HOOK') }

//botmaster settings
const messengerSettings = {
  credentials: {
    verifyToken: FB_VERIFY_TOKEN,
    pageToken: FB_PAGE_TOKEN,
    fbAppSecret: FB_APP_SECRET,
  },
  webhookEndpoint: FB_WEB_HOOK, // botmaster will mount this webhook on  https://92ce93f2.ngrok.io/messenger/webhook1234
};

const botsSettings = [];

const botmasterSettings = {
  botsSettings: botsSettings,
  app: app,
  port: PORT,
  sessionStore: new SessionStore(),
}

const botmaster = new Botmaster(botmasterSettings);

const messangerBot = new CustomMessangerBot(messengerSettings);
botmaster.addBot(messangerBot);

// actual code
botmaster.on('update', (bot, update) => {
    if(typeof update!== 'undefined' && typeof update.recipient !== 'undefined'){
      bot.sendMessage(update);
  }
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
  console.log('there was an error');
});

//Express APP settings
app.get('/',(req, res)=>{
  res.send('hey! your app is up and running....!!!')
});

app.listen(PORT);
console.log('App is Listening on :' + PORT + '...');
