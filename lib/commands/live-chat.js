
const chalk = require('chalk');
const { InstagramClient } = require('../instagram-client');
const { delay } = require('../utils');

function liveChatCommand(program) {
  program
    .command('live-chat')
    .alias('monitor')
    .description('Monitor all Instagram messages in real-time')
    .option('-i, --interval <seconds>', 'Check interval in seconds', '3')
    .option('-s, --sound', 'Play sound notification for new messages')
    .action(async (options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        const interval = parseInt(options.interval) * 1000;
        
        console.log(chalk.blue('🔥 Instagram Live Chat Monitor Started!'));
        console.log(chalk.yellow(`📡 Monitoring messages every ${options.interval} seconds...`));
        console.log(chalk.gray('Press Ctrl+C to stop\n'));
        
        let lastCheck = new Map();
        let messageCount = 0;
        
        while (true) {
          try {
            const threads = await client.getDirectThreads(20);
            
            for (const thread of threads) {
              const threadId = thread.thread_id;
              const lastMessage = thread.items && thread.items[0];
              
              if (!lastMessage) continue;
              
              const lastKnownTime = lastCheck.get(threadId) || 0;
              const messageTime = lastMessage.timestamp;
              
              if (messageTime > lastKnownTime) {
                // New message found!
                await displayLiveMessage(thread, lastMessage, ++messageCount);
                lastCheck.set(threadId, messageTime);
                
                if (options.sound) {
                  process.stdout.write('\x07'); // Bell sound
                }
              }
            }
            
          } catch (error) {
            console.error(chalk.red('❌ Monitor error:'), error.message);
          }
          
          await delay(interval);
        }
        
      } catch (error) {
        console.error(chalk.red('❌ Live chat failed:'), error.message);
        process.exit(1);
      }
    });
}

async function displayLiveMessage(thread, message, count) {
  const time = new Date(message.timestamp / 1000).toLocaleString();
  const threadName = getThreadName(thread);
  const sender = message.user?.username || 'Unknown';
  const messageText = message.text || '[Media/Other content]';
  
  console.log(chalk.bgGreen.black(`📨 NEW MESSAGE #${count}`));
  console.log(chalk.blue(`📍 Thread: ${threadName}`));
  console.log(chalk.cyan(`👤 From: @${sender}`));
  console.log(chalk.white(`💬 Message: ${messageText}`));
  console.log(chalk.gray(`🕐 Time: ${time}`));
  console.log(chalk.magenta(`🔗 Reply with: instagram-cli send "${sender}" "your message"`));
  console.log(chalk.gray('═'.repeat(60)) + '\n');
}

function getThreadName(thread) {
  if (thread.thread_title) {
    return `👥 ${thread.thread_title}`;
  } else if (thread.users && thread.users.length > 0) {
    const otherUsers = thread.users.filter(user => user.pk !== thread.viewer_id);
    if (otherUsers.length > 0) {
      return `💬 Direct with @${otherUsers[0].username}`;
    }
  }
  return '💬 Unknown conversation';
}

module.exports = liveChatCommand;
