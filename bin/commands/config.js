const chalk = require("chalk");
const Table = require("cli-table");
const { conf, config } = require("../config");
const { getTopic } = require("../api");
const {
  printError,
  errorMsg,
  successMsg,
  promptForTopic
} = require("../utils");

module.exports = {
  command: "config <setting>",
  desc: `Set configuration options
  
  usage: idea config [<options>]`,
  handler: async argv => {
    const { setting } = argv;
    switch (setting) {
      case "boardId":
        const boardId = argv._[1];
        if (boardId) {
          conf.set("boardId", boardId);
          successMsg(`boardId set to "${boardId}"`);
        } else {
          console.log(conf.get("boardId"));
        }
        break;

      case "info":
        console.log(`Config located at: ${conf.path}`);
        const table = new Table({
          head: ["Setting", "Value"]
        });
        Object.entries(config).forEach(([k, v]) => {
          table.push([k, v || ""]);
        });
        console.log(table.toString());
        break;

      case "topic":
        // TODO: rename directive to ...?
        if (argv.select === true) {
          await promptForTopic();
        } else {
          try {
            const topic = await getTopic(config.topicId);
            const { name, id } = topic.data;
            console.log(chalk.green.bold(`Current topic:`));
            console.log(`Name: ${name}`);
            console.log(`Id: ${id}`);
          } catch (err) {
            printError(err);
            process.exit();
          }
        }
        break;

      default:
        errorMsg(chalk.red.bold(`Unknown setting "${setting}"`));
        process.exit();
    }
  }
};
