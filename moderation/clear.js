/**
 * This file is the clear command which purges a specified number of messages from a text channel
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * Janaury 6, 2026
 */

const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Clear a number of messages',
  async execute(message, args) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { //Must have permissions
      return message.reply('You do not have permission to manage messages.');
    }
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) { //Bot must have permissions
      return message.reply('I do not have permission to manage messages.');
    }
    const amount = parseInt(args[0], 10); //Number of message to purge (in base10) 

    if (isNaN(amount) || amount < 1 || amount > 100) { //For simplicity, must be a number between 1-100
      return message.reply('Please specify a number between 1 and 100.');
    }
    try {
      const deleted = await message.channel.bulkDelete(amount, true); //Deletion
      const confirmation = await message.channel.send( //Confirmation message (appears for 5s in text channel after success)
        `Deleted ${deleted.size} messages.`
      );
      setTimeout(() => confirmation.delete().catch(() => {}), 5000);
    } catch (err) {
      console.error(err);
      await message.reply(
        'There was an error trying to delete messages. I cannot delete messages older than 14 days.'
      );
    }
  },
};