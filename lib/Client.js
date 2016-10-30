const Discord = require("discord.js");
const DiscordClient = Discord.Client;
const fs = require("fs");
const Log = require("./Util/Log");

class Client extends DiscordClient {

  constructor(opts) {
    super(opts);

    this.prefix = opts.prefix;
    this.commands = new Discord.Collection();
    this.aliases = new Discord.Collection();

    this.config = {
      owners: [
        "175008284263186437",
      ],
    };
  }

  login(...args) {
    return super.login(...args);
  }

  loadCommands(cwd) {
    fs.readdir(cwd, (err, files) => {
      if (err) {
        this.emit("error", err);
        return this;
      }

      files.forEach(f => {
        let Command = require(`./Commands/${f}`);

        try {
          Command = new Command(this);
          Log.debug(`Loading Command: ${Command.help.name}. 👌`);
          Command.props.help.file = f;

          this.commands.set(Command.help.name, Command);

          Command.conf.aliases.forEach(alias => {
            this.aliases.set(alias, Command.help.name);
          });
        } catch (error) {
          this.emit("error", error);
        }
      });
      return this;
    });
  }

  reloadCommand(command) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(`./Commands/${command}`)];
        let cmd = require(`./Commands/${command}`);
        let Command = new cmd(this);
        Command.props.help.file = command;
        this.commands.set(Command.help.name, Command);
        Command.conf.aliases.forEach(alias => {
          this.aliases.set(alias, Command.help.name);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  reloadFile(file) {
    return new Promise((resolve, reject) => {
      try {
        delete require.cache[require.resolve(file)];
        let thing = require(file);
        resolve(thing);
      } catch (e) {
        reject(e);
      }
    });
  }

  runCommand(msg) {
    if (!this.prefix.includes(msg.content.split(" ")[0].toLowerCase())) return false;

    let content = msg.content;
    this.prefix.forEach(prefix => {
      content = content.replace(`${prefix} `, "").replace(prefix, "");
    });
    let command = content.split(" ")[0].toLowerCase();
    let args = content.split(" ").slice(1);
    let perms = this.permissions(msg);

    let cmd;

    if (this.commands.has(command)) {
      cmd = this.commands.get(command);
    } else if (this.aliases.has(command)) {
      cmd = this.commands.get(this.aliases.get(command));
    }

    if (!cmd) {
      cmd = this.commands.get("lookup");
      args = content.split(" ");
    }

    if (cmd) {
      if (perms < cmd.conf.permLevel) return false;

      try {
        let commandRun = cmd.run(msg, args);
        if (commandRun && commandRun.catch) {
          commandRun.catch(e => this.emit("error", e));
        }
      } catch (e) {
        msg.channel.sendMessage(`:x: An error occurred! You should not see this. \`${e.message || e}\``);
        this.emit("error", e);
      }
    }

    return this;
  }

  permissions(msg) {
    /* This function should resolve to an ELEVATION level which
    is then sent to the command handler for verification*/
    let permlvl = 0;

    if (msg.member && msg.member.hasPermission(`ADMINISTRATOR`)) permlvl = 1;
    if (this.config.owners.includes(msg.author.id)) permlvl = 2;

    return permlvl;
  }

  generateArgs(strOrArgs = "") {
    let str = Array.isArray(strOrArgs) ? strOrArgs.join(" ") : strOrArgs;
    let y = str.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
    if (y === null) return str.split(" ");
    return y.map(e => e.replace(/"/g, ``));
  }
}

module.exports = Client;
