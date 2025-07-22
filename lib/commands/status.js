const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');

function statusCommand(program) {
  program
    .command('status')
    .description('Show current login status and active sessions')
    .action(async (options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const status = await client.getStatus();
        
        console.log(chalk.blue('\n📊 Instagram CLI Status:'));
        console.log(chalk.gray('─'.repeat(40)));
        
        if (status.activeSessions.length === 0) {
          console.log(chalk.red('❌ Not logged in'));
          console.log(chalk.gray('Use "instagram-cli login <username> <password>" to login'));
        } else {
          console.log(chalk.green(`✅ Logged in (${status.activeSessions.length} active session(s))`));
          console.log(chalk.blue('\nActive Sessions:'));
          
          status.activeSessions.forEach((session, index) => {
            const lastLogin = new Date(session.lastLogin).toLocaleString();
            console.log(`${chalk.cyan(`${index + 1}.`)} ${chalk.bold(session.username)} - Last login: ${chalk.gray(lastLogin)}`);
          });
        }
        
      } catch (error) {
        console.error(chalk.red('❌ Failed to get status:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = statusCommand;
