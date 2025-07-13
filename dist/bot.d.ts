import { Collection } from "discord.js";
import { Scheduler } from "./utils/scheduler.js";
declare module "discord.js" {
    interface Client {
        commands: Collection<string, any>;
        commandArray: any[];
        handleEvents: () => Promise<void>;
        handleCommands: () => Promise<void>;
        scheduler: Scheduler;
    }
}
//# sourceMappingURL=bot.d.ts.map