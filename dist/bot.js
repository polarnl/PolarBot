import dotenv from "dotenv";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "./utils/database.js";
import { Scheduler } from "./utils/scheduler.js";
dotenv.config();
const { token } = process.env;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration
    ]
});
client.commands = new Collection();
client.commandArray = [];
async function initializeBot() {
    // Connect to MongoDB
    try {
        await connectToDatabase();
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
    // Initialize scheduler
    client.scheduler = new Scheduler(client);
    const functionFolders = fs.readdirSync("./src/functions");
    for (const folder of functionFolders) {
        const functionsFiles = fs
            .readdirSync(`./src/functions/${folder}`)
            .filter((file) => file.endsWith(".ts"));
        for (const file of functionsFiles) {
            const filePath = path.resolve(`./src/functions/${folder}/${file}`);
            const handler = await import(filePath);
            handler.default(client);
        }
    }
    await client.handleEvents();
    await client.handleCommands();
    // Load existing reminders after bot is ready
    client.once('ready', async () => {
        console.log(`Logged in as ${client.user.tag}`);
        await client.scheduler.loadExistingReminders();
    });
    client.login(token);
}
initializeBot().catch(console.error);
//# sourceMappingURL=bot.js.map