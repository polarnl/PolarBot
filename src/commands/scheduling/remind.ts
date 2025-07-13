import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    Client, 
    EmbedBuilder
} from "discord.js";
import { getCollection } from "../../utils/database.js";
import { Scheduler } from "../../utils/scheduler.js";

export default {
    data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Set a reminder")
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Time until reminder (e.g., 30m, 2h, 1d) or 'every 2h' for recurring")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("What to remind you about")
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const timeString = interaction.options.getString("time")!;
        const message = interaction.options.getString("message")!;

        try {
            const scheduler = new Scheduler(client);
            const remindersCollection = await getCollection("reminders");

            // Check if it's a recurring reminder
            const isRecurring = timeString.startsWith('every ');
            
            if (isRecurring) {
                // Create recurring reminder
                const reminderDoc = {
                    userId: interaction.user.id,
                    guildId: interaction.guild!.id,
                    channelId: interaction.channel!.id,
                    message: message,
                    type: 'recurring',
                    interval: timeString,
                    createdAt: new Date()
                };

                const result = await remindersCollection.insertOne(reminderDoc);
                await scheduler.createRecurringReminder(
                    interaction.user.id,
                    interaction.channel!.id,
                    message,
                    timeString,
                    result.insertedId.toString()
                );

                const embed = new EmbedBuilder()
                    .setColor(0x00BFFF)
                    .setTitle("🔁 Recurring Reminder Set")
                    .setDescription(`**Message:** ${message}\n**Interval:** ${timeString}\n**Channel:** <#${interaction.channel!.id}>`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else {
                // Create one-time reminder
                const duration = scheduler.parseTime(timeString);
                if (!duration) {
                    await interaction.editReply("❌ Invalid time format. Use: 30s, 5m, 2h, 1d");
                    return;
                }

                const scheduledFor = new Date(Date.now() + duration);
                
                const reminderDoc = {
                    userId: interaction.user.id,
                    guildId: interaction.guild!.id,
                    channelId: interaction.channel!.id,
                    message: message,
                    type: 'one-time',
                    scheduledFor: scheduledFor,
                    createdAt: new Date()
                };

                const result = await remindersCollection.insertOne(reminderDoc);
                await scheduler.createReminder(
                    interaction.user.id,
                    interaction.channel!.id,
                    message,
                    timeString,
                    result.insertedId.toString()
                );

                const embed = new EmbedBuilder()
                    .setColor(0x00BFFF)
                    .setTitle("🔔 Reminder Set")
                    .setDescription(`**Message:** ${message}\n**Time:** ${timeString}\n**Channel:** <#${interaction.channel!.id}>`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error("Error creating reminder:", error);
            await interaction.editReply("❌ An error occurred while creating the reminder.");
        }
    },
}; 