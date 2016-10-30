const Command = require("../Command");
const request = require("request");
// const JavascriptDocs = require("../Scrapers/MDN/Javascript");
const SearchUtility = require("../Util/SearchUtilities");
const Log = require("../Util/Log");
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
      // let doc = JavascriptDocs.docs.filter(e => e.includes(query)).first();
      // console.log(typeof doc);
      // resolve({
      // AbstractText: this.parse(doc, `${query} (JS)`),
      // });
    });
  }
  mdnParse(str, heading) {
    // if (!str) return str;
    let langRegEx = heading.match(/\(([^)]+)\)/g);
    let language = langRegEx && langRegEx[0] ? langRegEx[0].replace(/[()]/g, "") : "";
    return toMarkdown(str, {
      gfm: true,
    }).replace("```", `\`\`\`${language}`);
  }
  node(msg, args) {
    let query = args.join(" ").replace(/\.prototype\./g, ".");
    console.log(`Getting docs...`);
    return this.nodeGetDocs(query)
    .then((data) => msg.channel.sendMessage(data.slice(0, 1999), { split: false }))
    .catch(err => {
      if (err !== "No results found") Log.error(err);
      msg.channel.sendMessage(`:x: ${err === "No results found" ? err : `\`${err}\``}`);
    });
  }
  nodeGetDocs(query) {
    return new Promise((resolve, reject) => {
      let func = query.replace(/.prototype./g, ".").replace(/(^)/g, "");
      request
      .get(`https://nodejs.org/api/all.json`, (err, res) => {
        if (err) return reject(err);
        let body = JSON.parse(res.body);
        console.log(`Docs | Finding docs...`);
        let obj = SearchUtility.GetSimilarObjects(body, `textRaw`, func)[0];
        console.log(`Docs | ${obj ? `Docs Exist` : `No Docs Found`}`);
        if (!obj) return reject(`No results found`);
        resolve(this.nodeParse({
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
        }));
      });
    });
  }
  nodeParse(data) {
    console.log(`Parser | Parsing docs...`);
    console.log(`Parser | Stability of ${data.Stability || 2}`);
    let DocInfo = `${data.Added ? ` - added in ${data.Added}` : ""}${data.Removed ? ` - removed in ${data.Removed}` : ""}${data.Deprecated ? ` - deprecated in ${data.Deprecated}` : ""}`;
    let StabilityText = data.StabilityText;
    let Description = toMarkdown(data.Description).slice(0, 600);
    let StabilityTextRegEx = /\[(\S+)\]\[\]/gi.exec(StabilityText) || [];
    let DescriptionRegEx = /\n\n([\n\r\s\S]+;)/gi.exec(Description) || [];
    let DescriptionRegEx2 = /\[`(\S+)`\]\(\S+\)/gi.exec(Description) || [];
    StabilityTextRegEx.forEach((e, i) => {
      StabilityText = StabilityText.replace(/\[(\S+)\]\[\]/gi, StabilityTextRegEx[i]);
    });
    for (let i = 0; i < DescriptionRegEx.length; i++) {
      if (i % 2) continue;
      Description = Description.replace(/\n\n([\n\r\s\S]+;)/gi, `\n\n\`\`\`js\n${DescriptionRegEx[i].replace(/ {4}/g, ``)}\n\`\`\``);
    }
    for (let i = 0; i < DescriptionRegEx2.length; i++) {
      if (i % 2) continue;
      Description = Description.replace(/\[`(\S+)`\]\(\S+\)/gi, `\`${DescriptionRegEx2[(i / 2) + 1]}\``);
    }
    return [
      `**__\`${data.TextRaw}\`__${DocInfo}**`,
      ``,
      `${Description.replace(/\*\*/g, "")}...\n`,
      data.Params.map(e => `\`${e.name}\` ${e.type ? `(\`${e.type}\`)` : ""} - ${e.optional ? `_OPTIONAL_` : "_REQUIRED_"} ${e.desc || ""}`).join("\n"),
      data.Stability !== undefined && data.Stability < 2 ? `\n**${StabilityText.toUpperCase()}**\n` : ``,
      `**Returns**: \`${data.Return ? data.Return.type : "null"}\`${data.Return ? ` - ${data.Return.desc}` : ""}`,
    ];
  }
}


module.exports = TestCommand;
