const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { extractUsernameFromUrl } = require('../utils');

function unfollowCommand(program) {
  program
    .command('unfollow <username>')
    .description('Unfollow a user')
    .action(async (username, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const cleanUsername = extractUsernameFromUrl(username);
        await client.unfollowUser(cleanUsername);
        
      } catch (error) {
        console.error(chalk.red('❌ Unfollow failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = unfollowCommand;
