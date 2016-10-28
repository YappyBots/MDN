const Log = require("./lib/Util/Log");

require("./lib/index");

process.on("unhandledRejection", Log.error);
process.on("uncaughtException", Log.error);
