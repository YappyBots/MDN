const path = require("path");
const Client = require("./Client");
const Log = require("./Util/Log");
const bot = new Client({
  prefix: "mdn, ",
  disableEveryone: true,
  messageSweepInterval: 300,
  messageCacheLifetime: 600,
  disabledEvents: [
    "typingStart",
    "typingStop",
    "userUpdate",
    "voiceStateUpdate",
    "channelCreate",
    "channelDelete",
    "channelPinsUpdate",
    "channelUpdate",
    "guildBanAdd",
    "guildBanRemove",
    "guildEmojiCreate",
    "guildEmojiDelete",
    "guildEmojiUpdate",
    "guildMemberAdd",
    "guildMemberAvailable",
    "guildMemberRemove",
    "guildMembersChunk",
    "guildMemberSpeaking",
    "guildMemberUpdate",
    "guildUnavailable",
    "guildUpdate",
    "messageDelete",
    "messageDeleteBulk",
    "messageUpdate",
    "presenceUpdate",
    "roleCreate",
    "roleDelete",
    "roleUpdate",
    "userUpdate",
    "voiceStateUpdate",
    "debug",
    "warn",
  ],
});
const TOKEN = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.MDN_DISCORD_TOKEN || "invalid";

bot.on("ready", () => {
  Log.info("=> Bot: Logged In");
  bot.booted = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };
  // MdnJavascriptScraper.request_all();
});
bot.on("error", Log.error);

process.on("unhandledRejection", Log.error);

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
