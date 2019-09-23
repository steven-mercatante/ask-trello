const inquirer = require("inquirer");
const { authorize } = require("../utils");
const { conf, config } = require("../config");
const { saveIdea } = require("../api");
const { printError, successMsg } = require("../utils");

async function promptForBoardId() {
  promptForConfig("boardId", "Enter your board ID");
}

async function checkForBoardId() {
  if (!config.boardId) {
    await promptForBoardId();
  }
}

async function checkForTopicId() {
  if (!config.topicId) {
    await promptForTopic();
  }
}

async function promptForIdea() {
  const response = await inquirer.prompt({
    type: "input",
    name: "idea",
    message: "What's your idea?"
  });
  return response.idea;
}

module.exports = {
  command: "$0",
  desc: "Save an idea",
  handler: async argv => {
    await authorize();
    await checkForBoardId();
    await checkForTopicId();

    let idea = argv._.join(" ").trim();
    if (!idea) {
      idea = await promptForIdea();
    }

    try {
      saveIdea(idea, conf.get("topicId"));
      successMsg("Idea saved!");
    } catch (err) {
      printError(err);
    }
  }
};
