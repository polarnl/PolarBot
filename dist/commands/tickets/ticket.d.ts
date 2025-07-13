import { ChatInputCommandInteraction, Client } from "discord.js";
declare const _default: {
    data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void>;
    openTicket(interaction: ChatInputCommandInteraction, client: Client): Promise<void>;
    closeTicket(interaction: ChatInputCommandInteraction): Promise<void>;
    addUser(interaction: ChatInputCommandInteraction): Promise<void>;
    removeUser(interaction: ChatInputCommandInteraction): Promise<void>;
    generateTranscript(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
//# sourceMappingURL=ticket.d.ts.map