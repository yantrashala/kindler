'use strict';

const {Wit} = require('node-wit');
const config = require('config');

const WIT_TOKEN = process.env.WIT_TOKEN ? process.env.WIT_TOKEN : config.get('witToken');
const WEATHER_API_KEY = process.env.WEATHER_API_KEY ? process.env.WEATHER_API_KEY : config.get('weatherApiKey');

// Our bot actions
const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('in send function update-----', response, context)
    const recipientId = this.update.session.id;
    if(recipientId) {
      this.bot.sendMessage({
        recipient: {
          id: this.update.sender.id,
        },
        message: {
          text: 'Well right back at you! '+JSON.stringify(response)
        },
      });
      return Promise.resolve();

    }
    else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  getForecast({context, entities}) {
    return new Promise(function(resolve, reject) {
      var location = firstEntityValue(entities, 'location')
      if (location) {
         getWeather(location, WEATHER_API_KEY)
        .then((text) => {
          console.log('text in getForecast()--->',text)
          context.forecast = text;
          delete context.missingLocation;
        })
        .catch((err) => {
          console.error(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err.stack || err
          );
        });
      //  context.forecast = text; // we should call a weather API here
      //  delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.forecast;
      }
      return resolve(context);
    });
  },
  getProductType({context, entities}) {

    return new Promise(function(resolve, reject) {
      var Product = firstEntityValue(entities, 'product')
      console.log('console says: I want to buy a ', Product);
      if (Product) {
        context.product = Product;
        delete context.missingProduct;
      } else {
        context.missingProduct = true;
        delete context.product;
      }
      return resolve(context);
    });
  },
  getProductSize({context, entities}) {
    return new Promise(function(resolve, reject) {
      var size = firstEntityValue(entities, 'productSize');
      console.log('console says: I want size ', size);
      context.productSize = size;
      return resolve(context);
    });
  },
  getProductColor({context, entities}) {
    return new Promise(function(resolve, reject) {
      var color = firstEntityValue(entities, 'productColor');
      console.log('console says: I want color ', color);
      context.productColor = color;
      return resolve(context);
    });
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};


const getWeather = (location, apiKey) => {
  return fetch('http://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=' + apiKey, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    var message = 'Location: ' + location + '\n' +
  		'Country: ' + json.sys.country + '\n' +
  		'Current Temp: ' + json.main.temp + '\n' +
  		'Temp (high): ' + json.main.temp_max + '\n' +
  		'Temp (low): ' + json.main.temp_min + '\n' +
  		'Humidity: ' + json.main.humidity + '\n';
    //  console.log('response before sending----', message)
    return Promise.resolve(message);
  });
};

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};


function WitEngine(accessToken, bot, update) {
  actions.update = update
  actions.bot = bot
  return new Wit(
  {
    accessToken: WIT_TOKEN,
    actions
  });
}

module.exports = WitEngine;
