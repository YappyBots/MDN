const { exec } = require("child_process");
const Command = require("../Command");
const Log = require("../Util/Log");

class ExecCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: "exec",
      description: "Exec command, admin only",
      usage: "exec <command>",
    };
    this.setConf({
      permLevel: 2,
    });
  }
  run(msg, args) {
    let command = args.join(" ");

    let runningMessage = [
      "`RUNNING`",
      "```xl",
      this._clean(command),
      "```",
    ];

    let messageToEdit;

    msg.channel.sendMessage(runningMessage).then(message => {
      messageToEdit = message;
    }).then(() => this._exec(command))
    .then(stdout => {
      stdout = stdout.substring(0, stdout.length - 1);

      let message = [
        "`EXEC`",
        "```xl",
        this._clean(command),
        "```",
        "`STDOUT`",
        "```xl",
        this._clean(stdout),
        "```",
      ].join("\n");

      messageToEdit.edit(message);
    })
    .catch(stderr => {
      if (stderr && stderr.stack) {
        Log.error(stderr);
      }

      stderr = stderr.substring(0, stderr.length - 1);

      let message = [
        "`EXEC`",
        "```xl",
        this._clean(command),
        "```",
        "`STDERR`",
        "```xl",
        this._clean(stderr),
        "```",
      ].join("\n");

      messageToEdit.edit(message);
    });
  }
  _exec(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    });
  }
  _clean(text) {
    if (typeof text === "string") {
      return text.replace("``", `\`${String.fromCharCode(8203)}\``);
    } else {
      return text;
    }
  }
}

module.exports = ExecCommand;
