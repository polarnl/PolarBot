import dotenv from "dotenv";
dotenv.config();

import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "./utils/database.js";
import { Scheduler } from "./utils/scheduler.js";

console.log("MONGODB_URI:", process.env["MONGODB_URI"]); // Use brackets
const { token } = process.env;

// Extend the Client interface to include our custom properties
declare module "discord.js" {
    export interface Client {
        commands: Collection<string, any>;
        commandArray: any[];
        handleEvents: () => Promise<void>;
        handleCommands: () => Promise<void>;
        scheduler: Scheduler;
    }
}

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
    } catch (error) {
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
        console.log(`Logged in as ${client.user!.tag}`);
        await client.scheduler.loadExistingReminders();
    });
    
    client.login(token);
}

initializeBot().catch(console.error);