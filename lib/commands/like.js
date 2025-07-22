const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');

function likeCommand(program) {
  program
    .command('like <postUrl>')
    .description('Like a post')
    .action(async (postUrl, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        if (!postUrl.includes('instagram.com/p/')) {
          throw new Error('Invalid Instagram post URL. Expected format: https://www.instagram.com/p/POST_ID/');
        }

        await client.likePost(postUrl);
        
      } catch (error) {
        console.error(chalk.red('❌ Like failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = likeCommand;
