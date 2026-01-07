/**
 * This file handles the stop command which stops the song, clears the queue, and disconnects the bot from the voice channel
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

module.exports = {
  name: 'stop',
  description: 'Stop playback and clear the queue',
  async execute(message, args, client) {
    if (!message.guild) return; //Must be in a server
    const queue = client.player?.nodes.get(message.guild.id); //Retrieves the queue (or undefined)
    if (!queue || !queue.node.isPlaying()) { //If there is no queue or nothing is playing
      return message.reply('Nothing is playing right now.');
    }
    queue.delete(); //Clear queue by deleting it, stops playback, disconnects bot
    message.channel.send('Stopped playback and cleared the queue.');
  },
};