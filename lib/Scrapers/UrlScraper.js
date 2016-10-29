const request = require("request");
const Scraper = require("./Scraper");

class UrlScraper extends Scraper {
  constructor(opts) {
    super(opts);
    this.params = {};
    this.headers = {
      "User-Agent": `DevDocs`,
    };
  }

  async request_one(url) {
    return new Promise((resolve, reject) => {
      if (!url) return reject();
      request.get(url, this.request_options, (err, res, data) => {
        return this.process_response({
          error: err,
          code: res && res.statusCode,
          url,
          success: !err,
          html: res && res.body
        }).then(resolve).catch(reject);
      });
    });
  }

  async request_all() {
    let scraper = this;
    scraper.stubs.forEach(a => {
      console.log(`Scrapping ${a.path}...`);
      scraper.request_one(a.path);
    });
    return this.docs;
  }

  get request_options() {
    return {
      params: this.params,
      headers: this.headers
    };
  }

  process_response(response) {
    let scraper = this;
    return new Promise((resolve, reject) => {
      if (!response || response.error) {
        return reject(response && response.code ? `Error status code (${response.code}): ${response.url}` : response.error);
      }

      let res = response.html;

      this.process_internal_links(response.html);

      Promise.resolve(Object.keys(this.filters).forEach(e => {
        res = this.filters[e](res);
      })).then(() => {
        scraper.docs.set(response.url, res);
        console.log(`Scrapped ${response.url} (${res.slice(0, 8)}`);
      }).catch(console.error);

    });

  }

  process_internal_links(html) {
    let RegEx = new RegExp(`(${this.base_url.replace(/\//g, `\\\/`)})+([\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\+#])`, 'g');
    let links = html.match(RegEx);
    if (!links) return;
    links.forEach(link => {
      if (!this.docs.has(link)) this.request_one(link);
    });
  }
}

module.exports = UrlScraper;
