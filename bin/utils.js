const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora");
const { conf, config } = require("./config");
const { getTopics } = require("./api");

async function promptForConfig(key, msg) {
  const response = await inquirer.prompt({
    type: "input",
    name: key,
    message: msg
  });
  config[key] = response[key];
  conf.set(key, response[key]);
}

async function authorize() {
  if (!config.apiKey) {
    promptForConfig(
      "apiKey",
      "Enter your Trello API key (see https://trello.com/app-key/)"
    );
  }

  if (!config.authToken) {
    promptForConfig(
      "authToken",
      "Enter your Trello auth token (see: https://developers.trello.com/page/authorization)"
    );
  }
}

async function promptForTopic() {
  const spinner = ora("Fetching topics");
  spinner.start();
  const resp = await getTopics(config.boardId);
  spinner.stop();
  const topics = resp.data.map(topic => ({
    name: topic.name,
    value: topic.id
  }));

  const response = await inquirer.prompt({
    type: "list",
    name: "topicId",
    message: "Select a topic:",
    choices: topics
  });
  conf.set("topicId", response.topicId);
}

function successMsg(str) {
  console.log(chalk.green.bold(str));
}

function errorMsg(str) {
  console.log(chalk.red.bold(str));
}

function printError(err) {
  console.log(err);
  const { status, data } = err.response;
  errorMsg(`A ${status} error occurred: "${data}"`);
}

module.exports = {
  authorize,
  successMsg,
  errorMsg,
  printError,
  promptForTopic
};
