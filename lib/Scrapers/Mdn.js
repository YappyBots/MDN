const UrlScraper = require("./UrlScraper");
const toMarkdown = require("to-markdown");

class MDN extends UrlScraper {
  constructor(opts) {
    opts.type = "mdn";
    opts.abstract = true;
    super(opts);

    this.html_filters.push(`mdn/html_to_markdown`);
    this.text_filters.push(`mdn/attribution`);

    this.filters[`mdn/attribution`] = (str) => str += [
      `® 2016 Mozilla Contributors`,
      `Licensed under the Creative Commons Attribution-ShareAlike License v2.5 or later.`,
    ].join(`<br/>`);

    this.filters[`mdn/html_to_markdown`] = (str) => toMarkdown(str);
  }
}

module.exports = MDN;
