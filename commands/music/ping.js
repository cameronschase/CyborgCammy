/**
 * This file is a command where a user inputs {prefix}ping and the bot responds with Pong!
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

module.exports = {
  name: 'ping',
  description: 'Ping command',
  async execute(message, args) {
    await message.reply('Pong!');
  },
};