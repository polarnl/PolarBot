import fs from "fs";
export default (client) => {
    client.handleEvents = async () => {
        const eventFolders = fs.readdirSync("./src/events");
        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`./src/events/${folder}`)
                .filter((file) => file.endsWith(".ts"));
            switch (folder) {
                case "client":
                    for (const file of eventFiles) {
                        const eventModule = await import(`../../events/${folder}/${file}`);
                        const event = eventModule.default;
                        if (event.once) {
                            client.once(event.name, (...args) => event.execute(...args, client));
                        }
                        else {
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
//# sourceMappingURL=handleEvents.js.map