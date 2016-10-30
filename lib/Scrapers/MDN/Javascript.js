const Mdn = require("../Mdn");

class Javascript extends Mdn {
  constructor() {
    super({
      name: `JavaScript`,
      base_url: `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference`,
    });

    this.stub(`https://developer.mozilla.org/en-US/docs/JavaScript/Reference`);
    this.stub(`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference`);
    this.stub("https://developer.mozilla.org/en-US/docs/JavaScript/Reference");
    this.stub("https://developer.mozilla.org/en/JavaScript/Reference");
    this.stub("https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference");
    this.stub("https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference");
    // this.stub("/Operators/Special/", "/Operators/");
    // this.stub("Destructing_assignment", "Destructuring_assignment");
    // this.stub("/Functions_and_function_scope", "/Functions");
    // this.stub("Array.prototype.values()", "values");
    // this.stub("%2A", "*");
    // this.stub("%40", "@");
  }
}

module.exports = new Javascript();
