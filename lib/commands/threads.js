
const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { formatThread } = require('../utils');

function threadsCommand(program) {
  program
    .command('threads [limit]')
    .alias('groups')
    .description('List your direct message threads and groups')
    .option('-l, --limit <number>', 'Number of threads to display', '20')
    .action(async (limit, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const threadLimit = parseInt(options.limit || limit || '20', 10);
        
        if (isNaN(threadLimit) || threadLimit < 1 || threadLimit > 100) {
          throw new Error('Limit must be a number between 1 and 100');
        }

        const threads = await client.getDirectThreads(threadLimit);
        
        console.log(chalk.blue(`\n💬 Your Instagram Direct Messages & Groups (${threads.length} threads):`));
        console.log(chalk.gray('─'.repeat(80)));
        
        if (threads.length === 0) {
          console.log(chalk.yellow('No threads found in your inbox.'));
          return;
        }

        threads.forEach((thread, index) => {
          console.log(`${chalk.cyan(`${index + 1}.`)} ${formatThread(thread)}`);
        });
        
        console.log(chalk.gray('\n💡 Tip: Use "instagram-cli send <username> <message>" to send messages'));
        
      } catch (error) {
        console.error(chalk.red('❌ Failed to fetch threads:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = threadsCommand;
