'use strict';

const Botmaster = require('botmaster');
const SessionStore = Botmaster.storage.MemoryStore;
const express = require('express');
const config = require('config');
const app = express();
const botEngine = require('./botEngine');

// Webserver parameter
const PORT = process.env.PORT || 8445;

// FB Messenger configuration values
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN ? process.env.FB_PAGE_TOKEN : config.get('fbPageToken');
if (!FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN')
}
const FB_APP_SECRET = process.env.FB_APP_SECRET ? process.env.FB_APP_SECRET : config.get('fbAppSecret');
if (!FB_APP_SECRET) {
    throw new Error('missing FB_APP_SECRET')
}
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN ? process.env.FB_VERIFY_TOKEN : config.get('fbVerifyToken');
if (!FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN')
}
const FB_WEB_HOOK = process.env.FB_WEB_HOOK ? process.env.FB_WEB_HOOK : config.get('fbWebhookEndpoint');
if (!FB_WEB_HOOK) {
    throw new Error('missing FB_WEB_HOOK')
}

//Token to integrate with weather api
const WEATHER_API_KEY = process.env.WEATHER_API_KEY ? process.env.WEATHER_API_KEY : config.get('weatherApiKey');
if (!WEATHER_API_KEY) {
    throw new Error('missing WEATHER_API_KEY')
}

// Wit.ai parameters
const WIT_TOKEN = process.env.WIT_TOKEN ? process.env.WIT_TOKEN : config.get('witToken');;

//botmaster settings
const messengerSettings = {
    credentials: {
        verifyToken: FB_VERIFY_TOKEN,
        pageToken: FB_PAGE_TOKEN,
        fbAppSecret: FB_APP_SECRET,
    },
    webhookEndpoint: FB_WEB_HOOK, // botmaster will mount this webhook on  https://92ce93f2.ngrok.io/messenger/webhook1234
};

const botsSettings = [{
    messenger: messengerSettings
}];

const botmasterSettings = {
    botsSettings: botsSettings,
    app: app,
    port: PORT,
    sessionStore: new SessionStore(),
}

const botmaster = new Botmaster(botmasterSettings);

// actual code
botmaster.on('update', (bot, update) => {
    const session = update.session;
    const wit = new botEngine(WIT_TOKEN, bot, update);

    // Let's forward the message to the Wit.ai Bot Engine
    // This will run all actions until our bot has nothing left to do
    wit.runActions(
            session.id, // the user's current session
            update.message.text, // the user's message
            session.context // the user's current session state,
        ).then((context) => {
            // Our bot did everything it has to do.
            // Now it's waiting for further messages to proceed.
            console.log('Waiting for next user messages');

            // Based on the session state, you might want to reset the session.
            // This depends heavily on the business logic of your bot.
            // Example:
            //  if (context['done']) {
            //    delete session;
            //  }

            // Updating the user's current session state
            session.context = context;
        })
        .catch((err) => {
            console.error('Oops! Got an error from Wit: ', err.stack || err);
        })
});

botmaster.on('error', (bot, err) => {
    console.log(err.stack);
    console.log('there was an error');
});

//Express APP settings
app.get('/', (req, res) => {
    res.send('hey! your app is up and running....!!!')
});

app.listen(PORT);
console.log('App is Listening on :' + PORT + '...');
