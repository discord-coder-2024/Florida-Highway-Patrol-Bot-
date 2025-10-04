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
    // Remove the command itself and join the rest of the message
    const rawArgs = message.content.slice('!infract'.length).trim();

    // Split by '|'
    const args = rawArgs.split('|').map(arg => arg.trim());

    if (args.length < 4) {
      return message.reply('Usage: `!infract userID | reason | notes | expiration`');
    }

    const [userID, reason, notes, expirationStr] = args;
    const expiration = parseInt(expirationStr);

    if (isNaN(expiration)) {
      return message.reply("It seems like the expiration you provided is not in the valid timestamp format. Please ensure that all arguments are separated by \'|\' symbols. Timestamps should be in Unix format or 'none'. \n\n -# 'none' is none operational at this time. Please open a support ticket for the ETA.");
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
  .setTitle('An Infraction Has Been Issued')
  .setColor(0xff0000)
  .setDescription(`**User:** <@${userID}> '(${userID})'\n**Reason:** ${reason}\n**Expiration:** <t:${Math.floor(expiration / 1000)}:F>\n**Issued By:** <@${message.author.id}>`)
  .addField('Notes', notes)
  .setTimestamp();

    // Send embed to log channel and ping user
    try {
      const logChannel = await message.guild.channels.fetch('1421861782430945282');
      if (logChannel) {
        logChannel.send({
          content: `${userID.username}, you have received an infraction.`,
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
