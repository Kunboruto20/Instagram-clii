const chalk = require('chalk');
const fs = require('fs-extra');
const { InstagramClient } = require('../instagram-client');
const { extractUsernameFromUrl, delay } = require('../utils');

function bulkFollowCommand(program) {
  program
    .command('bulk-follow <userListFile>')
    .description('Follow multiple users from a file (one username per line)')
    .option('-d, --delay <ms>', 'Delay between follows in milliseconds', '10000')
    .option('--dry-run', 'Preview the operation without following users')
    .action(async (userListFile, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        // Read usernames from file
        if (!await fs.pathExists(userListFile)) {
          throw new Error(`User list file not found: ${userListFile}`);
        }

        const fileContent = await fs.readFile(userListFile, 'utf8');
        const usernames = fileContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(username => extractUsernameFromUrl(username));

        if (usernames.length === 0) {
          throw new Error('No valid usernames found in the file');
        }

        const delayMs = parseInt(options.delay, 10);
        if (isNaN(delayMs) || delayMs < 5000) {
          throw new Error('Delay must be at least 5000ms (5 seconds) for follows');
        }

        console.log(chalk.blue(`📋 Found ${usernames.length} users to follow`));
        console.log(chalk.gray(`Delay between follows: ${delayMs}ms`));

        if (options.dryRun) {
          console.log(chalk.yellow('\n🔍 DRY RUN - No follows will be performed\n'));
          usernames.forEach((username, index) => {
            console.log(`${chalk.cyan(`${index + 1}.`)} Would follow: ${chalk.blue(`@${username}`)}`);
          });
          return;
        }

        console.log(chalk.yellow('\n⚠️  Starting bulk follow operation...'));
        console.log(chalk.red('Make sure you comply with Instagram\'s Terms of Service!'));
        
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < usernames.length; i++) {
          const username = usernames[i];
          try {
            console.log(chalk.gray(`\nFollowing ${i + 1}/${usernames.length}: @${username}...`));
            await client.followUser(username);
            successCount++;
            
            // Add delay between follows (except for the last one)
            if (i < usernames.length - 1) {
              console.log(chalk.gray(`Waiting ${delayMs}ms before next follow...`));
              await delay(delayMs);
            }
          } catch (error) {
            console.error(chalk.red(`❌ Failed to follow @${username}: ${error.message}`));
            failCount++;
            
            // If rate limited, wait longer
            if (error.message.includes('rate limit')) {
              console.log(chalk.yellow('Rate limit detected, waiting 2 minutes...'));
              await delay(120000);
            }
          }
        }

        console.log(chalk.green(`\n✅ Bulk follow completed!`));
        console.log(chalk.green(`Successfully followed: ${successCount}`));
        console.log(chalk.red(`Failed: ${failCount}`));
        
      } catch (error) {
        console.error(chalk.red('❌ Bulk follow failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = bulkFollowCommand;