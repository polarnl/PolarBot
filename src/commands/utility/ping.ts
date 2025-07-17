import { EmbedBuilder } from 'discord.js';
import type { Command } from '../index.js';

export default {
	data: {
		name: 'ping',
		description: 'Pong!',
	},
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: interaction.client.user?.username,
				iconURL: interaction.client.user?.displayAvatarURL(),
			})
			.setDescription(`Pong! 🏓\nAntwoordtijd: ${Date.now() - interaction.createdTimestamp}ms`)
			.setTimestamp()
			.setColor(0x38bdf8)

		await interaction.reply({ embeds: [embed] });
	},
} satisfies Command;
