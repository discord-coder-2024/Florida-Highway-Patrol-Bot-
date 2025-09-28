const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
    if (message.content === "!ping") {
      if (message.author.bot) 
        message.send("You are a bot, and not permitted to request my `!ping` command!")
    else 
    message.reply("Pong!");
  }
});
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('slash-command-tester')
    .setDescription('Tests the bots ability to use slash commands')
    .addChannelOption(option =>
      option
      .setName('channel')
      .setDescription('The channel to send the embed to.')
      .setRequired(true))
    .addStringOption(option =>
      option
      .setName('content')
      .setDescription('The content of the embed to send.')
      .setRequired(true))
];

client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'sendembed') {
    const embed = new EmbedBuilder()
      .setTitle('Slash command successful!')
      .setDescription(`This was a test of my ability to use slash commands! \n I have succeeded. \n The author of the command has requested that I include \`${interaction.options.getString('content')}\` in this embed.`)
      .setColor(0x5865F2)
      .setTimestamp();

    const channelId = interaction.options.getChannel('channel').id;
    const channel = await client.channels.fetch(channelId);

    if (channel) {
      channel.send({ embeds: [embed] });
      interaction.reply({ content: '✅ Embed sent!', ephemeral: true });
    } else {
      interaction.reply({ content: '❌ Channel not found!', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);