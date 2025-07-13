import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getCollection } from "../../utils/database.js";
export default {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a user")
        .addUserOption(option => option.setName("user")
        .setDescription("The user to unmute")
        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const targetUser = interaction.options.getUser("user");
        const member = interaction.guild?.members.cache.get(targetUser.id);
        if (!member) {
            await interaction.editReply("❌ User not found in this server.");
            return;
        }
        if (!member.moderatable) {
            await interaction.editReply("❌ I cannot unmute this user. They may have higher permissions than me.");
            return;
        }
        if (!member.isCommunicationDisabled()) {
            await interaction.editReply("❌ This user is not currently muted.");
            return;
        }
        try {
            await member.timeout(null);
            // Log the action
            const infractionsCollection = await getCollection("infractions");
            await infractionsCollection.insertOne({
                userId: targetUser.id,
                username: targetUser.username,
                action: "unmute",
                reason: "Manual unmute",
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username,
                guildId: interaction.guild.id,
                timestamp: new Date()
            });
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("✅ User Unmuted")
                .setDescription(`**User:** ${targetUser.tag}\n**Moderator:** ${interaction.user.tag}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            // Send DM to unmuted user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle("You have been unmuted")
                    .setDescription(`**Server:** ${interaction.guild.name}\n**Moderator:** ${interaction.user.tag}`)
                    .setTimestamp();
                await targetUser.send({ embeds: [dmEmbed] });
            }
            catch (error) {
                // User might have DMs disabled, ignore error
            }
        }
        catch (error) {
            console.error("Error unmuting user:", error);
            await interaction.editReply("❌ An error occurred while unmuting the user.");
        }
    },
};
//# sourceMappingURL=unmute.js.map