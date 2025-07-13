import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    async execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
        await interaction.deferReply();
        const message = await interaction.fetchReply();
        const newMessage = `API Latency: ${client.ws.ping}ms\nClient Latency: ${message.createdTimestamp - interaction.createdTimestamp}ms`;
        await interaction.editReply({
            content: newMessage,
        });
    },
}; 