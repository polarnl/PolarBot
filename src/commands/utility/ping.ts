import { EmbedBuilder } from 'discord.js';
import type { Command } from '../index.js';

function formatUptime(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	return `${h}h ${m}m ${s}s`;
}

export default {
	data: {
		name: 'ping',
		description: 'Pong!',
	},
	async execute(interaction) {
		const responseTime = Date.now() - interaction.createdTimestamp;
		const uptime = formatUptime(process.uptime());

		const embed = new EmbedBuilder()
			.setDescription(`Pong! 🏓\n💬 | Antwoordtijd: ${responseTime}ms\n⌚ | Uptime: ${uptime}`)
			.setTimestamp()
			.setColor(0x38bdf8);

		await interaction.reply({ embeds: [embed] });
	},
} satisfies Command;
