const Command = require("../Command");
const util = require("util");
const Log = require("../Util/Log");

class EvalCommand extends Command {

  constructor(bot) {
    super(bot);

    this.tokenRegEx = new RegExp(this.bot.token, "g");

    this.props.help = {
      name: "eval",
      description: "Eval code, admin only",
      usage: "eval <code>",
    };

    this.setConf({
      permLevel: 2,
    });
  }

  run(msg, args) {
    let command = args.join(" ");
    let bot = this.bot;

    this._evalCommand(bot, msg, command).then(evaled => {
      if (evaled && typeof evaled === "string") {
        evaled = evaled.replace(this.tokenRegEx, "-- snip --");
      }

      let message = [
        "`EVAL`",
        "```xl",
        this._clean(command),
        "- - - - - - evaluates-to- - - - - - -",
        evaled !== undefined ? this._clean(evaled) : "undefined",
        "- - - - - - - of type - - - - - - - -",
        typeof evaled,
        "```",
      ].join("\n");

      msg.channel.sendMessage(message).catch(err => {
        Log.error(err);
      });
    }).catch(error => {
      let message = [
        "`EVAL`",
        "```xl",
        this._clean(command),
        "- - - - - - - errors-in- - - - - - -",
        this._clean(error) || error,
        "```",
      ].join("\n");
      msg.channel.sendMessage(message);
    });
  }
  _evalCommand(bot, msg, command) {
    return new Promise((resolve, reject) => {
      let code = command;
      try {
        var evaled = eval(code);
        if (evaled) {
          if (typeof evaled === "object") {
            try {
              evaled = util.inspect(evaled);
            } catch (err) {
              evaled = JSON.stringify(evaled, null, 2);
            }
          }
          if (typeof evaled === "string" && evaled.length >= 2000) {
            evaled = evaled.substr(evaled.length - 1000, evaled.length);
          }
        }
        resolve(evaled);
      } catch (error) {
        reject(error);
      }
    });
  }

  _clean(text) {
    if (typeof text === "string") {
      return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`).replace("``", `\`${String.fromCharCode(8203)}\`}`);
    } else {
      return text;
    }
  }

}

module.exports = EvalCommand;
