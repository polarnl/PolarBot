module.exports = async (client, guildId) => {
    let applicationCommands;

    applicationCommands = client.application.commands;

    await applicationCommands.fetch()
    return applicationCommands;
}