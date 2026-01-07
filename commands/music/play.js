/**
 * This file is everything required to use the {prefix}play command
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const { findBestVideoId } = require("../../youtubeSearch");
const { enqueue } = require("../../voicePlayer");

/**
 * This function determines if a string is part of a url
 * @param {*} str a string
 * @returns boolean value indicating if a string is part of a url
 */
function isUrl(str) {
  return /^https?:\/\//i.test(str);
}

module.exports = {
  name: "play",
  async execute(message, args) {
    const input = args.join(" ").trim();
    if (!input) return message.reply("Usage: !play <song or YouTube URL>");
    const vc = message.member.voice.channel; //Voice channel the user is in
    if (!vc) return message.reply("Join a voice channel first.");

    let youtubeUrl;
    if (isUrl(input)) { //If given a url save it
      youtubeUrl = input;
    } else { //If not a url
      const id = await findBestVideoId(input); //Find id of video that is most closely related to the search string
      if (!id) return message.reply("No results found."); //If no ids are found
      youtubeUrl = `https://www.youtube.com/watch?v=${id}`; //The youtube link to play
    }

    //Queue the track
    await enqueue({
      guild: message.guild, //The server to play in
      voiceChannel: vc, //The voice channel to play in
      textChannel: message.channel, //The text channel to put messages
      youtubeUrl, //The url of youtube video to play
    });
  },
};