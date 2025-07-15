import { EmbedBuilder, PermissionFlagsBits, type ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../index.js';

export default {
  data: {
    name: 'ban',
    description: 'Verban een gebruiker van de huidige server.',
    options: [
      {
        type: 6, // User type
        name: 'user',
        description: 'De gebruiker die je wilt verbannen.',
        required: true
      },
      {
        type: 3, // String type
        name: 'reden',
        description: 'De reden voor de verbanning.',
        required: false
      },
      {
        type: 3, // String type
        name: 'duur',
        description: 'De duur van de verbanning (1h, 3d, etc. Standaard: permanent).',
        required: false
      }
    ],
    default_member_permissions: PermissionFlagsBits.BanMembers.toString()
  },
  async execute(interaction: ChatInputCommandInteraction) {
    // Type-safe way to get the user option
    const banTarget = interaction.options.getUser('user', true); // true makes it required
    const reason = interaction.options.getString('reden') ?? 'Geen reden opgegeven';
    const duration = interaction.options.getString('duur') ?? '0';

    let embed = new EmbedBuilder()
    // Check if the user has permission to ban members
    if (!interaction.memberPermissions?.has('BanMembers')) {
      embed.setColor(0xef4444)
      embed.setAuthor({
        name: interaction.client.user?.username,
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      embed.setTimestamp()
      embed.setTitle('❌ | Error')
      embed.setDescription('Je hebt geen toestemming om gebruikers te verbannen.');
      await interaction.reply({
        embeds: [embed],
      });
      return;
    }

    // Check if the target user can be banned
    const member = interaction.guild?.members.cache.get(banTarget.id);
    if (member && !member.bannable) {
      embed.setColor(0xef4444)
      embed.setAuthor({
        name: interaction.client.user?.username,
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      embed.setTimestamp()
      embed.setTitle('❌ | Error')
      embed.setDescription('Ik kan deze gebruiker niet verbannen. Mogelijk heeft deze gebruiker een hogere rol dan mij.');
      await interaction.reply({
        embeds: [embed],
      });
      return;
    }

    try {
      // Ban the user
      await interaction.guild?.members.ban(banTarget.id, {
        reason: `${reason} - Verbannen door ${interaction.user.tag}`
      });
      embed.setColor(0x22c55e)
      embed.setAuthor({
        name: interaction.client.user?.username,
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      embed.setTimestamp()
      embed.setTitle('✅ | Verbannen')
      embed.setDescription(`**${banTarget.tag}** is succesvol verbannen.\n**Reden:** ${reason}\n**Duur:** ${duration === '0' ? 'Permanent' : duration}`);
      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Er is een fout opgetreden bij het verbannen van de gebruiker:\n\`\`\`${error}\`\`\``,
        ephemeral: true
      });
    }
  }
} satisfies Command;
