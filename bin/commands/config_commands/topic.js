const chalk = require("chalk");
const { config } = require("../../config");
const { getTopic } = require("../../api");
const { printError, promptForTopic } = require("../../utils");

module.exports = {
  command: "topic",
  handler: async argv => {
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
  }
};
