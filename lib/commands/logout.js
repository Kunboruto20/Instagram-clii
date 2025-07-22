const chalk = require('chalk');
const inquirer = require('inquirer');
const { InstagramClient } = require('../instagram-client');

function logoutCommand(program) {
  program
    .command('logout [username]')
    .description('Logout from Instagram (removes saved session)')
    .option('-a, --all', 'Logout from all accounts')
    .action(async (username, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        if (options.all) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Are you sure you want to logout from all accounts?',
              default: false
            }
          ]);

          if (confirm) {
            await client.sessionManager.clearAllSessions();
            console.log(chalk.green('✅ Logged out from all accounts'));
          } else {
            console.log(chalk.yellow('Operation cancelled'));
          }
        } else {
          if (!username) {
            const status = await client.getStatus();
            if (status.activeSessions.length === 0) {
              console.log(chalk.yellow('No active sessions found'));
              return;
            }

            if (status.activeSessions.length === 1) {
              username = status.activeSessions[0].username;
            } else {
              const { selectedUsername } = await inquirer.prompt([
                {
                  type: 'list',
                  name: 'selectedUsername',
                  message: 'Select account to logout:',
                  choices: status.activeSessions.map(s => s.username)
                }
              ]);
              username = selectedUsername;
            }
          }

          await client.logout(username);
          console.log(chalk.green(`✅ Logged out from ${username}`));
        }
        
      } catch (error) {
        console.error(chalk.red('❌ Logout failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = logoutCommand;
