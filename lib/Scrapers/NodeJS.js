const snekfetch = require("snekfetch");
const Log = require("../Util/Log");
const SearchUtility = require("../Util/SearchUtilities");

class NodeJSScraper {
  constructor() {
    this.sources = [
      `https://nodejs.org/api/assert.json`,
      `https://nodejs.org/api/buffer.json`,
      `https://nodejs.org/api/addons.json`,
      `https://nodejs.org/api/child_process.json`,
      `https://nodejs.org/api/cluster.json`,
      `https://nodejs.org/api/cli.json`,
      `https://nodejs.org/api/console.json`,
      `https://nodejs.org/api/crypto.json`,
      `https://nodejs.org/api/debugger.json`,
      `https://nodejs.org/api/dns.json`,
      `https://nodejs.org/api/domain.json`,
      `https://nodejs.org/api/errors.json`,
      `https://nodejs.org/api/events.json`,
      `https://nodejs.org/api/fs.json`,
      `https://nodejs.org/api/globals.json`,
      `https://nodejs.org/api/http.json`,
      `https://nodejs.org/api/https.json`,
      `https://nodejs.org/api/modules.json`,
      `https://nodejs.org/api/net.json`,
      `https://nodejs.org/api/os.json`,
      `https://nodejs.org/api/path.json`,
      `https://nodejs.org/api/process.json`,
      `https://nodejs.org/api/punycode.json`,
      `https://nodejs.org/api/querystring.json`,
      `https://nodejs.org/api/readline.json`,
      `https://nodejs.org/api/repl.json`,
      `https://nodejs.org/api/stream.json`,
      `https://nodejs.org/api/string_decoder.json`,
      `https://nodejs.org/api/timers.json`,
      `https://nodejs.org/api/tls.json`,
      `https://nodejs.org/api/tty.json`,
      `https://nodejs.org/api/dgram.json`,
      `https://nodejs.org/api/url.json`,
      `https://nodejs.org/api/util.json`,
      `https://nodejs.org/api/v8.json`,
      `https://nodejs.org/api/vm.json`,
      `https://nodejs.org/api/zlib.json`,
    ];
    this.docs = [];

    this.downloadDocs();
  }

  async downloadDocs() {
    for (let source in this.sources) {
      Log.debug(`NodeJS | Downloading ${this.sources[source]}... ${Number(source) + 1}/${this.sources.length}`);
      let data = await this.downloadSource(this.sources[source]);
      await this.addToCache(data);
    }
    return Promise.resolve(this.sources);
  }

  async downloadSource(source) {
    if (!source) return Promise.reject(`No source provided! (${source})`);
    return snekfetch
    .get(source)
    .then((res) => {
      let body = res.body;
      if (!body) return Promise.reject(`No body found for ${source}`);
      return this.parseSource(body, source);
    }).catch((err) => {
      if (err instanceof SyntaxError) {
        Log.error(`Unable to download ${err.url || source}\n${err.stack}`);
      } else {
        Log.error(err);
      }
    });
  }

  async parseSource(body, url) {
    body.source = url && url.replace(`.json`, ``);
    return Promise.resolve(body);
  }

  async addToCache(data) {
    this.docs.push(data);
    Promise.resolve(this.docs);
  }

  async searchDocs(query) {
    let result;
    for (let doc in this.docs) {
      let obj = SearchUtility.GetSimilarObjects(this.docs[doc], `textRaw`, query, (e) => {
        if (typeof e === "object" && e.textRaw) return !e.textRaw.includes(`{Function}`);
        if (typeof e === "string") return !e.match(/{.+}/g);
        return false;
      })[0];
      if (obj) {
        result = obj;
        result.source = this.docs[doc].source;
        break;
      }
    }
    return Promise.resolve(result);
  }
}

module.exports = new NodeJSScraper();
