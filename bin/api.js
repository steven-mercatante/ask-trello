const axios = require("axios");
const { config } = require("./config");

async function getTopics(boardId) {
  const { apiKey, authToken } = config;
  return await axios.get(
    `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${authToken}`
  );
}

async function getTopic(topicId) {
  const { apiKey, authToken } = config;
  return await axios.get(
    `https://api.trello.com/1/lists/${topicId}?key=${apiKey}&token=${authToken}`
  );
}

async function saveIdea(idea, topicId) {
  return await axios.post("https://api.trello.com/1/cards", {
    name: idea,
    idList: topicId,
    pos: "top",
    key: config.apiKey,
    token: config.authToken
  });
}

module.exports = {
  getTopics,
  getTopic,
  saveIdea
};
