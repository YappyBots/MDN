const Command = require("../Command");
const Log = require("../Util/Log");
const fs = require("fs");
const path = require("path");

class ReloadCommand extends Command {
  constructor(bot) {
    super(bot);
    this.setHelp({
      name: "reload",
      description: "reloads a command, duh",
      usage: "reload <command>",
      examples: [
        "reload stats",
        "reload test",
      ],
    });
    this.setConf({
      permLevel: 2,
      aliases: ["r"],
    });
  }
  run(msg, args) {
    let argName = args[0] ? args[0].toLowerCase() : null;
    let bot = this.bot;
    let command = bot.commands.get(argName);
    if (!command && bot.aliases.has(argName)) {
      command = bot.commands.get(bot.aliases.get(argName));
    } else if (!argName) {
      return msg.channel.sendMessage(`No command name was provided to reload`);
    } else if (!command) {
      msg.channel.sendMessage(`Command \`${argName}\` doesn't exist, checking file...`);
    }
    let fileName = command ? command.help.file : args[0];
    let filePath = path.resolve(__dirname, fileName);
    let cmdName = command ? command.help.name : args[0];
    let fileText = command ? `Command` : `File`;
    fs.stat(filePath, (err, stats) => {
      if (err) return msg.channel.sendMessage(`I cannot find the file ${fileName}`);
      if (!stats.isFile()) return msg.channel.sendMessage(`Command \`${cmdName}\` is not a file`);
      msg.channel.sendMessage(`Reloading ${fileText} \`${cmdName}\`...`).then(m => {
        if (!command) {
          return bot.reloadFile(filePath).then(() => {
            m.edit(`Successfully Reloaded File \`${cmdName}\``);
          }).catch(e => this.sendError(cmdName, m, e));
        }
        bot.reloadCommand(fileName).then(() => {
          m.edit(`Successfully Reloaded Command \`${cmdName}\``);
        }).catch(e => this.sendError(cmdName, m, e));
      }).catch(e => {
        Log.error(e);
        msg.channel.sendMessage(`Unable To Reload Command \`${cmdName}\``);
      });
    });
  }

  sendError(t, m, e) {
    m.edit([
      `Unable To Reload File \`${t}\``,
      "```js",
      e.stack,
      "```",
    ]);
  }
}


module.exports = ReloadCommand;
