const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { formatSearchResult, extractUsernameFromUrl } = require('../utils');

function searchCommand(program) {
  program
    .command('search <query>')
    .description('Search for users or hashtags (prefix with @ for users, # for hashtags)')
    .option('-l, --limit <number>', 'Number of results to display', '10')
    .action(async (query, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const limit = parseInt(options.limit, 10) || 10;
        
        if (limit < 1 || limit > 50) {
          throw new Error('Limit must be a number between 1 and 50');
        }

        let results = [];
        let type = 'user';

        if (query.startsWith('#')) {
          // Hashtag search
          const hashtag = query.substring(1);
          if (!hashtag) {
            throw new Error('Please provide a hashtag to search for');
          }
          
          type = 'hashtag';
          const searchResults = await client.searchHashtag(hashtag);
          results = searchResults.slice(0, limit);
          
        } else {
          // User search (default)
          const username = extractUsernameFromUrl(query);
          if (!username) {
            throw new Error('Please provide a valid username to search for');
          }
          
          const searchResults = await client.searchUser(username);
          results = searchResults.slice(0, limit);
        }

        console.log(chalk.blue(`\n🔍 Search Results for "${query}" (${results.length} results):`));
        console.log(chalk.gray('─'.repeat(80)));
        
        if (results.length === 0) {
          console.log(chalk.yellow(`No ${type}s found matching "${query}".`));
          return;
        }

        results.forEach((result, index) => {
          console.log(`${chalk.cyan(`${index + 1}.`)} ${formatSearchResult(result, type)}`);
        });
        
      } catch (error) {
        console.error(chalk.red('❌ Search failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = searchCommand;
