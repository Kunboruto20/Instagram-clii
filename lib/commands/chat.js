
const chalk = require('chalk');
const inquirer = require('inquirer');
const { InstagramClient } = require('../instagram-client');
const { delay, extractUsernameFromUrl } = require('../utils');

function chatCommand(program) {
  program
    .command('chat [username]')
    .description('Start interactive chat with a user or monitor all messages')
    .option('-m, --monitor', 'Monitor all incoming messages')
    .option('-t, --thread <name>', 'Chat with a specific group thread')
    .action(async (username, options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        if (options.monitor) {
          await startMessageMonitor(client);
        } else if (options.thread) {
          await startGroupChat(client, options.thread);
        } else if (username) {
          await startUserChat(client, username);
        } else {
          await startInboxMonitor(client);
        }
        
      } catch (error) {
        console.error(chalk.red('❌ Chat failed:'), error.message);
        process.exit(1);
      }
    });
}

async function startMessageMonitor(client) {
  console.log(chalk.blue('📱 Starting Instagram Message Monitor...'));
  console.log(chalk.yellow('💬 Watching for new messages (Press Ctrl+C to stop)\n'));
  
  let lastMessageIds = new Map();
  
  while (true) {
    try {
      const threads = await client.getDirectThreads(20);
      
      for (const thread of threads) {
        const threadId = thread.thread_id;
        const currentLastMessage = thread.items && thread.items[0];
        
        if (!currentLastMessage) continue;
        
        const lastKnownId = lastMessageIds.get(threadId);
        
        if (!lastKnownId) {
          lastMessageIds.set(threadId, currentLastMessage.item_id);
          continue;
        }
        
        if (currentLastMessage.item_id !== lastKnownId) {
          // New message detected
          await displayNewMessage(thread, currentLastMessage);
          lastMessageIds.set(threadId, currentLastMessage.item_id);
          
          // Prompt for quick reply
          const reply = await promptQuickReply(thread);
          if (reply) {
            await client.sendMessageToThread(threadId, reply);
            console.log(chalk.green(`✅ Reply sent to ${getThreadDisplayName(thread)}\n`));
          }
        }
      }
      
      await delay(3000); // Check every 3 seconds
    } catch (error) {
      console.error(chalk.red('❌ Monitor error:'), error.message);
      await delay(5000);
    }
  }
}

async function startUserChat(client, username) {
  const cleanUsername = extractUsernameFromUrl(username);
  console.log(chalk.blue(`💬 Starting chat with @${cleanUsername}`));
  console.log(chalk.yellow('Type your messages below (type "exit" to quit)\n'));
  
  // Show recent messages
  await showRecentMessages(client, cleanUsername);
  
  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.cyan('You:'),
        validate: input => input.trim() !== '' || 'Message cannot be empty'
      }
    ]);
    
    if (message.toLowerCase() === 'exit') {
      console.log(chalk.yellow('👋 Chat ended'));
      break;
    }
    
    try {
      await client.sendMessage(cleanUsername, message);
      console.log(chalk.green('✅ Message sent\n'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to send:'), error.message);
    }
  }
}

async function startGroupChat(client, threadName) {
  console.log(chalk.blue(`👥 Starting group chat with "${threadName}"`));
  
  const thread = await client.findThreadByName(threadName);
  console.log(chalk.green(`✅ Found group: "${thread.thread_title}"`));
  console.log(chalk.yellow('Type your messages below (type "exit" to quit)\n'));
  
  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.cyan('You:'),
        validate: input => input.trim() !== '' || 'Message cannot be empty'
      }
    ]);
    
    if (message.toLowerCase() === 'exit') {
      console.log(chalk.yellow('👋 Chat ended'));
      break;
    }
    
    try {
      await client.sendMessageToThread(thread.thread_id, message);
      console.log(chalk.green('✅ Message sent to group\n'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to send:'), error.message);
    }
  }
}

async function startInboxMonitor(client) {
  console.log(chalk.blue('📨 Instagram Inbox Monitor'));
  console.log(chalk.yellow('Choose a conversation to start chatting:\n'));
  
  const threads = await client.getDirectThreads(10);
  
  const choices = threads.map((thread, index) => ({
    name: `${getThreadDisplayName(thread)} - ${getLastMessagePreview(thread)}`,
    value: thread,
    short: getThreadDisplayName(thread)
  }));
  
  choices.push({ name: chalk.gray('🔄 Refresh'), value: 'refresh' });
  choices.push({ name: chalk.gray('❌ Exit'), value: 'exit' });
  
  const { selectedThread } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedThread',
      message: 'Select a conversation:',
      choices
    }
  ]);
  
  if (selectedThread === 'exit') {
    console.log(chalk.yellow('👋 Goodbye!'));
    return;
  }
  
  if (selectedThread === 'refresh') {
    await startInboxMonitor(client);
    return;
  }
  
  // Start chat with selected thread
  await chatWithThread(client, selectedThread);
}

async function chatWithThread(client, thread) {
  const displayName = getThreadDisplayName(thread);
  console.log(chalk.blue(`\n💬 Chatting with ${displayName}`));
  console.log(chalk.gray('─'.repeat(50)));
  
  // Show recent messages
  if (thread.items && thread.items.length > 0) {
    console.log(chalk.yellow('Recent messages:'));
    thread.items.slice(0, 5).reverse().forEach(item => {
      if (item.item_type === 'text') {
        const sender = item.user_id === thread.viewer_id ? 'You' : (item.user?.username || 'Unknown');
        const time = new Date(item.timestamp / 1000).toLocaleTimeString();
        console.log(chalk.gray(`[${time}] ${chalk.cyan(sender)}: ${item.text}`));
      }
    });
    console.log(chalk.gray('─'.repeat(50)));
  }
  
  console.log(chalk.yellow('Type your messages below (type "exit" to quit)\n'));
  
  while (true) {
    const { message } = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.cyan('You:'),
        validate: input => input.trim() !== '' || 'Message cannot be empty'
      }
    ]);
    
    if (message.toLowerCase() === 'exit') {
      console.log(chalk.yellow('👋 Chat ended'));
      break;
    }
    
    try {
      await client.sendMessageToThread(thread.thread_id, message);
      console.log(chalk.green('✅ Sent\n'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to send:'), error.message);
    }
  }
}

async function showRecentMessages(client, username) {
  try {
    const threads = await client.getDirectThreads(20);
    const userThread = threads.find(thread => {
      if (thread.thread_type === 'private') {
        const otherUser = thread.users?.find(user => user.username === username);
        return !!otherUser;
      }
      return false;
    });
    
    if (userThread && userThread.items) {
      console.log(chalk.yellow('Recent messages:'));
      userThread.items.slice(0, 5).reverse().forEach(item => {
        if (item.item_type === 'text') {
          const sender = item.user_id === userThread.viewer_id ? 'You' : username;
          const time = new Date(item.timestamp / 1000).toLocaleTimeString();
          console.log(chalk.gray(`[${time}] ${chalk.cyan(sender)}: ${item.text}`));
        }
      });
      console.log(chalk.gray('─'.repeat(50)));
    }
  } catch (error) {
    // Ignore errors when showing recent messages
  }
}

async function displayNewMessage(thread, message) {
  const time = new Date(message.timestamp / 1000).toLocaleTimeString();
  const threadName = getThreadDisplayName(thread);
  const sender = message.user?.username || 'Unknown';
  
  console.log(chalk.bgBlue.white('📨 NEW MESSAGE'));
  console.log(chalk.blue(`From: ${threadName}`));
  console.log(chalk.cyan(`@${sender}:`), message.text || '[Media]');
  console.log(chalk.gray(`Time: ${time}`));
  console.log(chalk.gray('─'.repeat(50)));
}

async function promptQuickReply(thread) {
  try {
    const { reply } = await inquirer.prompt([
      {
        type: 'input',
        name: 'reply',
        message: chalk.yellow('Quick reply (or press Enter to skip):'),
      }
    ]);
    
    return reply.trim() || null;
  } catch (error) {
    return null;
  }
}

function getThreadDisplayName(thread) {
  if (thread.thread_title) {
    return `👥 ${thread.thread_title}`;
  } else if (thread.users && thread.users.length > 0) {
    const otherUsers = thread.users.filter(user => user.pk !== thread.viewer_id);
    if (otherUsers.length > 0) {
      return `💬 @${otherUsers[0].username}`;
    }
  }
  return '💬 Unknown';
}

function getLastMessagePreview(thread) {
  if (thread.items && thread.items[0]) {
    const lastMessage = thread.items[0];
    if (lastMessage.text) {
      return lastMessage.text.substring(0, 30) + '...';
    }
    return '[Media]';
  }
  return 'No messages';
}

module.exports = chatCommand;
