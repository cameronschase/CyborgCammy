/**
 * This file calls the skip method from voicePlayer.js
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { skip } = require("../../voicePlayer");

module.exports = {
  name: "skip",
  async execute(message) {
    skip(message.guild); //The skip method from voicePlayer 
    message.reply("Skipped.");
  },
};