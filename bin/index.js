#!/usr/bin/env node

const axios = require("axios");
const chalk = require("chalk");
const inquirer = require("inquirer");
const ora = require("ora");
const yargs = require("yargs");
const Conf = require("conf");
const Table = require("cli-table");

const conf = new Conf();
const config = {
  apiKey: conf.get("apiKey"),
  authToken: conf.get("authToken"),
  boardId: conf.get("boardId"),
  topicId: conf.get("topicId")
};
console.log(conf.path);

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
      console.log(chalk.green.bold("Success!"));
    })
    .catch(err => {
      printError(err);
    });
}

function printError(err) {
  const { status, data } = err.response;
  console.log(chalk.red.bold(`A ${status} error occurred: "${data}"`));
}

async function promptForQuestion() {
  const response = await inquirer.prompt({
    type: "input",
    name: "question",
    message: "What's your question, friend?"
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

async function authorize() {
  if (!config["apiKey"]) {
    const response = await inquirer.prompt({
      type: "input",
      name: "apiKey",
      message: "Enter your Trello API key (see https://trello.com/app-key/)"
    });
    conf.set("apiKey", response.apiKey);
  }

  if (!config.authToken) {
    const response = await inquirer.prompt({
      type: "input",
      name: "authToken",
      message:
        "Enter your Trello auth token (see: https://developers.trello.com/page/authorization)"
    });
    conf.set("authToken", response.authToken);
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

const questionCmd = {
  command: "question",
  aliases: ["q"],
  desc: "Ask a question",
  handler: async argv => {
    let question = argv._.slice(1)
      .join(" ")
      .trim();
    if (!question) {
      question = await promptForQuestion();
    }
    saveQuestion(question, conf.get("topicId"));
  }
};

async function promptForBoardId() {
  const response = await inquirer.prompt({
    type: "input",
    name: "boardId",
    message: "Enter your board ID"
  });
  conf.set("boardId", response.boardId);
}

async function promptForTopic() {
  const spinner = ora("Fetching topics");
  spinner.start();
  const resp = await getTopics(conf.get("boardId"));
  spinner.stop();
  const topics = resp.data.map(topic => ({
    name: topic.name,
    value: topic.id
  }));

  const response = await inquirer.prompt({
    type: "list",
    name: "topic",
    message: "Select a topic:",
    choices: topics
  });
  conf.set("topicId", response.topicId);
}

async function main() {
  // await authorize();
  // await checkForTopicId();

  // if (!conf.get("boardId")) {
  //   await promptForBoardId();
  // }

  // if (!conf.get("topicId")) {
  //   await promptForTopic();
  // }

  yargs.command(questionCmd).command({
    command: "config <setting>",
    desc: "Set configuration options",
    handler: async argv => {
      const { setting } = argv;
      switch (setting) {
        case "boardId":
          const boardId = argv._[1];
          if (boardId) {
            conf.set("boardId", boardId);
            console.log(chalk.green.bold(`boardId set to "${boardId}"`));
          } else {
            console.log(`boardId: ${conf.get("boardId")}`);
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
          console.log(chalk.red.bold(`Unknown setting "${setting}"`));
          process.exit();
      }
    }
  }).argv;
}

main();
