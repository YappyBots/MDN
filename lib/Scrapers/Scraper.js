const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const Log = require("../Util/Log");
const snekfetch = require("snekfetch");

class Scraper {
  constructor() {
    this.cachePath = path.resolve(__dirname, `../../cache/${this.constructor.name}`);
    this.docs = [];
  }

  async fetch() {
    if (!this.cache) await this.getCache();
    if (this.cache.length === this.sources.length) {
      this.docs = this.cache;
      return;
    } else {
      await this.downloadSources();
      await this.cacheSources();
    }
  }

  getCache() {
    return this.ensureCacheDirExists()
    .then(() => new Promise((resolve, reject) => {
      fs.readdir(this.cachePath, (err, files) => {
        if (err) return reject(err);
        this.cache = [];
        if (!files || !files.length) resolve();
        files.forEach((file, i) => {
          const doc = fs.readFileSync(path.resolve(this.cachePath, file));
          this.cache.push(JSON.parse(doc.toString()));
          if (i === files.length - 1) resolve();
        });
      });
    }));
  }

  ensureCacheDirExists() {
    return new Promise((resolve, reject) => {
      fs.access(this.cachePath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
        if (err && err.code === "ENOENT") {
          mkdirp(this.cachePath, e => {
            if (e) return reject(err);
            resolve();
          });
        } else if (err) {
          return reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async cacheSources() {
    for (let doc of this.docs) {
      await this.cacheSource(doc);
    }
  }

  cacheSource(data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path.resolve(this.cachePath, `${data.source.replace(this.sourceHome, "")}.json`), JSON.stringify(data, null, 2), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async downloadSources() {
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
}

module.exports = Scraper;
