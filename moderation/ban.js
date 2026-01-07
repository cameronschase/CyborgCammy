/**
 * This file is the command to ban a user from a server
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * Janaury 6, 2026
 */

const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Ban a member from the server',
  async execute(message, args) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) { //Must have permission
      return message.reply('You do not have permission to ban members.');
    }
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) { //Bot must have permission
      return message.reply('I do not have permission to ban members.');
    }

    const target =
      message.mentions.members.first() || //Get first user mentioned in the message
      (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null): null); //Fetch guid member by id (null if not found)
    if (!target) { //Handle user not found
      return message.reply('Please mention a user or provide a valid user ID.');
    }
    if (!target.bannable) { //Handle user not bannable
      return message.reply('I cannot ban that user (they might have a higher role than me).');
    }
    const reason = args.slice(1).join(' ') || 'No reason provided'; //Build the ban reason
    
    //Perform the ban
    try {
      await target.ban({ reason });
      await message.reply(`Banned ${target.user.tag} | Reason: ${reason}`);
    } catch (err) {
      console.error(err);
      await message.reply('There was an error trying to ban that user.');
    }
  },
};