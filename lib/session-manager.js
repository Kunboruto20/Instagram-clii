const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class SessionManager {
  constructor() {
    this.sessionDir = path.join(os.homedir(), '.instagram-cli');
    this.ensureSessionDir();
  }

  async ensureSessionDir() {
    try {
      await fs.ensureDir(this.sessionDir);
    } catch (error) {
      console.error(chalk.red('❌ Failed to create session directory:'), error.message);
    }
  }

  getSessionPath(username) {
    return path.join(this.sessionDir, `${username}.json`);
  }

  async saveSession(username, sessionData) {
    try {
      const sessionPath = this.getSessionPath(username);
      await fs.writeJson(sessionPath, {
        username,
        sessionData,
        lastLogin: new Date().toISOString()
      }, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save session: ${error.message}`);
    }
  }

  async loadSession(username) {
    try {
      const sessionPath = this.getSessionPath(username);
      const exists = await fs.pathExists(sessionPath);
      
      if (!exists) {
        return null;
      }

      const data = await fs.readJson(sessionPath);
      return data.sessionData;
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Failed to load session for ${username}: ${error.message}`));
      return null;
    }
  }

  async removeSession(username) {
    try {
      const sessionPath = this.getSessionPath(username);
      const exists = await fs.pathExists(sessionPath);
      
      if (exists) {
        await fs.remove(sessionPath);
      }
    } catch (error) {
      throw new Error(`Failed to remove session: ${error.message}`);
    }
  }

  async listSessions() {
    try {
      const files = await fs.readdir(this.sessionDir);
      const sessions = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionPath = path.join(this.sessionDir, file);
          try {
            const data = await fs.readJson(sessionPath);
            sessions.push({
              username: data.username,
              lastLogin: data.lastLogin
            });
          } catch (error) {
            // Skip corrupted session files
            console.warn(chalk.yellow(`⚠️  Skipping corrupted session file: ${file}`));
          }
        }
      }

      return sessions;
    } catch (error) {
      return [];
    }
  }

  async clearAllSessions() {
    try {
      await fs.emptyDir(this.sessionDir);
    } catch (error) {
      throw new Error(`Failed to clear sessions: ${error.message}`);
    }
  }
}

module.exports = { SessionManager };
