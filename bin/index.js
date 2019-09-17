#!/usr/bin/env node

const axios = require("axios");
const inquirer = require("inquirer");
const meow = require("meow");
const Conf = require("conf");

const API_KEY = process.env.TRELLO_API_KEY;
const AUTH_TOKEN = process.env.TRELLO_AUTH_TOKEN;
const LIST_ID = "xxxxx"; // TODO: don't hardcode

function saveQuestion(question, listId) {
  axios
    .post("https://api.trello.com/1/cards", {
      name: question,
      idList: listId,
      pos: "top",
      key: API_KEY,
      token: AUTH_TOKEN
    })
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
}

async function getTopicIds() {}

const cli = meow(
  `
  Usage
    $ ask <question>
  
  Options
    --topic, -t  The question's topic

  Example
    $ ask "how to build a CLI tool?" -t automation
`,
  {}
);

async function getQuestion() {
  if (cli.input[0]) {
    return cli.input[0];
  }

  // user didn't type a question
  const response = await inquirer.prompt({
    type: "input",
    name: "question",
    message: "What's your question, friendo?"
  });
  return response.question;
}

const config = new Conf();
let boardId = config.get("boardId");
let listId = config.get("listId");

async function getTopics(boardId) {
  // TODO: catch error
  const resp = await axios.get(
    `https://api.trello.com/1/boards/${boardId}/lists?key=${API_KEY}&token=${AUTH_TOKEN}`
  );
  return resp;
}

async function main() {
  if (!listId) {
    const resp = await getTopics(boardId);
    const topics = resp.data.map(topic => ({
      name: topic.name,
      value: topic.id
    }));

    console.log("topics:", topics);
    const answer = await inquirer.prompt({
      type: "list",
      name: "topic",
      message: "Select a topic:",
      choices: topics
    });
    listId = answer.topic;
    console.log("listId:", listId);
    config.set("listId", listId);
  }
  // const question = await getQuestion();
  // saveQuestion(question, LIST_ID);
}

main();
console.log(cli.input, cli.flags);
