/**
 * This file contains the help command which guides a user on how to use the commands
 * @author Cameron Chase
 * cameron.chase@gmail.com
 * January 6, 2026
 */

module.exports = {
  name: 'help',
  description: 'Show a list of commands and what they do',
  async execute(message, args, client) {
    const prefix = client.prefix;
    let helpMessage = `Command List\n`;
    helpMessage += `Prefix: \`${prefix}\`\n\n`; //Display prefix
    client.commands.forEach(cmd => { 
      const desc = cmd.description || 'No description provided';
      helpMessage += `${prefix}${cmd.name} -> ${desc}\n`; //Display every command and its description on its own line
    });
    message.channel.send(helpMessage);
  },
};