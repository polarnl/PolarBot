import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getCollection } from "../../utils/database.js";
import { Scheduler } from "../../utils/scheduler.js";
export default {
    data: new SlashCommandBuilder()
        .setName("schedule-event")
        .setDescription("Schedule a daily event at a specific time")
        .addStringOption(option => option.setName("time")
        .setDescription("Time for the event (HH:MM format, e.g., 14:30)")
        .setRequired(true))
        .addStringOption(option => option.setName("message")
        .setDescription("Message for the scheduled event")
        .setRequired(true)),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        const timeString = interaction.options.getString("time");
        const message = interaction.options.getString("message");
        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(timeString)) {
            await interaction.editReply("❌ Invalid time format. Use HH:MM (e.g., 14:30)");
            return;
        }
        try {
            const scheduler = new Scheduler(client);
            const remindersCollection = await getCollection("reminders");
            // Check if user already has a scheduled event at this time
            const existingEvent = await remindersCollection.findOne({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                type: 'scheduled',
                time: timeString
            });
            if (existingEvent) {
                await interaction.editReply("❌ You already have a scheduled event at this time. Please choose a different time.");
                return;
            }
            const eventDoc = {
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                message: message,
                type: 'scheduled',
                time: timeString,
                createdAt: new Date()
            };
            const result = await remindersCollection.insertOne(eventDoc);
            await scheduler.createScheduledEvent(interaction.user.id, interaction.channel.id, message, timeString, result.insertedId.toString());
            const embed = new EmbedBuilder()
                .setColor(0x9370DB)
                .setTitle("🕛 Scheduled Event Created")
                .setDescription(`**Message:** ${message}\n**Time:** Daily at ${timeString}\n**Channel:** <#${interaction.channel.id}>`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error("Error creating scheduled event:", error);
            await interaction.editReply("❌ An error occurred while creating the scheduled event.");
        }
    },
};
//# sourceMappingURL=schedule-event.js.map