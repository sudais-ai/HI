const connect = require('./connection');
const { log } = require('console');

// Import jarvis-md compatibility layer
const jarvisMd = require('jarvis-md');

// ✅ Bot class banana zaroori hai taake use constructor ke through run kiya jaa sake
class LegendaryBot {
  async startServer() {
    log("🟢 Server started.");
  }

  async WriteSession() {
    log("📝 Session written.");
  }

  async WaConnect() {
    await connect();
    log("🤖 WhatsApp connected.");
  }
}

// ✅ Agar database config chahiye ho to yeh export kar sakte ho
const config = {
  DATABASE: {
    sync: async () => {
      log("🔗 Database sync simulated.");
    }
  }
};

// ✅ Yehi export karo taake main `index.js` mein use ho sake
module.exports = {
  client: LegendaryBot,
  config,
  // Export all jarvis-md functions so plugins can access them
  ...jarvisMd,
  System: jarvisMd.System,
  IronMan: jarvisMd.IronMan,
  getJson: jarvisMd.getJson,
  getBuffer: jarvisMd.getBuffer,
  isPrivate: jarvisMd.isPrivate,
  isUrl: jarvisMd.isUrl,
  sleep: jarvisMd.sleep,
  isOwner: jarvisMd.isOwner,
  processMessage: jarvisMd.processMessage,
  getCommands: jarvisMd.getCommands
};
