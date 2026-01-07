/**
 * This file puts everything together and loads all commands and behaviors the bot performs
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events, Collection } = require("discord.js"); //discord.js classes we will use
const config = require("./config.json");
const { handleBadWords } = require("./moderation/badWords");
const { pause, resume, skip, stop, shuffle } = require("./voicePlayer");

const client = new Client({ //Creates discord bot
  intents: [GatewayIntentBits.Guilds, //Bot can see servers
    GatewayIntentBits.GuildMessages, //Bot can receive messages
    GatewayIntentBits.MessageContent, //Bot can see messages sent in a server
    GatewayIntentBits.GuildMembers, //Bot can access information about members of a server
    GatewayIntentBits.GuildVoiceStates, //Bot can track voice channel activity
  ]
});

//Config
client.prefix = config.prefix;
client.badWords = Array.isArray(config.badWords) ? config.badWords : [];

//Commands
client.commands = new Collection();
/**
 * Recursive function for loading commands from every folder
 * @param {*} dir the folder being scanned for commands
 */
function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }); //All files inside dir
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name); //Absolute path
    if (entry.isDirectory()) { //If a folder
      loadCommands(fullPath); //Scan inside the folder
      continue;
    }
    if (!entry.name.endsWith(".js")) continue; //Must be js file if command
    const command = require(fullPath); //The command file
    if ("name" in command && "execute" in command) { //Command file must have name and execute
      client.commands.set(command.name, command);
    } else {
      console.warn(`Skipped ${fullPath} (missing name or execute)`);
    }
  }
}
loadCommands(path.join(__dirname, "commands")); //Load commands starting at commands folder

client.once(Events.ClientReady, (c) => { //Bot logs in
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`Prefix: ${client.prefix}`);
});

client.on(Events.MessageCreate, async (message) => { //If a message is sent in the server
  if (message.author.bot) return; //Ignore if bot sent it
  try {
    const handled = await handleBadWords(message, client); //Check for badwords and handle
    if (handled) return; //Ensure message was handled
  } catch (err) {
    console.error("BadWords error:", err);
  }
  if (!message.content.startsWith(client.prefix)) return; //Ignore messages that aren't commands

  //Parsing/handling command
  const args = message.content.slice(client.prefix.length).trim().split(/\s+/);
  const commandName = (args.shift() || "").toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  //Execute command
  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply("Error executing that command.");
  }
});

client.on(Events.InteractionCreate, async (interaction) => { //Interaction handler
  if (!interaction.isButton()) return; //Must be a button
  if (!interaction.guild) return; //Must be from a server
  try {
    switch (interaction.customId) { //See what button was pressed
      case "music_pause": //Pause button
        pause(interaction.guild);
        return interaction.reply({ content: "Paused", ephemeral: true });
      case "music_resume": //Resume button
        resume(interaction.guild);
        return interaction.reply({ content: "Resumed", ephemeral: true });
      case "music_skip": //Skip button
        skip(interaction.guild);
        return interaction.reply({ content: "Skipped", ephemeral: true });
      case "music_shuffle": //Shuffle button
        shuffle(interaction.guild);
        return interaction.reply({ content: "Queue shuffled", ephemeral: true });
      case "music_stop": //Stop button
        stop(interaction.guild);
        return interaction.reply({ content: "Stopped & cleared queue", ephemeral: true });
      default:
        return;
    }
  } catch (err) {
    console.error("Button error:", err);
    interaction.reply({
      content: "Music control failed.",
      ephemeral: true,
    });
  }
});

client.login(process.env.TOKEN); //Bot logs into discord