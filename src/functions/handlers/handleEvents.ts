import fs from "fs";
import { Client } from "discord.js";

interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void> | void;
}

export default (client: Client): void => {
    client.handleEvents = async (): Promise<void> => {
        const eventFolders = fs.readdirSync("./src/events");
        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`./src/events/${folder}`)
                .filter((file) => file.endsWith(".ts"));

            switch (folder) {
                case "client":
                    for (const file of eventFiles) {
                        const eventModule = await import(`../../events/${folder}/${file}`);
                        const event: Event = eventModule.default;
                        if (event.once) {
                            client.once(event.name, (...args) => event.execute(...args, client));
                        } else {
                            client.on(event.name, (...args) => event.execute(...args, client));
                        }
                    }
                    break;

                default:
                    break;
            }
        }
    };
}; 