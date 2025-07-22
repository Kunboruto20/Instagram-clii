
const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');

function groupSendCommand(program) {
  program
    .command('group-send <groupName> <message>')
    .alias('gs')
    .description('Send a message to a group by name (searches in thread titles)')
    .action(async (groupName, message, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });
        
        if (!message.trim()) {
          throw new Error('Message cannot be empty');
        }

        console.log(chalk.blue(`🔍 Searching for group: "${groupName}"`));
        
        const thread = await client.findThreadByName(groupName);
        
        console.log(chalk.green(`✅ Found group: "${thread.thread_title}"`));
        console.log(chalk.gray(`   Thread ID: ${thread.thread_id}`));
        console.log(chalk.gray(`   Participants: ${thread.users.filter(u => !u.is_viewer).length} members`));
        
        console.log(chalk.blue(`📤 Sending message to group...`));
        await client.sendMessageToThread(thread.thread_id, message);
        
      } catch (error) {
        console.error(chalk.red('❌ Group send failed:'), error.message);
        if (error.message.includes('not found')) {
          console.log(chalk.yellow('\n💡 Tip: Use "instagram-cli threads" to see available groups'));
        }
        process.exit(1);
      }
    });
}

module.exports = groupSendCommand;
