const { conf } = require("../../config");
const { successMsg } = require("../../utils");

module.exports = {
  command: "board",
  handler: argv => {
    console.log(argv);
    const boardId = argv._[2];
    if (boardId) {
      conf.set("boardId", boardId);
      successMsg(`boardId set to "${boardId}"`);
    } else {
      console.log(conf.get("boardId"));
    }
  }
};
