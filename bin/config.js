const Conf = require("conf");

// TODO: it might be better UX to export a single config class with get() and set() methods instead of separate `conf` class and `config` dict

const conf = new Conf();
const config = {
  apiKey: conf.get("apiKey"),
  authToken: conf.get("authToken"),
  boardId: conf.get("boardId"),
  topicId: conf.get("topicId")
};

module.exports = {
  conf,
  config
};
