require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

// In-memory storage for infractions
const infractions = {};

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!infract')) {
    const args = message.content.split(' ').slice(1);

    if (args.length < 4) {
      return message.reply('Usage: `!infract {userID} {reason} {notes} {expiration}`');
    }

    const [userID, reason, notes, expirationStr] = args;
    const expiration = parseInt(expirationStr);

    if (isNaN(expiration)) {
      return message.reply('❌ Expiration must be a valid Unix timestamp.');
    }

    // Store infraction
    if (!infractions[userID]) infractions[userID] = [];
    infractions[userID].push({
      reason,
      notes,
      expiration,
      issuedBy: message.author.id,
      timestamp: Date.now()
    });

    // Create an embed
    const embed = new EmbedBuilder()
      .setTitle('⚠️ User Infraction Issued')
      .setColor(0xff0000)
      .addFields(
        { name: 'User', value: `<@${userID}> (${userID})`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Notes', value: notes },
        { name: 'Expiration', value: `<t:${Math.floor(expiration / 1000)}:F>`, inline: true },
        { name: 'Issued By', value: `<@${message.author.id}>`, inline: true },
      )
      .setTimestamp();

    // Send embed to the new log channel and ping the user
    try {
      const logChannel = await message.guild.channels.fetch('1421861782430945282');
      if (logChannel) {
        logChannel.send({
          content: `<@${userID}>`,
          embeds: [embed]
        });
        message.reply(`✅ Infraction issued for <@${userID}>. Logged in the moderation channel.`);
      } else {
        message.reply('❌ Could not find the moderation log channel.');
      }
    } catch (error) {
      console.error(error);
      message.reply('❌ Failed to log infraction.');
    }
  }
});

client.login(process.env.TOKEN);