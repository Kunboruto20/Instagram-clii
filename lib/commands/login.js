const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');

function loginCommand(program) {
  program
    .command('login <username> <password>')
    .description('Login to Instagram')
    .option('-s, --save-session', 'Save session for future use', true)
    .action(async (username, password, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        await client.login(username, password);
        
        console.log(chalk.green('🎉 Login successful!'));
        console.log(chalk.gray('You can now use other Instagram CLI commands.'));
        
      } catch (error) {
        console.error(chalk.red('❌ Login failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = loginCommand;
