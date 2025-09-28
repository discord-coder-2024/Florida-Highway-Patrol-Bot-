const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// !ping command (send message)
client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    if (message.author.bot) {
      message.channel.send("You are a bot, and not permitted to request my `!ping` command!");
    } else {
      message.channel.send("Pong!");
    }
  }
});

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  await client.application.commands.create(
    new SlashCommandBuilder()
      .setName('slash-command-tester')
      .setDescription('Tests the bot\'s ability to use slash commands')
      .addChannelOption(option =>
        option.setName('channel')
          .setDescription('The channel to send the embed to.')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('content')
          .setDescription('The content of the embed to send.')
          .setRequired(true))
      .toJSON()
  );

  console.log('✅ Slash command registered dynamically.');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'slash-command-tester') {
    const embed = new EmbedBuilder()
      .setTitle('Slash command successful!')
      .setDescription(`This was a test of my ability to use slash commands! 
I have succeeded. 
The author of the command has requested that I include \`${interaction.options.getString('content')}\` in this embed.`)
      .setColor(0x5865F2)
      .setTimestamp();

    const channel = await client.channels.fetch(interaction.options.getChannel('channel').id);
    if (channel) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Embed sent!', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Channel not found!', ephemeral: true });
    }
  }
});

client.login('process.env.discord_token');