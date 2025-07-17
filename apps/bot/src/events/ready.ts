import { Events } from 'discord.js';
import type { Event } from './index.js';
import chalk from 'chalk';
import { prisma } from '../util/prisma.js';


export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		prisma.$connect().catch((error: unknown) => {
			console.error(chalk.red('‼️ | Fout bij het verbinden met de database:', error));
			console.error(chalk.red('==============================='));
			console.error(chalk.red('‼️ | PolarBot\'s proces zal nu afgebroken worden...'));
			process.exit(1);
		})
		console.log(chalk.green('✅ | Verbinden met MongoDB gelukt!'));
		console.log(chalk.green(`🤖 | ${client.user?.tag} is met succes ingelogd!`));
	},
} satisfies Event<Events.ClientReady>;
