#!/usr/bin/env node

const yargs = require("yargs");
const ideaCmd = require("./commands/idea");
const configCmd = require("./commands/config");

/**
 * ask config topic // shows list of topics and prompts user to select one
 * ask config --unset topic
 * ask config info // outputs path to config file & existing config values
 * ask config board [value] // prints existing boardId value, or sets new one
 */

// TODO: you should be able to call config command without having been prev authenticated

yargs.command(ideaCmd).command(configCmd).argv;
