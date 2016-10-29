const Command = require("../Command");

class RebootCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: "reboot",
      description: "rebaat the baat (reboot the boot)",
      usage: "reboot",
    };

    this.setConf({
      permLevel: 2,
    });
  }

  run(msg) {
    return msg.channel.sendMessage([
      `**REBOOT**`,
      ``,
      `Rebooting...`,
    ]).then(() => {
      process.exit();
    });
  }
}


module.exports = RebootCommand;
