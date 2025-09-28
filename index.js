const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// !ping command (sends message instead of reply)
client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    if (message.author.bot) {
      message.channel.send("You are a bot, and not permitted to request my `!ping` command!");
    } else {
      message.channel.send("Pong!");
    }
  }
});

// Ready event
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Register slash commands
  const commands = [
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
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, 'YOUR_GUILD_ID'), // replace with your guild ID
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
});

// Handle slash command
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

client.login(process.env.TOKEN);
