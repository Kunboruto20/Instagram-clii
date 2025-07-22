const chalk = require('chalk');
const fs = require('fs-extra');
const { InstagramClient } = require('../instagram-client');
const { extractUsernameFromUrl, delay } = require('../utils');

function bulkSendCommand(program) {
  program
    .command('bulk-send <userListFile> <message>')
    .description('Send a message to multiple users from a file (one username per line)')
    .option('-d, --delay <ms>', 'Delay between messages in milliseconds', '5000')
    .option('--dry-run', 'Preview the operation without sending messages')
    .action(async (userListFile, message, options) => {
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
        if (isNaN(delayMs) || delayMs < 1000) {
          throw new Error('Delay must be at least 1000ms (1 second)');
        }

        console.log(chalk.blue(`📋 Found ${usernames.length} users to message`));
        console.log(chalk.gray(`Message: "${message}"`));
        console.log(chalk.gray(`Delay between messages: ${delayMs}ms`));

        if (options.dryRun) {
          console.log(chalk.yellow('\n🔍 DRY RUN - No messages will be sent\n'));
          usernames.forEach((username, index) => {
            console.log(`${chalk.cyan(`${index + 1}.`)} Would send to: ${chalk.blue(`@${username}`)}`);
          });
          return;
        }

        console.log(chalk.yellow('\n⚠️  Starting bulk message sending...'));
        console.log(chalk.red('Make sure you comply with Instagram\'s Terms of Service!'));
        
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < usernames.length; i++) {
          const username = usernames[i];
          try {
            console.log(chalk.gray(`\nSending ${i + 1}/${usernames.length} to @${username}...`));
            await client.sendMessage(username, message);
            successCount++;
            
            // Add delay between messages (except for the last one)
            if (i < usernames.length - 1) {
              console.log(chalk.gray(`Waiting ${delayMs}ms before next message...`));
              await delay(delayMs);
            }
          } catch (error) {
            console.error(chalk.red(`❌ Failed to send to @${username}: ${error.message}`));
            failCount++;
            
            // If rate limited, wait longer
            if (error.message.includes('rate limit')) {
              console.log(chalk.yellow('Rate limit detected, waiting 60 seconds...'));
              await delay(60000);
            }
          }
        }

        console.log(chalk.green(`\n✅ Bulk sending completed!`));
        console.log(chalk.green(`Successfully sent: ${successCount}`));
        console.log(chalk.red(`Failed: ${failCount}`));
        
      } catch (error) {
        console.error(chalk.red('❌ Bulk send failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = bulkSendCommand;