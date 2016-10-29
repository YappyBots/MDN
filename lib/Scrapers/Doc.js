const path = require("path");
const Collection = require("discord.js").Collection;

class Doc {
  constructor(opts = {}) {
    this.INDEX_FILENAME = "index.js";
    this.DB_FILENAME = "db.json";

    this.data = {};
    this.data.version = opts.version;
    this.data.versions = [opts.version];
    this.data.slug = opts.slug;

    this.name = opts.name;
    this.type = opts.type;
    this.release = opts.release;
    this.abstract = opts.abstract;
    this.links = opts.links;

    this.docs = new Collection();
  }

  inherited(subclass) {
    return subclass.type === this.type;
  }

  get version() {
    let klass = new this.constructor();
    klass.name = this.name;
    klass.data.slug = this.data.slug;
    klass.data.version = this.data.version;
    klass.release = this.release;
    klass.links = this.links;
    return klass;
  }

  set version(value) {
    this.data.version = value.toString();
  }

  get versions() {
    return this.data.versions || [this.data.version];
  }

  get versionExists() {
    return !!this.data.version;
  }

  get versioned() {
    return !!this.presence;
  }

  get slug() {
    let slug = this.data.slug || this.name.toLowerCase();
    let version_slug = this.data.version;
    return this.versionExists ? `${slug}~${version_slug}` : slug;
  }

  set slug(slug) {
    slug = slug || this.name.toLowerCase();
    let version_slug = this.data.version;
    this.slug = this.versionExists ? `${slug}~${version_slug}` : slug;
  }

  get path() {
    return this.slug;
  }

  get index_path() {
    return path.join(this.path, this.INDEX_FILENAME);
  }

  get db_path() {
    return path.join(this.path, this.DB_FILENAME);
  }

  as_json() {
    let json = { name: this.name, slug: this.slug, type: this.type };
    if (this.links) json.links = this.links;
    if (this.version) json.version = this.version;
    if (this.release) json.release = this.release;
    return json;
  }

  initialize() {
    if (this instanceof this) throw new Error(`${this.class} is an abstract class and cannot be instantiated`);
  }
}

module.exports = Doc;
