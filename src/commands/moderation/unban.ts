import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../index.js";
export default {
  data: {
    name: "unban",
    description: "Haal een verbanning van een gebruiker ongedaan.",
    options: [
      {
        type: 3,
        name: "gebruiker",
        description: "De gebruiker die je wilt onverbannen.",
        required: true,
      },
    ],
    default_member_permissions: PermissionFlagsBits.BanMembers.toString(),
  },
  async execute(interaction: ChatInputCommandInteraction) {
    // const user = interaction.options.getUser('user', true);
    const userId = interaction.options.getString("gebruiker", true);
    const user = await interaction.client.users.fetch(userId).catch(() => null);

    let embed = new EmbedBuilder();
    try {
      if (!user) {
        embed.setColor(0xef4444);
        embed.setTimestamp();
        embed.setTitle("❌ | Error");
        embed.setDescription("De opgegeven gebruiker is niet gevonden.");
        await interaction.reply({
          embeds: [embed],
        });
        return;
      }
      await interaction.guild?.members.unban(user.id);

      let dmSent = false;
      let invite = null;

      const testEmbed = new EmbedBuilder()
        .setColor(0x22c55e)
        .setDescription(
          `Je bent onverbannen van **${interaction.guild?.name}**.`
        )
        .setTimestamp();

      await interaction.client.users.send(user.id, { embeds: [testEmbed] });

      // If DM succeeds, create invite and send proper message with link
      invite = await interaction.guild?.invites.create(
        interaction.guild.systemChannel?.id ||
          interaction.guild.channels.cache.find((channel) => channel.type === 0)
            ?.id ||
          "",
        {
          maxAge: 0, // Never expires
          maxUses: 1, // Single use
          reason: `Uitnodiging voor onverbannen gebruiker ${user.tag}`,
        }
      );

      const dmEmbedWithInvite = new EmbedBuilder()
        .setColor(0x22c55e)
        .setDescription(
          `Je bent onverbannen van **${interaction.guild?.name}**. Je kan weer deelnemen aan de server met [deze link](${invite}).`
        )
        .setTimestamp();

      await interaction.client.users.send(user.id, {
        embeds: [dmEmbedWithInvite],
      });
      dmSent = true;

      embed.setColor(0x22c55e);
      embed.setTimestamp();
      embed.setTitle("✅ | Onverbannen");

      let description = `**${user.tag}** is met succes onverbannen.`;
      if (!dmSent) {
        description +=
          "\n\n⚠️ *Kon geen DM sturen naar de gebruiker (DMs uitgeschakeld of bot geblokkeerd)*";
      }
      embed.setDescription(description);
      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Er is een fout opgetreden bij het onverbannen van de gebruiker:\n\`\`\`${error}\`\`\``,
      });
    }
  },
} satisfies Command;
