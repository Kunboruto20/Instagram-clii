const { Command } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

// Import commands
const loginCommand = require('./commands/login');
const logoutCommand = require('./commands/logout');
const statusCommand = require('./commands/status');
const sendCommand = require('./commands/send');
const bulkSendCommand = require('./commands/bulk-send');
const groupSendCommand = require('./commands/group-send');
const postCommand = require('./commands/post');
const storyCommand = require('./commands/story');
const followCommand = require('./commands/follow');
const unfollowCommand = require('./commands/unfollow');
const bulkFollowCommand = require('./commands/bulk-follow');
const likeCommand = require('./commands/like');
const commentCommand = require('./commands/comment');
const feedCommand = require('./commands/feed');
const searchCommand = require('./commands/search');
const threadsCommand = require('./commands/threads');
const chatCommand = require('./commands/chat');
const liveChatCommand = require('./commands/live-chat');

const program = new Command();

function run() {
  program
    .name('instagram-cli')
    .description('Instagram CLI tool using instagram-private-api')
    .version(pkg.version);

  // Global options
  program.option('-v, --verbose', 'Enable verbose logging');
  program.option('-d, --debug', 'Enable debug mode');

  // Register commands
  loginCommand(program);
  logoutCommand(program);
  statusCommand(program);
  sendCommand(program);
  bulkSendCommand(program);
  groupSendCommand(program);
  postCommand(program);
  storyCommand(program);
  followCommand(program);
  unfollowCommand(program);
  bulkFollowCommand(program);
  likeCommand(program);
  commentCommand(program);
  feedCommand(program);
  searchCommand(program);
  threadsCommand(program);
  chatCommand(program);
  liveChatCommand(program);

  // Parse arguments and handle errors gracefully
  try {
    program.parse();
  } catch (err) {
    if (err.code === 'commander.unknownCommand') {
      console.error(chalk.red('❌ Unknown command. Use --help to see available commands.'));
      process.exit(1);
    } else if (err.code === 'commander.missingArgument') {
      console.error(chalk.red('❌ Missing required argument. Use --help for usage information.'));
      process.exit(1);
    } else if (err.code === 'commander.help') {
      // Handle help command normally
      process.exit(0);
    } else {
      console.error(chalk.red('❌ Error:'), err.message);
      process.exit(1);
    }
  }
}

module.exports = { run };