#!/usr/bin/env node

const axios = require("axios");
const inquirer = require("inquirer");
const meow = require("meow");

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

console.log(cli.input[0], cli.flags);

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

async function main() {
  const question = await getQuestion();
  saveQuestion(question, LIST_ID);
}

main();
