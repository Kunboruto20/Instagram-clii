const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { extractUsernameFromUrl } = require('../utils');

function followCommand(program) {
  program
    .command('follow <username>')
    .description('Follow a user')
    .action(async (username, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const cleanUsername = extractUsernameFromUrl(username);
        await client.followUser(cleanUsername);
        
      } catch (error) {
        console.error(chalk.red('❌ Follow failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = followCommand;
