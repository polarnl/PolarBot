import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    EmbedBuilder
} from "discord.js";
import { getCollection } from "../../utils/database.js";

interface Reminder {
    _id: any;
    userId: string;
    guildId: string;
    channelId: string;
    message: string;
    type: 'one-time' | 'recurring' | 'scheduled';
    scheduledFor?: Date;
    interval?: string;
    time?: string;
    createdAt: Date;
}

export default {
    data: new SlashCommandBuilder()
        .setName("view-events")
        .setDescription("View all your active reminders and scheduled events"),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        try {
            const remindersCollection = await getCollection("reminders");
            const reminders = await remindersCollection
                .find({ 
                    userId: interaction.user.id,
                    guildId: interaction.guild!.id 
                })
                .sort({ createdAt: -1 })
                .toArray() as Reminder[];

            if (reminders.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x808080)
                    .setTitle("🗂️ Your Events")
                    .setDescription("You don't have any active reminders or scheduled events.")
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0x00BFFF)
                .setTitle("🗂️ Your Events")
                .setDescription(`You have **${reminders.length}** active event(s)`)
                .setTimestamp();

            // Group reminders by type
            const oneTimeReminders = reminders.filter(r => r.type === 'one-time');
            const recurringReminders = reminders.filter(r => r.type === 'recurring');
            const scheduledEvents = reminders.filter(r => r.type === 'scheduled');

            if (oneTimeReminders.length > 0) {
                let oneTimeText = "";
                oneTimeReminders.slice(0, 5).forEach(reminder => {
                    const timeLeft = new Date(reminder.scheduledFor!).getTime() - Date.now();
                    const timeLeftText = timeLeft > 0 ? 
                        `<t:${Math.floor(reminder.scheduledFor!.getTime() / 1000)}:R>` : 
                        "Expired";
                    
                    oneTimeText += `🔔 **${reminder.message}**\n└ ${timeLeftText}\n\n`;
                });
                
                if (oneTimeReminders.length > 5) {
                    oneTimeText += `*... and ${oneTimeReminders.length - 5} more*`;
                }
                
                embed.addFields({ name: "🔔 One-time Reminders", value: oneTimeText });
            }

            if (recurringReminders.length > 0) {
                let recurringText = "";
                recurringReminders.slice(0, 5).forEach(reminder => {
                    recurringText += `🔁 **${reminder.message}**\n└ Every ${reminder.interval!.substring(6)}\n\n`;
                });
                
                if (recurringReminders.length > 5) {
                    recurringText += `*... and ${recurringReminders.length - 5} more*`;
                }
                
                embed.addFields({ name: "🔁 Recurring Reminders", value: recurringText });
            }

            if (scheduledEvents.length > 0) {
                let scheduledText = "";
                scheduledEvents.slice(0, 5).forEach(event => {
                    scheduledText += `🕛 **${event.message}**\n└ Daily at ${event.time}\n\n`;
                });
                
                if (scheduledEvents.length > 5) {
                    scheduledText += `*... and ${scheduledEvents.length - 5} more*`;
                }
                
                embed.addFields({ name: "🕛 Scheduled Events", value: scheduledText });
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error fetching events:", error);
            await interaction.editReply("❌ An error occurred while fetching your events.");
        }
    },
}; 