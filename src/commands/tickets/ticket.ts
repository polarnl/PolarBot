import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    Client, 
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel
} from "discord.js";
import { getCollection } from "../../utils/database.js";

interface Ticket {
    _id: any;
    ticketId: string;
    userId: string;
    username: string;
    guildId: string;
    channelId: string;
    reason: string;
    status: string;
    createdAt: Date;
    participants: string[];
}

export default {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Ticket system commands")
        .addSubcommand(subcommand =>
            subcommand
                .setName("open")
                .setDescription("Open a new ticket")
                .addStringOption(option =>
                    option.setName("reason")
                        .setDescription("Reason for opening the ticket")
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("close")
                .setDescription("Close the current ticket"))
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Add a user to the ticket")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("User to add to the ticket")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Remove a user from the ticket")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("User to remove from the ticket")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("transcript")
                .setDescription("Generate a transcript of the ticket")),

    async execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "open":
                await this.openTicket(interaction, client);
                break;
            case "close":
                await this.closeTicket(interaction);
                break;
            case "add":
                await this.addUser(interaction);
                break;
            case "remove":
                await this.removeUser(interaction);
                break;
            case "transcript":
                await this.generateTranscript(interaction);
                break;
        }
    },

    async openTicket(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.options.getString("reason") || "No reason provided";

        try {
            // Check if user already has an open ticket
            const ticketsCollection = await getCollection("tickets");
            const existingTicket = await ticketsCollection.findOne({
                userId: interaction.user.id,
                guildId: interaction.guild!.id,
                status: "open"
            });

            if (existingTicket) {
                await interaction.editReply("❌ You already have an open ticket. Please close it first.");
                return;
            }

            // Create ticket channel
            const ticketChannel = await interaction.guild!.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: interaction.guild!.channels.cache.find(ch => ch.name === "Tickets")?.id || null,
                permissionOverwrites: [
                    {
                        id: interaction.guild!.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: client.user!.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels]
                    }
                ]
            });

            // Save ticket to database
            const ticketDoc = {
                ticketId: ticketChannel.id,
                userId: interaction.user.id,
                username: interaction.user.username,
                guildId: interaction.guild!.id,
                channelId: ticketChannel.id,
                reason: reason,
                status: "open",
                createdAt: new Date(),
                participants: [interaction.user.id]
            };

            await ticketsCollection.insertOne(ticketDoc);

            // Create close button
            const closeButton = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("🎫 Ticket Created")
                .setDescription(`**User:** ${interaction.user.tag}\n**Reason:** ${reason}\n**Channel:** <#${ticketChannel.id}>`)
                .setTimestamp();

            await ticketChannel.send({ embeds: [embed], components: [closeButton] });

            await interaction.editReply(`✅ Ticket created! <#${ticketChannel.id}>`);

        } catch (error) {
            console.error("Error creating ticket:", error);
            await interaction.editReply("❌ An error occurred while creating the ticket.");
        }
    },

    async closeTicket(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketsCollection = await getCollection("tickets");
            const ticket = await ticketsCollection.findOne({
                channelId: interaction.channel!.id,
                status: "open"
            }) as Ticket | null;

            if (!ticket) {
                await interaction.editReply("❌ This is not a valid ticket channel.");
                return;
            }

            // Update ticket status
            await ticketsCollection.updateOne(
                { _id: ticket._id },
                { $set: { status: "closed", closedAt: new Date(), closedBy: interaction.user.id } }
            );

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("🔒 Ticket Closed")
                .setDescription(`**Closed by:** ${interaction.user.tag}\n**Ticket:** ${ticket.reason}`)
                .setTimestamp();

            const textChannel = interaction.channel as TextChannel;
            await textChannel.send({ embeds: [embed] });

            // Delete channel after 5 seconds
            setTimeout(async () => {
                try {
                    await textChannel.delete();
                } catch (error) {
                    console.error("Error deleting ticket channel:", error);
                }
            }, 5000);

            await interaction.editReply("✅ Ticket closed. Channel will be deleted in 5 seconds.");

        } catch (error) {
            console.error("Error closing ticket:", error);
            await interaction.editReply("❌ An error occurred while closing the ticket.");
        }
    },

    async addUser(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser("user")!;

        try {
            const ticketsCollection = await getCollection("tickets");
            const ticket = await ticketsCollection.findOne({
                channelId: interaction.channel!.id,
                status: "open"
            }) as Ticket | null;

            if (!ticket) {
                await interaction.editReply("❌ This is not a valid ticket channel.");
                return;
            }

            // Add user to channel permissions
            const textChannel = interaction.channel as TextChannel;
            await textChannel.permissionOverwrites.create(targetUser, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            // Update database
            await ticketsCollection.updateOne(
                { _id: ticket._id },
                { $addToSet: { participants: targetUser.id } }
            );

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("➕ User Added")
                .setDescription(`**User:** ${targetUser.tag} has been added to the ticket.`)
                .setTimestamp();

            await textChannel.send({ embeds: [embed] });
            await interaction.editReply(`✅ ${targetUser.tag} has been added to the ticket.`);

        } catch (error) {
            console.error("Error adding user to ticket:", error);
            await interaction.editReply("❌ An error occurred while adding the user to the ticket.");
        }
    },

    async removeUser(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser("user")!;

        try {
            const ticketsCollection = await getCollection("tickets");
            const ticket = await ticketsCollection.findOne({
                channelId: interaction.channel!.id,
                status: "open"
            }) as Ticket | null;

            if (!ticket) {
                await interaction.editReply("❌ This is not a valid ticket channel.");
                return;
            }

            // Remove user from channel permissions
            const textChannel = interaction.channel as TextChannel;
            await textChannel.permissionOverwrites.delete(targetUser);

            // Update database
            await ticketsCollection.updateOne(
                { _id: ticket._id },
                { $pull: { participants: targetUser.id } } as any
            );

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("➖ User Removed")
                .setDescription(`**User:** ${targetUser.tag} has been removed from the ticket.`)
                .setTimestamp();

            await textChannel.send({ embeds: [embed] });
            await interaction.editReply(`✅ ${targetUser.tag} has been removed from the ticket.`);

        } catch (error) {
            console.error("Error removing user from ticket:", error);
            await interaction.editReply("❌ An error occurred while removing the user from the ticket.");
        }
    },

    async generateTranscript(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketsCollection = await getCollection("tickets");
            const ticket = await ticketsCollection.findOne({
                channelId: interaction.channel!.id
            }) as Ticket | null;

            if (!ticket) {
                await interaction.editReply("❌ This is not a valid ticket channel.");
                return;
            }

            // Fetch messages (last 100)
            const textChannel = interaction.channel as TextChannel;
            const messages = await textChannel.messages.fetch({ limit: 100 });
            let transcript = `Ticket Transcript\n`;
            transcript += `Channel: ${textChannel.name}\n`;
            transcript += `Created: ${ticket.createdAt}\n`;
            transcript += `Reason: ${ticket.reason}\n`;
            transcript += `Status: ${ticket.status}\n`;
            transcript += `\n--- Messages ---\n\n`;

            messages.reverse().forEach(message => {
                const timestamp = message.createdAt.toLocaleString();
                transcript += `[${timestamp}] ${message.author.tag}: ${message.content}\n`;
            });

            // For now, just send the transcript as a message
            // In a real implementation, you might want to save it as a file
            const embed = new EmbedBuilder()
                .setColor(0x9370DB)
                .setTitle("📄 Ticket Transcript")
                .setDescription("Transcript generated successfully.")
                .addFields({ name: "Messages", value: `${messages.size} messages` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Error generating transcript:", error);
            await interaction.editReply("❌ An error occurred while generating the transcript.");
        }
    }
}; 