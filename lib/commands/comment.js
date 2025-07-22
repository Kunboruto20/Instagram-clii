const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');

function commentCommand(program) {
  program
    .command('comment <postUrl> <message>')
    .description('Comment on a post')
    .action(async (postUrl, message, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        if (!postUrl.includes('instagram.com/p/')) {
          throw new Error('Invalid Instagram post URL. Expected format: https://www.instagram.com/p/POST_ID/');
        }

        if (!message.trim()) {
          throw new Error('Comment cannot be empty');
        }

        await client.commentPost(postUrl, message);
        
      } catch (error) {
        console.error(chalk.red('❌ Comment failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = commentCommand;
