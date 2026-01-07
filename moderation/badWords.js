/**
 * This file handles what to do with bad words
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

/**
 * This function configures and handles what to do with bad words
 * @param {*} message the message someone sent
 * @param {*} client the person who sent the message
 * @returns a boolean indicating if a bad word was found in the message
 */
async function handleBadWords(message, client) {
  const badWords = Array.isArray(client.badWords) ? client.badWords : []; //Load badwords from index.js
  if (!badWords.length) return false; //If no bad words configured
  const content = (message.content || '').toLowerCase(); //Make message lowercase
  const found = badWords.find(
    (w) => w && content.includes(w.toLowerCase())); //Find if any bad word is included in the message

  if (!found) return false; //If no bad words in message

  //Handle bad word if detected
  try {
    await message.delete();
    await message.channel.send(
      `${message.author}, your message was removed for using a banned word.`
    );
  } catch (err) {
    console.error('Failed to delete message:', err);
  }
  return true;
}

module.exports = { handleBadWords };