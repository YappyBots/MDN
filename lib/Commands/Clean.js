const Command = require("../Command");

class CleanCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: "clean",
      description: "clean the messages of the bot found in the number provided",
      usage: "clean [number=10]",
      examples: [
        "clean",
        "clean 14",
      ],
    };
  }

  run(msg, args) {
    let messagesToClean = args[0] && !isNaN(args[0]) ? Number(args[0]) : 10;

    msg.channel.fetchMessages({
      limit: messagesToClean,
    }).then(messages => {
      messages.filter(e => e.author.equals(this.bot.user)).forEach(message => message.delete());
    });
  }
}


module.exports = CleanCommand;
