const path = require("path");
const getAllFiles = require("../utils/getAllFiles.js"); // using CommonJS

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const folder of eventFolders) {
    const eventFiles = getAllFiles(folder);
    let eventName;

    // Assign proper event name if folder name is "validations"
    eventName = folder.includes("validations") ? "interactionCreate" : folder.split(path.sep).pop();

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);
        if (typeof eventFunction === "function") {
          await eventFunction(client, arg);
        }
      }
    });
  }
};
