const { IgApiClient } = require('instagram-private-api');
const chalk = require('chalk');
const ora = require('ora');
const bluebird = require('bluebird');
const { SessionManager } = require('./session-manager');
const { delay, isValidUsername, extractUsernameFromUrl, parsePostUrl } = require('./utils');

class InstagramClient {
  constructor(options = {}) {
    this.ig = new IgApiClient();
    this.sessionManager = new SessionManager();
    this.verbose = options.verbose || false;
    this.debug = options.debug || false;
    
    if (this.debug) {
      // Enable debug logging
      process.env.DEBUG = 'ig:*';
    }
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = type === 'error' ? chalk.red('❌') : chalk.blue('ℹ️');
      console.log(`${prefix} ${message}`);
    }
  }

  async login(username, password) {
    const spinner = ora('Logging in to Instagram...').start();
    
    try {
      // Generate device ID based on username
      this.ig.state.generateDevice(username);
      
      // Load existing session if available
      const sessionData = await this.sessionManager.loadSession(username);
      if (sessionData) {
        this.log('Loading existing session...');
        try {
          await this.ig.state.deserialize(sessionData);
          // Test if session is still valid
          const currentUser = await this.ig.account.currentUser();
          spinner.succeed(chalk.green(`✅ Successfully logged in as ${currentUser.username} (using saved session)`));
          return currentUser;
        } catch (sessionError) {
          this.log('Existing session invalid, performing fresh login...', 'error');
          await this.sessionManager.removeSession(username);
        }
      }

      // Add random delay to simulate human behavior
      await delay(Math.random() * 2000 + 1000);
      
      // Pre-login flow simulation
      try {
        await this.ig.simulate.preLoginFlow();
      } catch (preLoginError) {
        this.log('Pre-login flow failed, continuing...', 'error');
      }
      
      // Perform login
      const loggedInUser = await this.ig.account.login(username, password);
      
      // Post-login flow simulation
      try {
        await this.ig.simulate.postLoginFlow();
      } catch (postLoginError) {
        this.log('Post-login flow failed, but login successful', 'error');
      }
      
      // Save session
      const serializedState = await this.ig.state.serialize();
      await this.sessionManager.saveSession(username, serializedState);
      
      spinner.succeed(chalk.green(`✅ Successfully logged in as ${loggedInUser.username}`));
      return loggedInUser;
      
    } catch (error) {
      spinner.fail(chalk.red('❌ Login failed'));
      throw this.handleError(error);
    }
  }

  async logout(username) {
    const spinner = ora('Logging out...').start();
    
    try {
      await this.sessionManager.removeSession(username);
      spinner.succeed(chalk.green('✅ Successfully logged out'));
    } catch (error) {
      spinner.fail(chalk.red('❌ Logout failed'));
      throw error;
    }
  }

  async sendMessage(username, message) {
    await this.ensureAuthenticated();
    const spinner = ora(`Sending message to ${username}...`).start();
    
    try {
      const userId = await this.getUserId(username);
      await this.ig.entity.directThread([userId]).broadcastText(message);
      await delay(2000); // Rate limiting
      
      spinner.succeed(chalk.green(`✅ Message sent to ${username}`));
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to send message to ${username}`));
      throw this.handleError(error);
    }
  }

  async sendMessageToThread(threadId, message) {
    await this.ensureAuthenticated();
    const spinner = ora(`Sending message to thread...`).start();
    
    try {
      const thread = this.ig.entity.directThread(threadId);
      await thread.broadcastText(message);
      await delay(2000); // Rate limiting
      
      spinner.succeed(chalk.green(`✅ Message sent to thread`));
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to send message to thread`));
      throw this.handleError(error);
    }
  }

  async findThreadByName(threadName) {
    await this.ensureAuthenticated();
    
    try {
      const threads = await this.getDirectThreads(50);
      const foundThread = threads.find(thread => {
        const title = thread.thread_title || '';
        return title.toLowerCase().includes(threadName.toLowerCase());
      });
      
      if (!foundThread) {
        throw new Error(`Thread with name "${threadName}" not found`);
      }
      
      return foundThread;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadPhoto(imagePath, caption = '') {
    await this.ensureAuthenticated();
    const spinner = ora('Uploading photo...').start();
    
    try {
      const fs = require('fs-extra');
      const imageBuffer = await fs.readFile(imagePath);
      
      await this.ig.publish.photo({
        file: imageBuffer,
        caption: caption
      });
      
      await delay(3000); // Rate limiting
      spinner.succeed(chalk.green('✅ Photo uploaded successfully'));
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to upload photo'));
      throw this.handleError(error);
    }
  }

  async uploadStory(imagePath) {
    await this.ensureAuthenticated();
    const spinner = ora('Uploading story...').start();
    
    try {
      const fs = require('fs-extra');
      const imageBuffer = await fs.readFile(imagePath);
      
      await this.ig.publish.story({
        file: imageBuffer
      });
      
      await delay(3000); // Rate limiting
      spinner.succeed(chalk.green('✅ Story uploaded successfully'));
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to upload story'));
      throw this.handleError(error);
    }
  }

  async followUser(username) {
    await this.ensureAuthenticated();
    const spinner = ora(`Following ${username}...`).start();
    
    try {
      const userId = await this.getUserId(username);
      await this.ig.friendship.create(userId);
      await delay(2000); // Rate limiting
      
      spinner.succeed(chalk.green(`✅ Now following ${username}`));
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to follow ${username}`));
      throw this.handleError(error);
    }
  }

  async unfollowUser(username) {
    await this.ensureAuthenticated();
    const spinner = ora(`Unfollowing ${username}...`).start();
    
    try {
      const userId = await this.getUserId(username);
      await this.ig.friendship.destroy(userId);
      await delay(2000); // Rate limiting
      
      spinner.succeed(chalk.green(`✅ Unfollowed ${username}`));
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to unfollow ${username}`));
      throw this.handleError(error);
    }
  }

  async likePost(postUrl) {
    await this.ensureAuthenticated();
    const spinner = ora('Liking post...').start();
    
    try {
      const mediaId = parsePostUrl(postUrl);
      await this.ig.media.like({
        mediaId: mediaId,
        moduleInfo: {
          module_name: 'profile'
        }
      });
      await delay(2000); // Rate limiting
      
      spinner.succeed(chalk.green('✅ Post liked successfully'));
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to like post'));
      throw this.handleError(error);
    }
  }

  async commentPost(postUrl, comment) {
    await this.ensureAuthenticated();
    const spinner = ora('Adding comment...').start();
    
    try {
      const mediaId = parsePostUrl(postUrl);
      await this.ig.media.comment({
        mediaId: mediaId,
        text: comment
      });
      await delay(2000); // Rate limiting
      
      spinner.succeed(chalk.green('✅ Comment added successfully'));
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to add comment'));
      throw this.handleError(error);
    }
  }

  async getFeed(limit = 10) {
    await this.ensureAuthenticated();
    const spinner = ora('Fetching feed...').start();
    
    try {
      const timelineFeed = this.ig.feed.timeline();
      const posts = await timelineFeed.items();
      
      spinner.succeed(chalk.green('✅ Feed fetched successfully'));
      return posts.slice(0, limit);
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to fetch feed'));
      throw this.handleError(error);
    }
  }

  async searchUser(username) {
    await this.ensureAuthenticated();
    const spinner = ora(`Searching for ${username}...`).start();
    
    try {
      const results = await this.ig.search.users(username);
      spinner.succeed(chalk.green(`✅ Found ${results.users.length} users`));
      return results.users;
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to search for ${username}`));
      throw this.handleError(error);
    }
  }

  async searchHashtag(hashtag) {
    await this.ensureAuthenticated();
    const spinner = ora(`Searching for #${hashtag}...`).start();
    
    try {
      const results = await this.ig.search.tags(hashtag);
      spinner.succeed(chalk.green(`✅ Found ${results.results.length} hashtags`));
      return results.results;
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to search for #${hashtag}`));
      throw this.handleError(error);
    }
  }

  async getDirectThreads(limit = 20) {
    await this.ensureAuthenticated();
    const spinner = ora('Fetching direct message threads...').start();
    
    try {
      const threadsFeed = this.ig.feed.directInbox();
      const threads = await threadsFeed.items();
      
      spinner.succeed(chalk.green(`✅ Found ${threads.length} threads`));
      return threads.slice(0, limit);
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to fetch threads'));
      throw this.handleError(error);
    }
  }

  async getStatus() {
    const sessions = await this.sessionManager.listSessions();
    return {
      activeSessions: sessions,
      isLoggedIn: sessions.length > 0
    };
  }

  async getUserId(username) {
    const cleanUsername = extractUsernameFromUrl(username);
    try {
      const userInfo = await this.ig.user.searchExact(cleanUsername);
      if (!userInfo) {
        throw new Error(`User ${cleanUsername} not found`);
      }
      return userInfo.pk;
    } catch (error) {
      if (error.message.includes('login_required')) {
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  }

  async ensureAuthenticated() {
    // Check if we have an active session
    const sessions = await this.sessionManager.listSessions();
    if (sessions.length === 0) {
      throw new Error('Not authenticated. Please login first with: instagram-cli login <username> <password>');
    }

    // If we don't have a current user loaded, try to load from session
    try {
      await this.ig.account.currentUser();
    } catch (error) {
      this.log('No active session in client, loading from saved session...', 'info');
      
      // Find the most recent session
      const latestSession = sessions.reduce((latest, current) => 
        new Date(current.lastLogin) > new Date(latest.lastLogin) ? current : latest
      );
      
      // Load the session
      const sessionData = await this.sessionManager.loadSession(latestSession.username);
      if (sessionData) {
        this.ig.state.generateDevice(latestSession.username);
        await this.ig.state.deserialize(sessionData);
        this.log(`Loaded session for ${latestSession.username}`, 'info');
      } else {
        throw new Error('Session expired. Please login again.');
      }
    }
  }

  handleError(error) {
    this.log(`Error details: ${error.message}`, 'error');
    
    if (error.message.includes('challenge_required')) {
      return new Error('Instagram requires additional verification. Please try logging in through the Instagram app first.');
    } else if (error.message.includes('rate limit')) {
      return new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
    } else if (error.message.includes('login_required')) {
      return new Error('Session expired. Please login again.');
    } else if (error.message.includes('user_not_found')) {
      return new Error('User not found. Please check the username.');
    } else if (error.message.includes('404 Not Found') || error.message.includes('fbsearch')) {
      return new Error('Instagram API endpoint unavailable. This might be temporary - please try again in a few minutes.');
    } else if (error.message.includes('checkpoint_required')) {
      return new Error('Instagram security checkpoint required. Please login through the Instagram app and complete verification.');
    } else if (error.message.includes('feedback_required')) {
      return new Error('Account action blocked by Instagram. Please wait and try again later.');
    } else {
      return error;
    }
  }
}

module.exports = { InstagramClient };
