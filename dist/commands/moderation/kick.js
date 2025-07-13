import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getCollection } from "../../utils/database.js";
export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the server")
        .addUserOption(option => option.setName("user")
        .setDescription("The user to kick")
        .setRequired(true))
        .addStringOption(option => option.setName("reason")
        .setDescription("Reason for kicking the user")
        .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const targetUser = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = interaction.guild?.members.cache.get(targetUser.id);
        if (!member) {
            await interaction.editReply("❌ User not found in this server.");
            return;
        }
        if (!member.kickable) {
            await interaction.editReply("❌ I cannot kick this user. They may have higher permissions than me.");
            return;
        }
        try {
            await member.kick(reason);
            // Log the action
            const infractionsCollection = await getCollection("infractions");
            await infractionsCollection.insertOne({
                userId: targetUser.id,
                username: targetUser.username,
                action: "kick",
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username,
                guildId: interaction.guild.id,
                timestamp: new Date()
            });
            const embed = new EmbedBuilder()
                .setColor(0xFF6B35)
                .setTitle("🔨 User Kicked")
                .setDescription(`**User:** ${targetUser.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            // Send DM to kicked user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFF6B35)
                    .setTitle("You have been kicked")
                    .setDescription(`**Server:** ${interaction.guild.name}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                    .setTimestamp();
                await targetUser.send({ embeds: [dmEmbed] });
            }
            catch (error) {
                // User might have DMs disabled, ignore error
            }
        }
        catch (error) {
            console.error("Error kicking user:", error);
            await interaction.editReply("❌ An error occurred while kicking the user.");
        }
    },
};
//# sourceMappingURL=kick.js.map