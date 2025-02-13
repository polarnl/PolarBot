const { EmbedBuilder } = require("discord.js");
const messageConfig = require("./../../../config/messageConfig.json");
const { adminIds } = require("./../../../config/config.json")
const getLocalCommands = require("./../../utils/getLocalCommands");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand) return;

  const localCommands = getLocalCommands();
  const commandObject = localCommands.find(
    (cmd) => cmd.data.name === interaction.commandName
  );

  if (!commandObject) return;

  const createEmbed = (col, desc) =>
    new EmbedBuilder().setColor(col).setDescription(desc);

  if (commandObject.devOnly && !adminIds.includes(interaction.member.id)) {
    const embed = createEmbed(messageConfig.embedColorError)
  }
};
