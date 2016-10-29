const Doc = require("./Doc");
const NotImplementedError = require("./NotImplementedError");
const request = require("request");
const Parse = require("cheerio").load;

class Scraper extends Doc {
  constructor(opts = {}) {
    super(opts);

    this.base_url = opts.base_url;
    this.root_path = opts.root_path;
    this.initial_paths = opts.initial_paths;
    this.options = opts.options || {};
    this.html_filters = opts.html_filters || [];
    this.text_filters = opts.text_filters || [];
    this.stubs = opts.stubs || [];
    this.filters = opts.filters || [];
  }

  inherited(subclass) {
    this.constructor.inherited();
    subclass.base_url = this.base_url;
    subclass.root_path = this.root_path;
    subclass.initial_paths = this.initial_paths.dup;
    subclass.options = this.options && this.options.deep_dup;
    subclass.html_filters = this.html_filters;
    subclass.text_filters = this.text_filters;
    subclass.stubs = this.stubs;
    subclass.filters = this.filters;
    return subclass;
  }

  // filters() {
  //   let { html_filters = {}, text_filters = {} } = this;
  //   return html_filters.to_a + text_filters.to_a;
  // }

  stub(path, block) {
    this.stubs.push({ path, block });
    return this.stubs;
  }

  initialize() {
    this.request_all();
  }

  async build_page(path) {
    let response = await this.request_one(path);
    let result = await this.handle_response(response);
    return result;
  }

  request_one(url) {
    throw NotImplementedError;
  }

  handle_response(response) {
    let r = this.process_response(response);
    return r || null;
  }

  process_response(response) {
    let data = {};
    return this.parse(data);
  }

  parse(str) {
    return str;
  }
}

module.exports = Scraper;
