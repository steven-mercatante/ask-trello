#!/usr/bin/env node

const axios = require("axios");
const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora");
const yargs = require("yargs");
const Conf = require("conf");
const Table = require("cli-table");
const { successMsg, errorMsg } = require("./utils");

const conf = new Conf();
const config = {
  apiKey: conf.get("apiKey"),
  authToken: conf.get("authToken"),
  boardId: conf.get("boardId"),
  topicId: conf.get("topicId")
};

/**
 * ask config topic // shows list of topics and prompts user to select one
 * ask config --unset topic
 * ask config info // outputs path to config file & existing config values
 * ask config board [value] // prints existing boardId value, or sets new one
 */

// TODO: you should be able to call config command without having been prev authenticated

function saveQuestion(question, topicId) {
  axios
    .post("https://api.trello.com/1/cards", {
      name: question,
      idList: topicId,
      pos: "top",
      key: config.apiKey,
      token: config.authToken
    })
    .then(resp => {
      successMsg(chalk.green.bold("Success!"));
    })
    .catch(err => {
      printError(err);
    });
}

function printError(err) {
  const { status, data } = err.response;
  errorMsg(`A ${status} error occurred: "${data}"`);
}

async function promptForQuestion() {
  const response = await inquirer.prompt({
    type: "input",
    name: "question",
    message: "What's your question, friend?" // TODO: change message
  });
  return response.question;
}

async function getTopics(boardId) {
  // TODO: catch error
  const { apiKey, authToken } = config;
  const resp = await axios.get(
    `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${authToken}`
  );
  return resp;
}

async function getTopic(topicId) {
  const { apiKey, authToken } = config;
  const resp = await axios.get(
    `https://api.trello.com/1/lists/${topicId}?key=${apiKey}&token=${authToken}`
  );
  return resp;
}

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

async function promptForBoardId() {
  promptForConfig("boardId", "Enter your board ID");
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

const ideaCmd = {
  command: "$0",
  desc: "Save an idea",
  handler: async argv => {
    await authorize();
    await checkForBoardId();
    await checkForTopicId();

    // TODO: rename question to idea
    let question = argv._.join(" ").trim();
    if (!question) {
      question = await promptForQuestion();
    }
    saveQuestion(question, conf.get("topicId"));
  }
};

async function main() {
  yargs.command(ideaCmd).command({
    command: "config <setting>",
    desc: "Set configuration options",
    handler: async argv => {
      const { setting } = argv;
      switch (setting) {
        case "boardId":
          const boardId = argv._[1];
          if (boardId) {
            conf.set("boardId", boardId);
            successMsg(chalk.green.bold(`boardId set to "${boardId}"`));
          } else {
            errorMsg(`boardId: ${conf.get("boardId")}`);
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
          const directive = argv._[1] && argv._[1].trim();
          if (directive === "set") {
            await promptForTopic();
          } else {
            try {
              const topic = await getTopic(topicId);
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
  }).argv;
}

main();
