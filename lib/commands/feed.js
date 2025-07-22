const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { formatFeedPost } = require('../utils');

function feedCommand(program) {
  program
    .command('feed [limit]')
    .description('View your Instagram feed')
    .option('-l, --limit <number>', 'Number of posts to display', '10')
    .action(async (limit, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const postLimit = parseInt(options.limit || limit || '10', 10);
        
        if (isNaN(postLimit) || postLimit < 1 || postLimit > 50) {
          throw new Error('Limit must be a number between 1 and 50');
        }

        const posts = await client.getFeed(postLimit);
        
        console.log(chalk.blue(`\n📱 Your Instagram Feed (${posts.length} posts):`));
        console.log(chalk.gray('─'.repeat(80)));
        
        if (posts.length === 0) {
          console.log(chalk.yellow('No posts found in your feed.'));
          return;
        }

        posts.forEach((post, index) => {
          console.log(`${chalk.cyan(`${index + 1}.`)} ${formatFeedPost(post)}`);
        });
        
      } catch (error) {
        console.error(chalk.red('❌ Failed to fetch feed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = feedCommand;
