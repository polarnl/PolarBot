import { Client } from 'discord.js';
export declare class Scheduler {
    private client;
    private tasks;
    constructor(client: Client);
    parseTime(timeString: string): number | null;
    createReminder(userId: string, channelId: string, message: string, timeString: string, reminderId: string): Promise<void>;
    createRecurringReminder(userId: string, channelId: string, message: string, timeString: string, reminderId: string): Promise<void>;
    createScheduledEvent(userId: string, channelId: string, message: string, timeString: string, // Format: "HH:MM"
    eventId: string): Promise<void>;
    stopTask(taskId: string): void;
    loadExistingReminders(): Promise<void>;
}
//# sourceMappingURL=scheduler.d.ts.map