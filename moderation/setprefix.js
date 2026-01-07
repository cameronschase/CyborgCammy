/**
 * This file is the command to change/set the prefix
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const fs = require('fs');
const path = require('path');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setprefix',
  description: 'Change the bot prefix',
  async execute(message, args, client) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }

    //Make sure user has permission
    const member = message.member;
    if (
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      !member.permissions.has(PermissionsBitField.Flags.ManageGuild)
    ) {
      return message.reply('You don\'t have permission to change the prefix.');
    }

    //Handle new prefix
    const newPrefix = args[0];
    if (!newPrefix) { //Make sure the suer input a new prefix
      return message.reply(
        `Please provide a new prefix.\nExample: \`${client.prefix}setprefix ?\``
      );
    }
    if (newPrefix.length > 5) { //Make sure prefix is between 1-5 characters long
      return message.reply('Please choose a prefix between 1 and 5 characters long.');
    }
    client.prefix = newPrefix; //Update prefix for file
    const configPath = path.join(__dirname, '..', 'config.json'); //Update prefix in config.json
    let config = {};
    try {
      const raw = fs.readFileSync(configPath, 'utf8'); //Read config.json
      config = JSON.parse(raw); //Parse as object
    } catch (err) {
      console.warn('config.json not found or invalid, creating a new one.');
    }
    config.prefix = newPrefix; //Set new prefix in object
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8'); //Write back to disk
    } catch (err) {
      console.error('Failed to write config.json:', err);
      return message.reply(
        'Prefix changed for now, but I failed to save it to config.json. It might reset on restart.'
      );
    }
    return message.reply(`Prefix updated to \`${newPrefix}\``);
  },
};