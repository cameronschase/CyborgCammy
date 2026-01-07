/**
 * This file is everything needed for {prefix}queue
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { getQueue } = require("../../voicePlayer");


module.exports = {
  name: "queue",
  async execute(message) {
    const queue = getQueue(message.guild); //The queue
    if (!queue.length) return message.reply("Queue is empty.");

    const list = queue
      .map((q, i) => `${i + 1}. ${q.youtubeUrl}`) //Add number in queue then url like: 1. www.youtube.com/watch?v=whyrur3ad1n6thi5
      .slice(0, 10) //Show first 10 songs
      .join("\n"); //Output on individual lines
    message.reply(`Queue:\n${list}`);
  },
};