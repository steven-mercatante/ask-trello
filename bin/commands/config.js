module.exports = {
  command: "config <setting>",
  desc: `Set configuration options`,
  builder: yargs => yargs.commandDir("config_commands"),
  handler: _ => {}
};
