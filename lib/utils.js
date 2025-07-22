const chalk = require('chalk');
const bluebird = require('bluebird');

function delay(ms) {
  return bluebird.delay(ms);
}

function isValidUsername(username) {
  // Instagram username validation
  const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/;
  return usernameRegex.test(username);
}

function extractUsernameFromUrl(input) {
  // Remove @ symbol if present
  let username = input.startsWith('@') ? input.substring(1) : input;

  // Extract username from Instagram URL if it's a URL
  const urlMatch = username.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
  if (urlMatch) {
    username = urlMatch[1];
  }

  return username;
}

function parsePostUrl(postUrl) {
  // Extract media ID from Instagram post URL
  const urlPattern = /instagram\.com\/p\/([A-Za-z0-9_-]+)/;
  const match = postUrl.match(urlPattern);

  if (!match) {
    throw new Error('Invalid Instagram post URL format');
  }

  return match[1];
}

function formatFeedPost(post) {
  const user = post.user.username;
  const caption = post.caption ? post.caption.text.substring(0, 100) + '...' : 'No caption';
  const likes = post.like_count || 0;
  const comments = post.comment_count || 0;

  return `${chalk.blue(`@${user}`)} - ${chalk.gray(caption)} [${chalk.green(`${likes} likes`)} | ${chalk.yellow(`${comments} comments`)}]`;
}

function formatSearchResult(result, type = 'user') {
  if (type === 'user') {
    return `${chalk.blue(`@${result.username}`)} - ${chalk.gray(result.full_name || 'No name')} [${chalk.yellow(`${result.follower_count || 0} followers`)}]`;
  } else if (type === 'hashtag') {
    return `${chalk.green(`#${result.name}`)} - ${chalk.yellow(`${result.media_count || 0} posts`)}`;
  }
  return result;
}

function formatThread(thread) {
  const isGroup = thread.users.length > 2;
  const icon = isGroup ? chalk.green('👥 Group') : chalk.blue('💬 Direct');

  let title;
  if (thread.thread_title) {
    title = chalk.cyan(thread.thread_title);
  } else {
    const otherUsers = thread.users.filter(user => !user.is_viewer);
    const usernames = otherUsers.map(user => user.username).join(', ');
    title = chalk.cyan(usernames || 'Unknown');
  }

  const participants = thread.users
    .filter(user => !user.is_viewer)
    .map(user => `@${user.username}`)
    .join(', ');

  const lastActivity = thread.last_activity_at 
    ? new Date(thread.last_activity_at * 1000).toLocaleDateString()
    : 'Unknown';

  const threadId = chalk.gray(`[ID: ${thread.thread_id}]`);

  return `${icon} ${title} ${threadId} - ${chalk.yellow(participants)} - ${chalk.gray(`Last: ${lastActivity}`)}`;
}

module.exports = {
  delay,
  isValidUsername,
  extractUsernameFromUrl,
  parsePostUrl,
  formatFeedPost,
  formatSearchResult,
  formatThread
};