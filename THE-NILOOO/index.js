const { client, config } = require("./lib");
const express = require("express");
const app = express();

const startBot = async () => {
  try {
    console.log("🚀 Launching THE-LEGENDARY-N1L-BOT...");

    // Sync database if Sequelize instance
    if (config && config.DATABASE && typeof config.DATABASE.sync === "function") {
      await config.DATABASE.sync();
      console.log("📦 Database synced successfully!");
    } else {
      console.warn("⚠ No DATABASE sync found — skipping DB connection.");
    }

    // Start bot
    const ClientInstance = new client();
    if (ClientInstance.startServer) await ClientInstance.startServer();
    if (ClientInstance.WriteSession) await ClientInstance.WriteSession();
    if (ClientInstance.WaConnect) await ClientInstance.WaConnect();

    console.log("✅ Bot started successfully!");

    // ✅ Keep Heroku alive with Express
    app.get("/", (_, res) => res.send("🟢 Legendary N1L Bot is Alive!"));
    app.listen(process.env.PORT || 3000, () => console.log("🌐 Server Running..."));

  } catch (error) {
    console.error("❌ Bot Startup Error:", error.message || error);
  }
};

startBot();
