/**
 * This file is everything needed to play audio through the bot
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");
const prism = require("prism-media");
const { exec } = require("yt-dlp-exec");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * This function converts a youtube link into a direct stream url
 * @param {*} youtubeUrl the youtubeurl
 * @returns the direct stream url
 */
async function resolveAudioUrl(youtubeUrl) {
  const { stdout } = await exec(youtubeUrl, {
    format: "bestaudio",
    getUrl: true,
    noWarnings: true,
  });
  return stdout.trim();
}

/**
 * This function returns or creates if not present, the audio state for a server
 * @param {*} client the bot
 * @param {*} guild the server
 * @returns the voice states for the server
 */
function getState(client, guild) {
  if (!client._voiceStates) client._voiceStates = new Map(); //Create voice states if inexistent
  if (!client._voiceStates.has(guild.id)) { //Create server state if inexistent
    const player = createAudioPlayer({ //Create audio plauer for the server
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause }, //Pause player if nobody's listening
    });
    client._voiceStates.set(guild.id, { //Sets states
      connection: null, //Voice connection (initially none)
      player, //Audio plauer
      queue: [], //Queue array of youtubeurls (initially empty)
      playing: false, //Initially nothing playing
      textChannel: null, //Where bot responses will be sent
    });
  }
  return client._voiceStates.get(guild.id);
}

/**
 * This function plays the next item in the queue
 * @param {*} guild the server
 * @returns recurisvely plays songs from queue
 */
async function playNext(guild) {
  const state = getState(guild.client, guild); //Load server state
  if (state.playing) return; //Don't play next if something is already playing
  if (!state.queue.length) return; //If queue is empty do nothing
  const { youtubeUrl } = state.queue.shift(); //Pop first youtubeurl in queue
  state.playing = true; //Change boolean to currently playing
  const audioUrl = await resolveAudioUrl(youtubeUrl); //Convert youtubeurl to direct stream url
  const ffmpeg = new prism.FFmpeg({
    args: [
      "-i", audioUrl,
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
    ],
  });
  const resource = createAudioResource(ffmpeg, {
    inputType: StreamType.Raw,
  });
  state.player.play(resource); //Start playback

  //Buttons for music plauer
  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("music_pause").setLabel("Pause").setStyle(ButtonStyle.Secondary), //Pause button
    new ButtonBuilder().setCustomId("music_resume").setLabel("Resume").setStyle(ButtonStyle.Success), //Resume button
    new ButtonBuilder().setCustomId("music_skip").setLabel("Skip").setStyle(ButtonStyle.Primary), //Skip button
    new ButtonBuilder().setCustomId("music_shuffle").setLabel("Shuffle").setStyle(ButtonStyle.Secondary), //Shuffle button
    new ButtonBuilder().setCustomId("music_stop").setLabel("Stop").setStyle(ButtonStyle.Danger), //Stop button
  );

  state.textChannel?.send({ //Bot response
    content: `Now playing\n${youtubeUrl}`,
    components: [controls],
  });
  state.player.once(AudioPlayerStatus.Idle, () => { //Play next song from queue when finished
    state.playing = false;
    playNext(guild);
  });
}

/**
 * This function enqueues a song and starts playing if no song is currently playing
 * @param {*} param0 get state details
 */
async function enqueue({ guild, voiceChannel, textChannel, youtubeUrl }) {
  const state = getState(guild.client, guild); //State object for the server
  state.textChannel = textChannel; //Bot response location
  if (!state.connection) { //If bot not in voice channel
    state.connection = joinVoiceChannel({ //Join voice channel
      channelId: voiceChannel.id, //Voice channel to join
      guildId: guild.id, //Server the voice channel is in
      adapterCreator: guild.voiceAdapterCreator, //Discord voice connections adapter
      selfDeaf: false, //Bot isn't deafened
    });
    state.connection.subscribe(state.player); //Send audio to channel
  }
  state.queue.push({ youtubeUrl }); //Add new queue object to end of queue
  if (!state.playing) { //If nothing is playing
    await playNext(guild); //Start playback
  } else { //Otherwise, add to queue
    textChannel.send(`Added to queue: ${youtubeUrl}`);
  }
}

/**
 * This function skips a track
 * @param {*} guild the server
 */
function skip(guild) {
  const state = getState(guild.client, guild);
  state.player.stop(); //Stops playback, then playNext will see nothings playing and will start next song in queue
}

/**
 * This function stops the music
 * @param {*} guild the server
 */
function stop(guild) {
  const state = getState(guild.client, guild);
  state.queue = []; //Clear queue
  state.player.stop(); //Stops playback
}

/**
 * This function shuffles the queue
 * @param {*} guild the server
 */
function shuffle(guild) {
  const state = getState(guild.client, guild);
  for (let i = state.queue.length - 1; i > 0; i--) { //For each track in the queue
    const j = Math.floor(Math.random() * (i + 1)); //Get random index of an entry in the queue
    [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]]; //Swap the items at a given index and the random index
  }
}

/**
 * This function pauses the music
 * @param {} guild the server
 */
function pause(guild) {
  getState(guild.client, guild).player.pause();
}

/**
 * This function resumes the music
 * @param {} guild the server
 */
function resume(guild) {
  getState(guild.client, guild).player.unpause();
}

/**
 * This function gets the queue
 * @param {} guild the server
 * @returns the queue
 */
function getQueue(guild) {
  return getState(guild.client, guild).queue;
}

module.exports = {
  enqueue,
  skip,
  stop,
  shuffle,
  pause,
  resume,
  getQueue,
};