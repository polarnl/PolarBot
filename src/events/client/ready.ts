import { Client, Events } from "discord.js";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        console.log(`Ready! ${client.user?.tag} is logged in and online.`);
    },
}; 