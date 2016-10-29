const path = require("path");
const Client = require("./Client");
const Log = require("./Util/Log");
const bot = new Client({
  prefix: "m!",
});
const TOKEN = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.MDN_DISCORD_TOKEN || "invalid";

bot.on("ready", () => {
  Log.info("=> Bot: Logged In");
  bot.booted = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };
});
bot.on("error", Log.error);

bot.on("message", (msg) => {
  bot.runCommand(msg);
});

bot.loadCommands(path.resolve(__dirname, "Commands"));

// === LOGIN ===

Log.info(`=> Bot: Logging in... Token ${TOKEN !== "invalid" ? `exists` : `doesn't exist`}`);

bot.login(TOKEN).catch((err) => {
  Log.error("=> Bot: Unable to log in");
  Log.error(err);
});

module.exports = bot;
