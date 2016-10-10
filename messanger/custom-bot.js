const Botmaster = require('botmaster');
const MessengerBot = Botmaster.botTypes.MessengerBot;
const messageTmpl = require('./template')

class CustomMessengerBot extends MessengerBot {

  constructor(settings) {
    super(settings);
  }

  __emitUpdatesFromEntries(entries) {

      //console.log('child got meessage entries entries are----', entries)
      for (const entry of entries) {

        const updates = entry.messaging;
        entry.messaging = null;

        for (const update of updates) {
          this.__setBotIdIfNotSet(update);

          messageTmpl.__formatUpdate(update)

          .then((update) => {
            this.__emitUpdate(update);
          }, (err) => {
            err.message = `Error in __formatUpdate "${err.message}". Please report this.`;
            this.emit('error', err);
          });
        }
      }
  }
}

module.exports = CustomMessengerBot;
