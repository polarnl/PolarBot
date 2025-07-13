# PolarBot - Discord Moderation & Scheduling Bot

A comprehensive Discord bot built with TypeScript and Discord.js v14, featuring moderation tools, scheduling/reminders, and a ticket system.

## 🚀 Features

### 🔨 Moderation Commands
- **`/kick @user [reason]`** - Kick a user from the server
- **`/ban @user [reason]`** - Ban a user from the server  
- **`/mute @user [time] [reason]`** - Mute a user for a specified time
- **`/unmute @user`** - Remove timeout from a user
- **`/warn @user [reason]`** - Warn a user (logged but no action taken)
- **`/infractions @user`** - View a user's moderation history

### 🗓️ Scheduling & Reminders
- **`/remind [time] [message]`** - Set a one-time reminder
  - Examples: `/remind 30m Drink water!` or `/remind every 2h Move for a moment!`
- **`/schedule-event [time] [message]`** - Schedule a daily event at specific time
  - Example: `/schedule-event 00:00 Start your day right!`
- **`/view-events`** - View all your active reminders and events

### 🎫 Ticket System
- **`/ticket open [reason]`** - Create a new support ticket
- **`/ticket close`** - Close the current ticket
- **`/ticket add @user`** - Add a user to the ticket
- **`/ticket remove @user`** - Remove a user from the ticket
- **`/ticket transcript`** - Generate a transcript of the ticket

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Discord Bot Token

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd polarBot
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Discord Bot Configuration
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_guild_id_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/polarBot
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/polarBot
```

### 3. Bot Permissions
Ensure your bot has the following permissions:
- **Administrator** (recommended) or the following specific permissions:
  - Manage Channels
  - Kick Members
  - Ban Members
  - Moderate Members
  - Send Messages
  - Embed Links
  - Read Message History
  - Use Slash Commands

### 4. Build and Run
```bash
# Build the TypeScript code
npm run build

# Start the bot
npm start

# Or for development with auto-reload
npm run dev
```

## 📋 Command Usage Examples

### Moderation
```bash
/kick @user Spamming in general chat
/ban @user Repeated rule violations
/mute @user 30m Inappropriate language
/warn @user Please follow the rules
/infractions @user
```

### Scheduling
```bash
/remind 30m Take a break and stretch!
/remind every 2h Drink water and move around
/schedule-event 09:00 Good morning! Time to start your day
/view-events
```

### Tickets
```bash
/ticket open Need help with the bot
/ticket add @moderator
/ticket remove @user
/ticket transcript
```

## 🗄️ Database Collections

The bot uses MongoDB with the following collections:

- **`infractions`** - Stores moderation actions (kicks, bans, mutes, warnings)
- **`reminders`** - Stores scheduled reminders and events
- **`tickets`** - Stores ticket information and participants

## 🔧 Technical Details

- **Framework**: Discord.js v14
- **Language**: TypeScript
- **Database**: MongoDB
- **Scheduling**: node-cron
- **Time Parsing**: ms library

## 🚨 Important Notes

1. **MongoDB Required**: The bot requires a MongoDB connection for all features
2. **Permissions**: Ensure the bot has proper permissions in your Discord server
3. **Rate Limits**: Be mindful of Discord's rate limits when using moderation commands
4. **Backup**: Regularly backup your MongoDB database

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding to commands**
   - Check if the bot token is correct
   - Ensure the bot has proper permissions
   - Verify the bot is online

2. **MongoDB connection errors**
   - Check your MongoDB URI
   - Ensure MongoDB is running
   - Verify network connectivity

3. **Commands not registering**
   - Check CLIENT_ID and GUILD_ID in .env
   - Ensure the bot has the `applications.commands` scope

### Logs
The bot provides detailed console logs for debugging. Check the console output for error messages and status updates.

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Created by @Boris | Built with TypeScript + Discord.js** 