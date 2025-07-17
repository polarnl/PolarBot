import process from "node:process";
import { URL } from "node:url";
import { Client, GatewayIntentBits } from "discord.js";
import { loadEvents } from "./util/loaders.js";
import chalk from "chalk";

try {
  const { config } = await import("dotenv");
  config();
  console.log(chalk.green("✅ | Omgevingsvariabelen geladen!"));
} catch (error) {
  console.log(
    chalk.red(
      "‼️ | Geen .env-bestand gevonden, systeemomgevingsvariabelen worden gebruikt."
    )
  );
}

console.log(chalk.blue("🤖 | PolarBot opstarten..."));

// Client opstarten
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

console.log(chalk.yellow("📂 | Events laden..."));
const events = await loadEvents(new URL("events/", import.meta.url));
console.log(chalk.green(`✅ | ${events.length} events geladen`));

// Events registreren
console.log(chalk.blue("🔗 | Events registreren..."));
for (const event of events) {
  client[event.once ? "once" : "on"](event.name, async (...args) => {
    try {
      await event.execute(...args);
    } catch (error) {
      console.error(
        chalk.red(
          `‼️ | ${String(event.name)} kon niet uitgevoerd worden, met fout:`,
          error
        )
      );
    }
  });
}
console.log(chalk.green("✅ | Events geregistreerd"));

console.log(chalk.blue("🔑 | Inloggen met Discord..."));
// Login to the client
void client.login(process.env.DISCORD_TOKEN);
