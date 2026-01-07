/**
 * This file calls the shuffle command from voicePlayer.js
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { shuffle } = require("../../voicePlayer");

module.exports = {
  name: "shuffle",
  async execute(message) {
    shuffle(message.guild); //The shuffle method from voicePlayer 
    message.reply("Queue shuffled.");
  },
};