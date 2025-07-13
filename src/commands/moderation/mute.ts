import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    PermissionFlagsBits,
    EmbedBuilder
} from "discord.js";
import { getCollection } from "../../utils/database.js";
import ms from "ms";

export default {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a user for a specified time")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to mute")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Duration of the mute (e.g., 30m, 2h, 1d)")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for muting the user")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser("user");
        const timeString = interaction.options.getString("time")!;
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = interaction.guild?.members.cache.get(targetUser!.id);

        if (!member) {
            await interaction.editReply("❌ User not found in this server.");
            return;
        }

        if (!member.moderatable) {
            await interaction.editReply("❌ I cannot mute this user. They may have higher permissions than me.");
            return;
        }

        // Parse time
        const duration = ms(timeString);
        if (!duration || duration < 1000 || duration > 2419200000) { // Max 28 days
            await interaction.editReply("❌ Invalid time format. Use: 30s, 5m, 2h, 1d (max 28 days)");
            return;
        }

        try {
            await member.timeout(duration, reason);
            
            // Log the action
            const infractionsCollection = await getCollection("infractions");
            await infractionsCollection.insertOne({
                userId: targetUser!.id,
                username: targetUser!.username,
                action: "mute",
                reason: reason,
                duration: duration,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username,
                guildId: interaction.guild!.id,
                timestamp: new Date()
            });

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("🤐 User Muted")
                .setDescription(`**User:** ${targetUser!.tag}\n**Duration:** ${timeString}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            // Send DM to muted user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle("You have been muted")
                    .setDescription(`**Server:** ${interaction.guild!.name}\n**Duration:** ${timeString}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                    .setTimestamp();
                
                await targetUser!.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User might have DMs disabled, ignore error
            }

        } catch (error) {
            console.error("Error muting user:", error);
            await interaction.editReply("❌ An error occurred while muting the user.");
        }
    },
}; 