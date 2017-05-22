const path = require("path");
const Client = require("./Client");
const Log = require("./Util/Log");
const bot = new Client({
  prefix: ["mdn,", "node,", "nodejs,"],
  disableEveryone: true,
  messageSweepInterval: 300,
  messageCacheLifetime: 600,
  disabledEvents: [
    "CHANNEL_CREATE",
    "CHANNEL_UPDATE",
    "CHANNEL_REMOVE",
    "GUILD_ADD",
    "GUILD_REMOVE",
    "GUILD_UPDATE",
    "GUILD_BAN_ADD",
    "GUILD_BAN_REMOVE",
    "GUILD_EMOJIS_UPDATE",
    "GUILD_MEMBER_ADD",
    "GUILD_MEMBER_REMOVE",
    "GUILD_MEMBER_UPDATE",
    "GUILD_MEMBERS_CHUNK",
    "GUILD_ROLE_CREATE",
    "GUILD_ROLE_UPDATE",
    "GUILD_ROLE_DELETE",
    "MESSAGE_UPDATE",
    "MESSAGE_DELETE",
    "MESSAGE_DELETE_BULK",
    "PRESENCE_UPDATE",
    "TYPING_START",
    "USER_SETTINGS_UPDATE",
    "USER_UPDATE",
    "VOICE_STATE_UPDATE",
    "VOICE_SERVER_UPDATE",
  ],
});
const TOKEN = process.env.DISCORD_TESTING_BOT_TOKEN || process.env.MDN_DISCORD_TOKEN || "invalid";

bot.booted = {
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
};

bot.on("ready", () => {
  Log.info(`=> Bot: Logged in as ${bot.user.username}#${bot.user.discriminator} (${bot.user.id})`);
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
