import { URL } from 'node:url';
import { Events } from 'discord.js';
import { loadCommands } from '../util/loaders.js';
import type { Event } from './index.js';
import chalk from 'chalk';

const commands = await loadCommands(new URL('../commands/', import.meta.url));

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isCommand()) {
			const command = commands.get(interaction.commandName);

			if (!command) {
				console.error(chalk.red(`‼️ | Opdracht '${interaction.commandName}' niet gevonden.`));
				throw new Error(`Command '${interaction.commandName}' not found.`);
			}

			await command.execute(interaction);
		}
	},
} satisfies Event<Events.InteractionCreate>;
