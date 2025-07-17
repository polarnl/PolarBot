import {
  EmbedBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../index.js";

export default {
  data: {
    name: "ban",
    description: "Verban een gebruiker van de huidige server.",
    options: [
      {
        type: 6, // User type
        name: "user",
        description: "De gebruiker die je wilt verbannen.",
        required: true,
      },
      {
        type: 3, // String type
        name: "reden",
        description: "De reden voor de verbanning.",
        required: false,
      },
      {
        type: 3, // String type
        name: "duur",
        description:
          "De duur van de verbanning (1s, 5m, 1h, 3d, etc. Leeg = permanent).",
        required: false,
      },
    ],
    default_member_permissions: PermissionFlagsBits.BanMembers.toString(),
  },
  async execute(interaction: ChatInputCommandInteraction) {
    // Type-safe way to get the user option
    const banTarget = interaction.options.getUser("user", true); // true makes it required
    const reason =
      interaction.options.getString("reden") ?? "Geen reden opgegeven";
    const duration = interaction.options.getString("duur") ?? "0";

    // Parse duration string to milliseconds
    const parseDuration = (durationStr: string): number | null => {
      if (durationStr === "0" || !durationStr) return null; // Permanent ban

      const match = durationStr.match(/^(\d+)([smhd])$/i);
      if (!match) return null;

      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      switch (unit) {
        case "s":
          return value * 1000; // seconds
        case "m":
          return value * 60 * 1000; // minutes
        case "h":
          return value * 60 * 60 * 1000; // hours
        case "d":
          return value * 24 * 60 * 60 * 1000; // days
        default:
          return null;
      }
    };

    const durationMs = parseDuration(duration);

    let embed = new EmbedBuilder();
    // Validate duration format if provided
    if (duration !== "0" && durationMs === null) {
      embed.setColor(0xef4444);
      embed.setTimestamp();
      embed.setTitle("❌ | Error");
      embed.setDescription(
        "Ongeldige duur formaat. Gebruik formaten zoals: 1h, 3d, 30m, 120s"
      );
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    // Check if the user has permission to ban members
    if (!interaction.memberPermissions?.has("BanMembers")) {
      embed.setColor(0xef4444);
      embed.setTimestamp();
      embed.setTitle("❌ | Error");
      embed.setDescription(
        "Je hebt geen toestemming om gebruikers te verbannen."
      );
      await interaction.reply({
        embeds: [embed],
      });
      return;
    }

    // Check if the target user can be banned
    const member = interaction.guild?.members.cache.get(banTarget.id);
    if (member && !member.bannable) {
      embed.setColor(0xef4444);
      embed.setTimestamp();
      embed.setTitle("❌ | Error");
      embed.setDescription(
        "Ik kan deze gebruiker niet verbannen. Mogelijk heeft deze gebruiker een hogere rol dan mij."
      );
      await interaction.reply({
        embeds: [embed],
      });
      return;
    }

    try {
      // Send DM to user before banning them
      let dmSent = false;
      try {
        const banDmEmbed = new EmbedBuilder()
          .setColor(0xef4444)
          .setTitle('🔨 | Je bent verbannen')
          .setDescription(`Je bent verbannen van **${interaction.guild?.name}**.`)
          .addFields([
            {
              name: 'Met reden:',
              value: reason,
              inline: false
            },
            {
              name: 'Duur',
              value: durationMs === null ? 'Permanent' : duration,
              inline: false
            }
          ])
          .setTimestamp();

        await interaction.client.users.send(banTarget.id, { embeds: [banDmEmbed] });
        dmSent = true;
      } catch (error: any) {
        if (error.code === 50007) {
          console.log(`Cannot send ban DM to user ${banTarget.tag} - DMs disabled or user blocked bot`);
        } else {
          console.error(`Failed to send ban DM to user ${banTarget.tag}:`, error);
        }
      }

      // Ban the user
      await interaction.guild?.members.ban(banTarget.id, {
        reason: `${reason} - Verbannen door ${interaction.user.tag}`,
      });

      // If it's a temporary ban, set up automatic unban
      if (durationMs !== null) {
        setTimeout(async () => {
          try {
            await interaction.guild?.members.unban(
              banTarget.id,
              `Automatische opheffing van tijdelijke verbanning - Oorspronkelijk verbannen door ${interaction.user.tag}`
            );
            embed.setColor(0xef4444);
            const invite = await interaction.guild?.invites.create(
              interaction.guild.systemChannel?.id ||
              interaction.guild.channels.cache.find(
                (channel) => channel.type === 0
              )?.id ||
              "",
              {
                maxAge: 0, // Never expires
                maxUses: 1, // Single use
                reason: `Uitnodiging voor onverbannen gebruiker ${banTarget.tag}`,
              }
            );
            embed.setTitle("✅ | Tijdelijke verbanning opgeheven");
            embed.setDescription(
              `**${banTarget.tag}** is automatisch onverbannen na ${duration}.\n` +
              `Je kan weer deelnemen aan de server met [deze link](${invite?.url || ""}).`
            );
            embed.addFields([
              {
                name: "Serveruitnodiging",
                value: invite
                  ? `Klik hier om terug te keren: ${invite.url}`
                  : "Geen uitnodiging beschikbaar :(, probeer het dan zelf te vinden",
              },
            ]);
            await interaction.client.users
              .send(
                banTarget.id,
                {
                  embeds: [embed]
                }
              )
              .catch((error) => {
                console.error(
                  `Failed to send unban DM to user ${banTarget.tag}:`,
                  error
                );
              });
          } catch (error) {
            console.error(
              `Failed to automatically unban user ${banTarget.tag}:`,
              error
            );
          }
        }, durationMs);
      }

      embed.setColor(0x22c55e);
      embed.setTimestamp();
      embed.setTitle("✅ | Verbannen");

      let description = `**${banTarget.tag}** is succesvol verbannen.\n**Reden:** ${reason}\n**Duur:** ${durationMs === null ? "Permanent" : duration}`;
      if (!dmSent) {
        description += '\n\n⚠️ *Kon geen DM sturen naar de gebruiker (DMs uitgeschakeld of bot geblokkeerd)*';
      }
      embed.setDescription(description);
      await interaction.reply({
        embeds: [embed],
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ Er is een fout opgetreden bij het verbannen van de gebruiker:\n\`\`\`${error}\`\`\``,
        ephemeral: true,
      });
    }
  },
} satisfies Command;