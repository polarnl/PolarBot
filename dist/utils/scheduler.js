import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import { getCollection } from './database.js';
import ms from 'ms';
import { ObjectId } from 'mongodb';
export class Scheduler {
    constructor(client) {
        this.tasks = new Map();
        this.client = client;
    }
    // Parse time string to milliseconds
    parseTime(timeString) {
        // Handle "every X time" format
        if (timeString.startsWith('every ')) {
            const timePart = timeString.substring(6); // Remove "every "
            return ms(timePart);
        }
        // Handle single time format
        return ms(timeString);
    }
    // Create a one-time reminder
    async createReminder(userId, channelId, message, timeString, reminderId) {
        const duration = this.parseTime(timeString);
        if (!duration) {
            throw new Error('Invalid time format');
        }
        // For one-time reminders, use setTimeout instead of cron
        const timeout = setTimeout(async () => {
            try {
                const channel = await this.client.channels.fetch(channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor(0x00BFFF)
                        .setTitle('🔔 Reminder')
                        .setDescription(message)
                        .setTimestamp();
                    await channel.send({ content: `<@${userId}>`, embeds: [embed] });
                }
                // Remove from database
                const remindersCollection = await getCollection('reminders');
                await remindersCollection.deleteOne({ _id: new ObjectId(reminderId) });
                this.tasks.delete(reminderId);
            }
            catch (error) {
                console.error('Error sending reminder:', error);
            }
        }, duration);
        this.tasks.set(reminderId, { stop: () => clearTimeout(timeout) });
    }
    // Create a recurring reminder
    async createRecurringReminder(userId, channelId, message, timeString, reminderId) {
        const duration = this.parseTime(timeString);
        if (!duration) {
            throw new Error('Invalid time format');
        }
        // Convert to cron expression (every X minutes/hours/days)
        let cronExpression;
        if (duration < 60000) { // Less than 1 minute
            throw new Error('Minimum interval is 1 minute');
        }
        else if (duration < 3600000) { // Less than 1 hour
            const minutes = Math.floor(duration / 60000);
            cronExpression = `*/${minutes} * * * *`;
        }
        else if (duration < 86400000) { // Less than 1 day
            const hours = Math.floor(duration / 3600000);
            cronExpression = `0 */${hours} * * *`;
        }
        else { // Days
            const days = Math.floor(duration / 86400000);
            cronExpression = `0 0 */${days} * *`;
        }
        const task = cron.schedule(cronExpression, async () => {
            try {
                const channel = await this.client.channels.fetch(channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor(0x00BFFF)
                        .setTitle('🔁 Recurring Reminder')
                        .setDescription(message)
                        .setTimestamp();
                    await channel.send({ content: `<@${userId}>`, embeds: [embed] });
                }
            }
            catch (error) {
                console.error('Error sending recurring reminder:', error);
            }
        });
        this.tasks.set(reminderId, task);
    }
    // Create a scheduled event (daily at specific time)
    async createScheduledEvent(userId, channelId, message, timeString, // Format: "HH:MM"
    eventId) {
        const timeParts = timeString.split(':');
        const hours = parseInt(timeParts[0] || '0');
        const minutes = parseInt(timeParts[1] || '0');
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new Error('Invalid time format. Use HH:MM (e.g., 14:30)');
        }
        const cronExpression = `${minutes} ${hours} * * *`;
        const task = cron.schedule(cronExpression, async () => {
            try {
                const channel = await this.client.channels.fetch(channelId);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor(0x9370DB)
                        .setTitle('🕛 Scheduled Event')
                        .setDescription(message)
                        .setTimestamp();
                    await channel.send({ content: `<@${userId}>`, embeds: [embed] });
                }
            }
            catch (error) {
                console.error('Error sending scheduled event:', error);
            }
        });
        this.tasks.set(eventId, task);
    }
    // Stop a task
    stopTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.stop();
            this.tasks.delete(taskId);
        }
    }
    // Load existing reminders from database on startup
    async loadExistingReminders() {
        try {
            const remindersCollection = await getCollection('reminders');
            const reminders = await remindersCollection.find({}).toArray();
            for (const reminder of reminders) {
                if (reminder.type === 'one-time') {
                    // Check if reminder is in the future
                    if (reminder.scheduledFor && new Date(reminder.scheduledFor) > new Date()) {
                        const timeUntilReminder = new Date(reminder.scheduledFor).getTime() - Date.now();
                        if (timeUntilReminder > 0) {
                            await this.createReminder(reminder.userId, reminder.channelId, reminder.message, `${timeUntilReminder}ms`, reminder._id.toString());
                        }
                    }
                }
                else if (reminder.type === 'recurring') {
                    await this.createRecurringReminder(reminder.userId, reminder.channelId, reminder.message, reminder.interval, reminder._id.toString());
                }
                else if (reminder.type === 'scheduled') {
                    await this.createScheduledEvent(reminder.userId, reminder.channelId, reminder.message, reminder.time, reminder._id.toString());
                }
            }
            console.log(`Loaded ${reminders.length} existing reminders`);
        }
        catch (error) {
            console.error('Error loading existing reminders:', error);
        }
    }
}
//# sourceMappingURL=scheduler.js.map