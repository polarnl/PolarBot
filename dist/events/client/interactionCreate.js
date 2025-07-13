import { Events } from "discord.js";
import { getCollection } from "../../utils/database.js";
export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction, client);
            }
            catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                }
                else {
                    await interaction.reply(errorMessage);
                }
            }
        }
        else if (interaction.isButton()) {
            // Handle button interactions
            if (interaction.customId === 'close_ticket') {
                await handleCloseTicketButton(interaction);
            }
        }
    },
};
async function handleCloseTicketButton(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
        const ticketsCollection = await getCollection("tickets");
        const ticket = await ticketsCollection.findOne({
            channelId: interaction.channel.id,
            status: "open"
        });
        if (!ticket) {
            await interaction.editReply("❌ This is not a valid ticket channel.");
            return;
        }
        // Update ticket status
        await ticketsCollection.updateOne({ _id: ticket._id }, { $set: { status: "closed", closedAt: new Date(), closedBy: interaction.user.id } });
        const { EmbedBuilder } = await import("discord.js");
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("🔒 Ticket Closed")
            .setDescription(`**Closed by:** ${interaction.user.tag}\n**Ticket:** ${ticket.reason}`)
            .setTimestamp();
        await interaction.channel.send({ embeds: [embed] });
        // Delete channel after 5 seconds
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            }
            catch (error) {
                console.error("Error deleting ticket channel:", error);
            }
        }, 5000);
        await interaction.editReply("✅ Ticket closed. Channel will be deleted in 5 seconds.");
    }
    catch (error) {
        console.error("Error closing ticket via button:", error);
        await interaction.editReply("❌ An error occurred while closing the ticket.");
    }
}
//# sourceMappingURL=interactionCreate.js.map