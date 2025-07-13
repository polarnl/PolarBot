import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
export default (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync("./src/commands");
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter((file) => file.endsWith(".ts"));
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const commandModule = await import(`../../commands/${folder}/${file}`);
                const command = commandModule.default;
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
            }
        }
        const { clientId, guildId, token } = process.env;
        if (!clientId || !guildId || !token) {
            throw new Error("Missing required environment variables: clientId, guildId, or token");
        }
        const rest = new REST().setToken(token);
        (async () => {
            try {
                console.log("Started refreshing application commands.");
                await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: client.commandArray });
                console.log("Successfully reloaded application commands.");
            }
            catch (error) {
                console.error("Error refreshing application commands:", error);
            }
        })();
    };
};
//# sourceMappingURL=handleCommands.js.map