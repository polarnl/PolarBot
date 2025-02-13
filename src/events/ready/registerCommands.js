const commandComparing = require("../../utils/commandCompating");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const colors = require("colors");
module.exports = async (client) => {
  try {
    const [localCommands, applicationCommands] = await Promise.all([
      getLocalCommands(),
      getApplicationCommands(client),
    ]);

    for (const localCommand of localCommands) {
      const { data, deleted } = localCommand;
      const {
        name: commandName,
        description: commandDescription,
        options: commandOptions,
      } = data;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === commandName
      );

      if (deleted) {
        if (existingCommand) {
          await applicationCommands.delete(existingCommand.id);
          console.log(
            colors.blue(`ℹ️ | Command ${commandName} has been deleted`)
          );
        }
      } else if (existingCommand) {
        if (commandComparing(existingCommand, commandOptions)) {
          await applicationCommands.edit(existingCommand.id, {
            new: commandName,
            description: commandDescription,
            options: commandOptions,
          });
            console.log(
                colors.blue(`ℹ️ | Command ${commandName} has been updated`)
            );
        }
      } else if (existingCommand) {
        await applicationCommands.create({
          name: commandName,
          description: commandDescription,
          options: commandOptions,
        });
        console.log(
          colors.blue(`ℹ️ | Command ${commandName} has been created`)
        );
      }
    }
  } catch (error) {
    console.error(colors.red(`❌ | An error has occurred during command registery:\n${error.message}`));
  }
};
