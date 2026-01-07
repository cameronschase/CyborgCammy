/**
 * This file is the server stats command
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * Janaury 6, 2026
 */

const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Show server statistics',
  async execute(message, args) {
    if (!message.guild) { //Must be in a server
      return message.reply('This command only works in servers.');
    }
    await message.guild.members.fetch(); //Fetch members
    const totalMembers = message.guild.memberCount; //Number of members
    const botCount = message.guild.members.cache.filter((m) => m.user.bot).size; //Number of bots
    const humanCount = totalMembers - botCount; //Number of humans
    const textChannels = message.guild.channels.cache.filter( //Number of text channels
      (c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = message.guild.channels.cache.filter( //Number of voice channels
      (c) => c.type === ChannelType.GuildVoice).size;

    //Build embed for the server stats
    const embed = new EmbedBuilder()
      .setTitle(`Server Stats for ${message.guild.name}`)
      .setThumbnail(message.guild.iconURL({ size: 1024 }))
      .addFields(
        { name: 'Total Members', value: `${totalMembers}`, inline: true },
        { name: 'Humans', value: `${humanCount}`, inline: true },
        { name: 'Bots', value: `${botCount}`, inline: true },
        { name: 'Text Channels', value: `${textChannels}`, inline: true },
        { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
        { name: 'Server ID', value: `${message.guild.id}`, inline: false },
      )
      .setColor(0x5865f2)
      .setTimestamp();
    await message.channel.send({ embeds: [embed] });
  },
};