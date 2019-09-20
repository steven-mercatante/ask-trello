const chalk = require("chalk");

function successMsg(str) {
  console.log(chalk.green.bold(str));
}

function errorMsg(str) {
  console.log(chalk.red.bold(str));
}

module.exports = {
  successMsg,
  errorMsg
};
