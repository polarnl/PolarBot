import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { getCollection } from "../../utils/database.js";
export default {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user from the server")
        .addUserOption(option => option.setName("user")
        .setDescription("The user to ban")
        .setRequired(true))
        .addStringOption(option => option.setName("reason")
        .setDescription("Reason for banning the user")
        .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const targetUser = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const member = interaction.guild?.members.cache.get(targetUser.id);
        if (!member) {
            await interaction.editReply("❌ User not found in this server.");
            return;
        }
        if (!member.bannable) {
            await interaction.editReply("❌ I cannot ban this user. They may have higher permissions than me.");
            return;
        }
        try {
            await member.ban({ reason: reason });
            // Log the action
            const infractionsCollection = await getCollection("infractions");
            await infractionsCollection.insertOne({
                userId: targetUser.id,
                username: targetUser.username,
                action: "ban",
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorUsername: interaction.user.username,
                guildId: interaction.guild.id,
                timestamp: new Date()
            });
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("🚫 User Banned")
                .setDescription(`**User:** ${targetUser.tag}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
            // Send DM to banned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle("You have been banned")
                    .setDescription(`**Server:** ${interaction.guild.name}\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.tag}`)
                    .setTimestamp();
                await targetUser.send({ embeds: [dmEmbed] });
            }
            catch (error) {
                // User might have DMs disabled, ignore error
            }
        }
        catch (error) {
            console.error("Error banning user:", error);
            await interaction.editReply("❌ An error occurred while banning the user.");
        }
    },
};
//# sourceMappingURL=ban.js.map