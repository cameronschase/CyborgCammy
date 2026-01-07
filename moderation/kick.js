/**
 * This file handles the kick method to remove a member from a server
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'kick',
  description: 'Kick a member from the server',
  async execute(message, args) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) { //Must have permission
      return message.reply('You do not have permission to kick members.');
    }
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) { //Bot must have permission
      return message.reply('I do not have permission to kick members.');
    }
    const target =
      message.mentions.members.first() || //Target is the first user mentioned
      (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null): null); //Fetch the user by id (if user not found then null)
    if (!target) { //Handle user not found
      return message.reply('Please mention a user or provide a valid user ID.');
    }
    if (!target.kickable) { //Handle unkickable user
      return message.reply('I cannot kick that user (they might have a higher role than me).');
    }
    const reason = args.slice(1).join(' ') || 'No reason provided'; //Reason for ban
    
    //Execute kick
    try {
      await target.kick(reason);
      await message.reply(`Kicked ${target.user.tag} | Reason: ${reason}`);
    } catch (err) {
      console.error(err);
      await message.reply('There was an error trying to kick that user.');
    }
  },
};