/**
 * This file is the joke command which randomly selects a CS joke to tell
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

const jokes = [
  "Why do JavaScript developers wear glasses? Because they don't C#.",
  "I told my computer I needed a break… now it won’t stop sending me KitKat ads.",
  "There are 10 types of people in this world: those who understand binary and those who don’t.",
  "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
  "I would tell you a UDP joke, but you might not get it.",
  "Debugging: Being the detective in a crime movie where you are also the murderer.",
  "I changed my password to 'incorrect' so whenever I forget it, the computer will say 'Your password is incorrect.'"
];

module.exports = {
  name: 'joke',
  description: 'Tells you a random CS joke',
  async execute(message, args, client) {
    if (!jokes.length) { //Make sure there are jokes to tell
      return message.reply('I have no jokes configured right now');
    }
    const joke = jokes[Math.floor(Math.random() * jokes.length)]; //Pick a random joke
    await message.channel.send(joke);
  },
};