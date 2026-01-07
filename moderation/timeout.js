/**
 * This file contains the methods needed to calculate and give a timeout
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { PermissionsBitField } = require('discord.js');

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000; //Max timeout is 28 days (in ms)

/**
 * This function parses an input string of time and modifies it to return the time in ms
 * @param {*} str a time string
 * @returns the time string in ms
 */
function parseDuration(str) {
  if (!str) return null; //Handle null time string
  const regex = /(\d+)([smhd])/gi; //Regular expression to find digits followed by s,m,h or d and finding all matches case-insensitive
  let match;
  let ms = 0;
  while ((match = regex.exec(str)) !== null) { //Find all matches Ex. 1h30m15s is 3 matches
    const value = parseInt(match[1], 10); //Converts value to integer
    const unit = match[2].toLowerCase(); //Extracts and normalizes the unit to lowecase
    if (unit === 's') ms += value * 1000; //Handle seconds to ms
    if (unit === 'm') ms += value * 60 * 1000; //Handle minutes to ms
    if (unit === 'h') ms += value * 60 * 60 * 1000; //Handle hours to ms
    if (unit === 'd') ms += value * 24 * 60 * 60 * 1000; //Handle days to ms
  }
  if (!ms) return null; //Handle invalid parse
  return ms;
}

/**
 * This function converts the ms back into format with days, hours, minutes, and seconds 
 * @param {*} ms the number of ms
 * @returns the number of ms in d, h, m, s format
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60; //Extract remaining seconds
  const minutes = Math.floor(ms / (60 * 1000)) % 60; //Extract remaining minutes
  const hours = Math.floor(ms / (60 * 60 * 1000)) % 24; //Extract remaining hours
  const days = Math.floor(ms / (24 * 60 * 60 * 1000)); //Extract total days
  const parts = [];
  if (days) parts.push(`${days}d`); //Store days (if any)
  if (hours) parts.push(`${hours}h`); //Store hours (if any)
  if (minutes) parts.push(`${minutes}m`); //Store minutes (if any)
  if (seconds) parts.push(`${seconds}s`); //Store seconds (if any)
  return parts.join(' ') || '0s'; //Return and join result to readable string (else, 0s)
}

module.exports = {
  name: 'timeout',
  description: 'Temporarily timeout a user. Usage: timeout @user 10m reason',
  async execute(message, args, client) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) { //Must have permissions
      return message.reply('You don\'t have permission to use this.');
    }
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) { //Bot must have permissions
      return message.reply('I don\'t have permission to timeout members.');
    }
    const target =
      message.mentions.members.first() || //Target member is first user mentioned
      (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null); //Fetch user by id (null if not found)
    if (!target) { //Handle not found
      return message.reply(
        `Please mention a user or provide a valid user ID.\nExample: \`${client.prefix}timeout @user 10m Spamming\``
      );
    }
    if (!target.moderatable) { //Handle not timeoutable
      return message.reply('I cannot timeout that user (they may have a higher or equal role to me).');
    }
    const durationArg = args[1]; //Duration input
    const durationMs = parseDuration(durationArg); //Duration to ms
    if (!durationMs) { //Handle invalid/no duration input
      return message.reply(
        `Please provide a valid duration.\nExamples: \`${client.prefix}timeout @user 10m reason\`, \`${client.prefix}timeout @user 1h30m reason\`\nUnits: \`s\`, \`m\`, \`h\`, \`d\``
      );
    }
    if (durationMs > MAX_TIMEOUT_MS) { //Make sure duration isn't more than max timeout
      return message.reply('Duration is too long. Max timeout is 28 days.');
    }
    const reason = args.slice(2).join(' ') || 'No reason provided'; //Reason for timeout

    //Excecute timeout
    try {
      await target.timeout(durationMs, reason);
      await message.reply(
        `Timed out ${target.user.tag} for ${formatDuration(durationMs)}.\nReason: ${reason}`
      );
    } catch (err) {
      console.error(err);
      await message.reply('There was an error trying to timeout that user.');
    }
  },
};