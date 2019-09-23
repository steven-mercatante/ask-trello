const { conf, config } = require("../../config");
const Table = require("cli-table");

module.exports = {
  command: "info",
  handler: _ => {
    console.log(`Config located at: ${conf.path}`);
    const table = new Table({
      head: ["Setting", "Value"]
    });
    Object.entries(config).forEach(([k, v]) => {
      table.push([k, v || ""]);
    });
    console.log(table.toString());
  }
};
