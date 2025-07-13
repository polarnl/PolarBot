import { Events } from "discord.js";
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! ${client.user?.tag} is logged in and online.`);
    },
};
//# sourceMappingURL=ready.js.map