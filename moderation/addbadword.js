/**
 * This file handles everything needed for a user with permissions to add a bad word to the censored words list
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const fs = require('fs');
const path = require('path');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'addbadword',
  description: 'Add a bad word to the moderation list',
  async execute(message, args, client) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }

    //Make sure user has permission to use addbadwords
    const member = message.member;
    if (
      !member.permissions.has(PermissionsBitField.Flags.Administrator) &&
      !member.permissions.has(PermissionsBitField.Flags.ManageGuild) &&
      !member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    ) {
      return message.reply('You don\'t have the necessary permissions to add bad words.');
    }

    //Make sure words were added
    if (!args.length) {
      return message.reply(
        `Please provide one or more words to add.\nExample: \`${client.prefix}addbadword word1 word2\``
      );
    }

    //Normalize input to lowercase
    const newWords = args.map(w => w.toLowerCase());
    if (!Array.isArray(client.badWords)) client.badWords = [];
    let added = [];
    for (const word of newWords) { //For each word in badword array
      if (!word.trim()) continue; //Filter out whitespace
      if (!client.badWords.includes(word)) { //Filter out duplicates
        client.badWords.push(word); //Add word to list
        added.push(word); //Add word to final list for later
      }
    }
    if (!added.length) { //If no new words
      return message.reply('Those word(s) are already in the bad word list or invalid.');
    }

    //Find config file and read preset badwords
    const configPath = path.join(__dirname, '..', 'config.json');
    let config = {};
    try {
      const raw = fs.readFileSync(configPath, 'utf8'); //Read config file as text
      config = JSON.parse(raw); //Parse as object
    } catch (err) {
      console.warn('config.json not found or invalid, creating a new one.');
    }
    if (!Array.isArray(config.badWords)) { //Ensure badwords array exists in config file
      config.badWords = []; //Make it an empty array if doesn't exist
    }
    for (const word of added) { //For each newly added word
      if (!config.badWords.includes(word)) { //Remove duplicates from config file
        config.badWords.push(word); //Add to final array in config file
      }
    }
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8'); //Write back to disk
    } catch (err) {
      console.error('Failed to write config.json:', err);
      return message.reply(
        `Bad words are added but couldn't be saved to config.json.`
      );
    }
    return message.reply(
      `Added bad word(s): \`${added.join('`, `')}\``
    );
  },
};