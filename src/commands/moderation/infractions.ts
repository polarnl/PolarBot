import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits,
    EmbedBuilder
} from "discord.js";
import { getCollection } from "../../utils/database.js";

interface Infraction {
    _id: any;
    userId: string;
    username: string;
    action: string;
    reason: string;
    moderatorId: string;
    moderatorUsername: string;
    guildId: string;
    timestamp: Date;
    duration?: number;
}

export default {
    data: new SlashCommandBuilder()
        .setName("infractions")
        .setDescription("View a user's infraction history")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to check infractions for")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser("user");

        try {
            const infractionsCollection = await getCollection("infractions");
            const infractions = await infractionsCollection
                .find({ 
                    userId: targetUser!.id,
                    guildId: interaction.guild!.id 
                })
                .sort({ timestamp: -1 })
                .toArray() as Infraction[];

            if (infractions.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle("📋 Infraction History")
                    .setDescription(`**User:** ${targetUser!.tag}\n**Status:** Clean record - no infractions found.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle("📋 Infraction History")
                .setDescription(`**User:** ${targetUser!.tag}\n**Total Infractions:** ${infractions.length}`)
                .setTimestamp();

            // Group infractions by type
            const infractionCounts: { [key: string]: number } = {};
            infractions.forEach(infraction => {
                infractionCounts[infraction.action] = (infractionCounts[infraction.action] || 0) + 1;
            });

            let summaryText = "";
            for (const [action, count] of Object.entries(infractionCounts)) {
                const emoji = {
                    'warn': '⚠️',
                    'mute': '🤐',
                    'kick': '🔨',
                    'ban': '🚫',
                    'unmute': '✅'
                }[action] || '📝';
                
                summaryText += `${emoji} **${action.toUpperCase()}:** ${count}\n`;
            }

            embed.addFields({ name: "Summary", value: summaryText });

            // Show recent infractions (last 5)
            const recentInfractions = infractions.slice(0, 5);
            let recentText = "";
            
            recentInfractions.forEach(infraction => {
                const emoji = {
                    'warn': '⚠️',
                    'mute': '🤐',
                    'kick': '🔨',
                    'ban': '🚫',
                    'unmute': '✅'
                }[infraction.action] || '📝';
                
                const date = new Date(infraction.timestamp).toLocaleDateString();
                recentText += `${emoji} **${infraction.action.toUpperCase()}** - ${date}\n└ Reason: ${infraction.reason}\n\n`;
            });

            if (recentText) {
                embed.addFields({ name: "Recent Infractions", value: recentText });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error fetching infractions:", error);
            await interaction.editReply("❌ An error occurred while fetching the user's infractions.");
        }
    },
}; 