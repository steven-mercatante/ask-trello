#!/usr/bin/env node

// TODO: need a way to change boardId
// TODO: might need a way to change listId

const axios = require("axios");
const inquirer = require("inquirer");
const yargs = require("yargs");
const Conf = require("conf");

const config = new Conf();
let apiKey = config.get("apiKey");
let authToken = config.get("authToken");
let boardId = config.get("boardId");
let listId = config.get("listId");

function saveQuestion(question, listId) {
  console.log("listId:...", listId);
  axios
    .post("https://api.trello.com/1/cards", {
      name: question,
      idList: listId,
      pos: "top",
      key: apiKey,
      token: authToken
    })
    .then(resp => {
      console.log(resp);
    })
    .catch(err => {
      // console.log(err);
    });
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
  const resp = await axios.get(
    `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${authToken}`
  );
  return resp;
}

async function authorize() {
  if (!apiKey) {
    const response = await inquirer.prompt({
      type: "input",
      name: "apiKey",
      message: "Enter your Trello API key (see https://trello.com/app-key/)"
    });
    apiKey = response.apiKey;
    config.set("apiKey", apiKey);
  }

  if (!authToken) {
    const response = await inquirer.prompt({
      type: "input",
      name: "authToken",
      message:
        "Enter your Trello auth token (see: https://developers.trello.com/page/authorization)"
    });
    authToken = response.authToken;
    config.set("authToken", authToken);
  }
}

const questionCmd = {
  command: "qestion",
  aliases: ["q"],
  desc: "Ask a question",
  handler: async argv => {
    let question = argv._.slice(1)
      .join(" ")
      .trim();
    if (!question) {
      question = await promptForQuestion();
    }
    console.log(`>>>> !${question}!`);
    saveQuestion(question, listId);
  }
};

async function main() {
  await authorize();

  if (!boardId) {
    const response = await inquirer.prompt({
      type: "input",
      name: "boardId",
      message: "Enter your board ID"
    });
    boardId = response.boardId;
    config.set("boardId", boardId);
  }

  if (!listId) {
    const resp = await getTopics(boardId);
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
    listId = response.topic;
    config.set("listId", listId);
  }

  yargs.command(questionCmd).argv;
}

main();
