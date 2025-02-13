require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");  
const figlet = require("figlet");
const gradient = require("gradient-string");

const eventHandler = require("./handlers/eventHandler");
console.log(
  gradient.default(["#38bdf8", "#e0f2fe"])(
    figlet.textSync("PolarBot", {
      font: "Rowan Cap",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessageReactions,
  ],
});

eventHandler(client);

client.login(process.env.BOT_TOKEN);