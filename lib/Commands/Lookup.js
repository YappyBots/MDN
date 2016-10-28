const Log = require("../Util/Log");
const Command = require("../Command");
const request = require("request");
const toMarkdown = require("to-markdown");

class TestCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: "lookup",
      description: "mdn help",
      usage: "lookup <Class>[.Method/Property] [language]",
      examples: [
        "lookup Array slice",
        "lookup parseInt java",
      ],
    };
    this.setConf({
      aliases: [""],
    });
  }
  run(msg, args) {
    return this.getResult(args).then((data) => {
      msg.channel.sendMessage([
        `**${data.Heading}**`,
        `${data.AbstractText.replace("\n\n", "\n")}`,
        ``, ``,
        `${data.AbstractSource} (<${data.AbstractURL}>)`,
      ]);
    }).catch(err => {
      if (err !== "No results found") throw err;
      msg.channel.sendMessage(`:x: ${err}`);
    });
  }
  getResult(query) {
    return new Promise((resolve, reject) => {
      if (Array.isArray(query)) query = query.join("+");
      let url = `https://api.duckduckgo.com/?q=mdn+${encodeURI(query)}&format=json`;
      request.get(url, (err, res) => {
        if (err) return reject(err);
        let data = JSON.parse(res.body);
        if (!data.Heading) return reject(`No results found`);
        resolve({
          Heading: data.Heading,
          AbstractURL: data.AbstractURL,
          AbstractSource: data.AbstractSource,
          AbstractText: this.parse(data.AbstractText, data.Heading),
        });
      });
    });
  }
  parse(str, heading) {
    let langRegEx = heading.match(/\(([^)]+)\)/g);
    let language = langRegEx && langRegEx[0] ? langRegEx[0].replace(/[\(\)]/g, "") : "";
    return toMarkdown(str, {
      gfm: true,
    }).replace("```", `\`\`\`${language}`);
  }
}


module.exports = TestCommand;
