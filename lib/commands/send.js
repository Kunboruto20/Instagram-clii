const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { extractUsernameFromUrl } = require('../utils');

function sendCommand(program) {
  program
    .command('send <target> <message>')
    .description('Send a direct message to a user or group thread')
    .option('-g, --group', 'Send to a group thread by name')
    .option('-t, --thread-id <id>', 'Send to a specific thread ID')
    .action(async (target, message, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });
        
        if (!message.trim()) {
          throw new Error('Message cannot be empty');
        }

        if (options.threadId) {
          // Send to specific thread ID
          console.log(chalk.blue(`📤 Sending message to thread ID: ${options.threadId}`));
          await client.sendMessageToThread(options.threadId, message);
        } else if (options.group) {
          // Send to group by name
          console.log(chalk.blue(`📤 Searching for group: "${target}"`));
          const thread = await client.findThreadByName(target);
          console.log(chalk.green(`✅ Found group: "${thread.thread_title}"`));
          await client.sendMessageToThread(thread.thread_id, message);
        } else {
          // Send to individual user
          const cleanUsername = extractUsernameFromUrl(target);
          console.log(chalk.blue(`📤 Sending message to user: @${cleanUsername}`));
          await client.sendMessage(cleanUsername, message);
        }
        
      } catch (error) {
        console.error(chalk.red('❌ Send failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = sendCommand;
