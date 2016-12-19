const request = require("request");
const Discord = require("discord.js");
const Command = require("../Command");
const NodeJS = require("../Scrapers/NodeJS");
const Log = require("../Util/Log");
const toMarkdown = require("to-markdown");

// TODO: Use https://devdocs.io/docs.json for NodeJS and JS docs :)
class LookupCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: "lookup",
      description: "mdn and nodejs help",
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
    if (msg.content.startsWith(`mdn, `)) return this.mdn(msg, args);
    if (msg.content.startsWith(`node, `) || msg.content.startsWith(`nodejs, `)) return this.node(msg, args);
  }
  mdn(msg, args) {
    let query = args.join(" ").replace(/\.prototype\./g, " ").replace(/\./g, " ");
    return this.mdnGetResult(query).then((data) => {
      msg.channel.sendMessage([
        `**${data.Heading}**`,
        `${data.AbstractText.replace("\n\n", "\n")}`,
        ``, ``,
        `${data.AbstractSource} (<${data.AbstractURL}>)`,
      ].join("\n").slice(0, 1999), { split: false });
    }).catch(err => {
      if (err !== "No results found") throw err;
      msg.channel.sendMessage(`:x: ${err}`);
    });
  }
  mdnGetResult(query) {
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
          AbstractText: this.mdnParse(data.AbstractText, data.Heading),
        });
      });
    });
  }
  mdnParse(str, heading) {
    // if (!str) return str;
    let langRegEx = heading.match(/\(([^)]+)\)/g);
    let language = langRegEx && langRegEx[0] ? langRegEx[0].replace(/[()]/g, "") : "";
    return toMarkdown(str, {
      // gfm: true,
    }).replace("```", `\`\`\`${language}`);
  }
  node(msg, args) {
    let query = args.join(" ").replace(/\.prototype\./g, ".");
    if (NodeJS.docs.length !== 37) {
      let sourceCount = NodeJS.sources.length;
      let docCount = NodeJS.docs.length;
      let timeToWait = (sourceCount - docCount) * 0.386;
      return msg.channel.sendMessage(`:x: The documentation hasn't fully loaded yet. Please wait about ${timeToWait.toFixed(2)} seconds and then try again. (${docCount} / ${sourceCount})`);
    }
    return this.nodeGetDocs(query)
    .then((data) => msg.channel.sendEmbed(data, {
      split: {
        maxLength: 1050,
        char: `\n`,
      },
    }))
    .catch(err => {
      if (err !== "No results found") Log.error(err);
      msg.channel.sendMessage(`:x: ${err === "No results found" ? err : `\`${err}\``}`);
    });
  }
  async nodeGetDocs(query) {
    let obj = await NodeJS.searchDocs(query);
    if (!obj) return Promise.reject(`No results found`);
    return Promise.resolve(this.nodeParse({
      TextRaw: obj.textRaw,
      Type: obj.type,
      Name: obj.name,
      Description: obj.desc || "",
      Added: obj.meta && obj.meta.added && obj.meta.added[0],
      Removed: obj.meta && obj.meta.removed && obj.meta.removed[0],
      Deprecated: obj.meta && obj.meta.deprecated && obj.meta.deprecated[0],
      Return: obj.signatures ? obj.signatures[0].return : null,
      Params: obj.signatures ? obj.signatures[0].params : [],
      Stability: obj.stability,
      StabilityText: obj.stabilityText || "",
      Source: obj.source,
    }));
  }
  nodeParse(data) {
    let DocInfo = `${data.Added ? ` - added in ${data.Added}` : ""}${data.Removed ? ` - removed in ${data.Removed}` : ""}${data.Deprecated ? ` - deprecated in ${data.Deprecated}` : ""}`;
    let StabilityText = data.StabilityText;
    let Description = toMarkdown(data.Description, {
      converters: [{
        filter: "pre",
        replacement: content => `\`\`\`js\n${content.replace(/<\/?code( \S+)?>/g, ``)}\n\`\`\``,
      }],
    });
    // let StabilityTextRegEx = /\[(\S+)\]\[\]/gi.exec(StabilityText) || []; // eslint-disable-line no-useless-escape
    let InternalLinkRegEx = /\[(.+)\]\(#(.+)\)/g; // eslint-disable-line no-useless-escape
    let RelativeLinkRegEx = /\[(.+)\]\(([^http].+).html#(\S+)\)/g; // eslint-disable-line no-useless-escape
    let Link = this.nodeGenerateLink(data.Source, data.TextRaw);
    // StabilityTextRegEx.forEach((e, i) => {
      // StabilityText = StabilityText.replace(/\[(\S+)\]\[\]/gi, StabilityTextRegEx[i]); // eslint-disable-line no-useless-escape
    // });
    Description = Description
    .replace(InternalLinkRegEx, `[$1](${data.Source}.html#$2)`)
    .replace(RelativeLinkRegEx, `[$1](https://nodejs.org/api/$2.html#$3)`);

    let Fields = data.Params.map(e => {
      let { name, type, optional, desc } = e;
      return {
        name: `\`${name}\` ${type ? `(\`${type}\`)` : ""}`,
        value: `${optional ? `` : "**REQUIRED** "}${desc || "\u200B"}`,
      };
    });
    let Stability = data.Stability !== undefined && data.Stability < 2 ? `\n**${StabilityText.toUpperCase()}**\n` : ``;

    return new Discord.RichEmbed({ fields: Fields })
    .setTitle(`**__\`${data.TextRaw}\`__${DocInfo}**`)
    .setDescription(`${Stability}${Description.slice(0, 2042)}\u200B`)
    .setURL(data.Link || Link)
    .setAuthor(`NodeJS API`, "http://supundharmarathne.files.wordpress.com/2013/08/nodejs.png", "https://nodejs.org/api");
  }
  nodeGenerateLink(Source, TextRaw) {
    let Class = Source.slice(23, 99).toLowerCase();
    let Property = TextRaw
    .replace(/([^a-z])/gi, "_")
    .replace(/__/g, "_")
    .replace(/__/g, "_")
    .replace(/__/g, "_")
    .replace(/__/g, "_")
    .toLowerCase();
    if (Property.lastIndexOf(`_`) === Property.length - 1) Property = Property.slice(0, Property.length - 1);
    if (Property.indexOf(`_`) === 0) Property = Property.slice(1, Property.length);
    let Link = `${Source}.html#${Class}_${Property}`;
    return Link;
  }
}


module.exports = LookupCommand;
