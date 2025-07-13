import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getCollection } from "../../utils/database.js";
export default {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption(option => option.setName("user")
        .setDescription("The user to warn")
        .setRequired(true))
        .addStringOption(option => option.setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const targetUser = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        try {
            // Log the warning
            const infractionsCollection = await getCollection("infractions");
            await infractionsCollection.insertOne({
                userId: targetUser.id,
                username: targetUser.username,
                action: "warn",
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username,
                guildId: interaction.guild.id,
                timestamp: new Date()
            });
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle("⚠️ User Warned")
                .setDescription(`**User:** ${targetUser.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            // Send DM to warned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle("You have been warned")
                    .setDescription(`**Server:** ${interaction.guild.name}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                    .setTimestamp();
                await targetUser.send({ embeds: [dmEmbed] });
            }
            catch (error) {
                // User might have DMs disabled, ignore error
            }
        }
        catch (error) {
            console.error("Error warning user:", error);
            await interaction.editReply("❌ An error occurred while warning the user.");
        }
    },
};
//# sourceMappingURL=warn.js.map