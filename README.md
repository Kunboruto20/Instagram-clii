
# Instagram CLI

[![npm version](https://img.shields.io/npm/v/instagram-clii.svg)](https://www.npmjs.com/package/instagram-clii)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/instagram-clii.svg)](https://nodejs.org/)

A powerful command-line interface for Instagram that brings the full Instagram experience to your terminal. This CLI provides comprehensive Instagram functionality through simple terminal commands, including real-time messaging, group management, and live chat features.

## ✨ Features

- 📝 **Account Registration** - Create new Instagram accounts without mobile app
- 🔐 **Secure Authentication** - Login with persistent session management
- 💬 **Direct Messaging** - Send messages to any Instagram user or group
- 👥 **Group Messaging** - Send messages to Instagram groups by name
- 🔴 **Live Chat** - Real-time conversation mode with any user
- 💬 **Interactive Chat** - Chat with users directly from CLI with real-time message display
- 📋 **Thread Management** - List and view all your Instagram conversations
- 📸 **Content Publishing** - Upload photos to feed and stories
- 🤝 **Social Interactions** - Follow/unfollow users, like posts, add comments
- 🔍 **Content Discovery** - Browse your feed, search users and hashtags
- 👥 **Multi-Account Support** - Manage multiple Instagram accounts
- ⚡ **Rate Limiting Protection** - Built-in safeguards against Instagram limits
- 🌍 **Cross-Platform** - Works on Windows, macOS, and Linux
- 🎨 **Beautiful Interface** - Colorful output with loading spinners
- 📊 **Session Management** - View active sessions and account status

## 🚀 Quick Start

### Installation

Install globally via npm:

```bash
npm install -g instagram-clii
```

### First Steps

1. **Login to your Instagram account:**
```bash
instagram-cli login your_username your_password
```

2. **Check your status:**
```bash
instagram-cli status
```

3. **View your conversations:**
```bash
instagram-cli threads
```

4. **Start a live chat:**
```bash
instagram-cli chat username
```

That's it! You're ready to use Instagram from the command line.

## 📖 Complete Usage Guide

### Authentication Commands

#### Create New Instagram Account
```bash
instagram-cli register <username> <email> <password> [options]
instagram-cli register <username> <phone> <password> [options]
```
Create a new Instagram account directly from the CLI without needing the mobile app.

**Examples:**
```bash
# Register with email
instagram-cli register johndoe john@example.com mypassword123

# Register with phone number
instagram-cli register johndoe +1234567890 mypassword123

# Register with additional options
instagram-cli register johndoe john@example.com mypassword123 --fullname "John Doe" --birthday "1990-01-01"
```

**Options:**
- `--fullname <name>` - Full name for the profile
- `--birthday <date>` - Birthday in YYYY-MM-DD format
- `--gender <gender>` - Gender (male/female/prefer_not_to_say)
- `--verify` - Enable phone/email verification during registration
- `--profile-pic <path>` - Upload profile picture during registration

**Supported Registration Methods:**
- ✅ Email-based registration
- ✅ Phone number-based registration
- ✅ Automatic verification handling
- ✅ Profile customization during setup
- ✅ Bypass mobile app requirement

#### Login
```bash
instagram-cli login <username> <password>
```
Login to your Instagram account. Sessions are automatically saved for future use.

**Example:**
```bash
instagram-cli login johndoe mypassword123
```

#### Logout
```bash
instagram-cli logout [username]
instagram-cli logout --all
```
Logout from a specific account or all accounts.

**Examples:**
```bash
instagram-cli logout johndoe    # Logout specific user
instagram-cli logout            # Logout current user (interactive)
instagram-cli logout --all      # Logout all accounts
```

#### Status
```bash
instagram-cli status
```
Display current login status and active sessions.

### Messaging Commands

#### Send Direct Message
```bash
instagram-cli send <username> <message>
```
Send a direct message to any Instagram user.

**Examples:**
```bash
instagram-cli send johndoe "Hello! How are you?"
instagram-cli send @instagram "Love your posts!"
```

#### Send Message to Group
```bash
instagram-cli send <groupName> <message> --group
instagram-cli group-send <groupName> <message>
```
Send a message to an Instagram group by name (supports partial matching).

**Examples:**
```bash
instagram-cli send "My Friends" "Hello everyone!" --group
instagram-cli group-send "Work Team" "Meeting at 3 PM"
instagram-cli send "Family" "Happy birthday!" -g
```

#### Interactive Chat Mode
```bash
instagram-cli chat <username>
```
Start an interactive chat session with real-time messaging. Type messages and press Enter to send.

**Examples:**
```bash
instagram-cli chat johndoe
instagram-cli chat @instagram
```

**Chat Commands:**
- Type any message and press Enter to send
- Type `/exit` or `/quit` to leave the chat
- Type `/help` for available commands
- Use Ctrl+C to force exit

#### Live Chat with Real-time Updates
```bash
instagram-cli live-chat <username>
```
Start a live chat session that automatically displays new incoming messages in real-time.

**Examples:**
```bash
instagram-cli live-chat johndoe
instagram-cli live-chat @bestfriend
```

**Live Chat Features:**
- Real-time message updates every 2 seconds
- Shows both sent and received messages
- Timestamps for all messages
- Auto-scrolling to latest messages
- Type `/exit` to quit

#### View Conversations/Threads
```bash
instagram-cli threads [limit]
instagram-cli threads --limit <number>
```
List all your Instagram conversations (direct messages and groups).

**Examples:**
```bash
instagram-cli threads           # Show 10 conversations (default)
instagram-cli threads 20        # Show 20 conversations
instagram-cli threads --limit 5 # Show 5 conversations
```

#### Bulk Send Messages
```bash
instagram-cli bulk-send <userListFile> <message> [options]
```
Send the same message to multiple users from a text file.

**Examples:**
```bash
instagram-cli bulk-send users.txt "Check out my new post!"
instagram-cli bulk-send users.txt "Hello!" --delay 10000
instagram-cli bulk-send users.txt "Test message" --dry-run
```

**Options:**
- `--delay <ms>` - Delay between messages (default: 5000ms)
- `--dry-run` - Preview without sending

**File format (users.txt):**
```
johndoe
@instagram
https://instagram.com/user123
jane_doe
```

### Content Publishing

#### Upload Photo to Feed
```bash
instagram-cli post <imagePath> [caption]
```
Upload a photo to your Instagram feed with an optional caption.

**Examples:**
```bash
instagram-cli post ./photo.jpg
instagram-cli post ./photo.jpg "Beautiful sunset today! #nature"
```

**Supported formats:** `.jpg`, `.jpeg`, `.png`

#### Upload Photo to Story
```bash
instagram-cli story <imagePath>
```
Upload a photo to your Instagram story.

**Example:**
```bash
instagram-cli story ./story-photo.jpg
```

### Social Interactions

#### Follow User
```bash
instagram-cli follow <username>
```
Follow an Instagram user.

**Examples:**
```bash
instagram-cli follow johndoe
instagram-cli follow @instagram
instagram-cli follow https://instagram.com/johndoe
```

#### Unfollow User
```bash
instagram-cli unfollow <username>
```
Unfollow an Instagram user.

**Example:**
```bash
instagram-cli unfollow johndoe
```

#### Bulk Follow Users
```bash
instagram-cli bulk-follow <userListFile> [options]
```
Follow multiple users from a text file.

**Examples:**
```bash
instagram-cli bulk-follow influencers.txt
instagram-cli bulk-follow users.txt --delay 15000
instagram-cli bulk-follow users.txt --dry-run
```

**Options:**
- `--delay <ms>` - Delay between follows (default: 10000ms, minimum: 5000ms)
- `--dry-run` - Preview without following

#### Like Post
```bash
instagram-cli like <postUrl>
```
Like an Instagram post using its URL.

**Example:**
```bash
instagram-cli like https://www.instagram.com/p/ABC123DEF456/
```

#### Comment on Post
```bash
instagram-cli comment <postUrl> <message>
```
Add a comment to an Instagram post.

**Example:**
```bash
instagram-cli comment https://www.instagram.com/p/ABC123DEF456/ "Amazing photo!"
```

### Content Discovery

#### View Your Feed
```bash
instagram-cli feed [limit]
instagram-cli feed --limit <number>
```
View posts from your Instagram feed.

**Examples:**
```bash
instagram-cli feed           # View 10 posts (default)
instagram-cli feed 20        # View 20 posts
instagram-cli feed --limit 5 # View 5 posts
```

#### Search Users and Hashtags
```bash
instagram-cli search <query> [--limit <number>]
```
Search for users (prefix with @) or hashtags (prefix with #).

**Examples:**
```bash
instagram-cli search @johndoe           # Search for users
instagram-cli search #photography       # Search for hashtags
instagram-cli search @john --limit 5    # Limit results to 5
```

## 🔧 Advanced Features

### Real-time Messaging
The CLI supports real-time messaging through two modes:

1. **Interactive Chat Mode** (`chat` command) - Type and send messages interactively
2. **Live Chat Mode** (`live-chat` command) - Real-time updates with automatic message refresh

### Group Management
- **Smart Group Matching** - Send messages to groups using partial names
- **Group Discovery** - List all available groups with participant counts
- **Thread Management** - View and manage all conversations in one place

### Session Management
Instagram CLI automatically manages your login sessions:

- **Session Storage**: Sessions are stored securely in `~/.instagram-cli/`
- **Multi-Account**: Support for multiple Instagram accounts
- **Auto-Restore**: Sessions are automatically restored when you run commands
- **Cross-Platform**: Session files work across different operating systems

## 📋 Command Reference

### Core Commands
| Command | Description | Example |
|---------|-------------|---------|
| `register` | Create new Instagram account | `instagram-cli register user email@domain.com pass123` |
| `login` | Authenticate with Instagram | `instagram-cli login username password` |
| `logout` | Sign out from account | `instagram-cli logout` |
| `status` | Check authentication status | `instagram-cli status` |
| `threads` | List conversations | `instagram-cli threads 10` |

### Messaging Commands
| Command | Description | Example |
|---------|-------------|---------|
| `send` | Send direct message | `instagram-cli send user "Hello"` |
| `group-send` | Send message to group | `instagram-cli group-send "My Group" "Hi all"` |
| `chat` | Interactive chat mode | `instagram-cli chat username` |
| `live-chat` | Live chat with real-time updates | `instagram-cli live-chat username` |
| `bulk-send` | Send to multiple users | `instagram-cli bulk-send users.txt "Hello"` |

### Content Commands
| Command | Description | Example |
|---------|-------------|---------|
| `post` | Upload photo to feed | `instagram-cli post photo.jpg "Caption"` |
| `story` | Upload photo to story | `instagram-cli story photo.jpg` |
| `feed` | View your feed | `instagram-cli feed 20` |
| `like` | Like a post | `instagram-cli like POST_URL` |
| `comment` | Comment on post | `instagram-cli comment POST_URL "Nice!"` |

### Social Commands
| Command | Description | Example |
|---------|-------------|---------|
| `follow` | Follow a user | `instagram-cli follow username` |
| `unfollow` | Unfollow a user | `instagram-cli unfollow username` |
| `bulk-follow` | Follow multiple users | `instagram-cli bulk-follow users.txt` |
| `search` | Search users/hashtags | `instagram-cli search @username` |

## 🔧 Advanced Options

### Global Options

All commands support these global options:

- `-v, --verbose` - Enable detailed logging
- `-d, --debug` - Enable debug mode for troubleshooting
- `-h, --help` - Show help for any command

**Examples:**
```bash
instagram-cli login johndoe password123 --verbose
instagram-cli feed --debug
instagram-cli send --help
```

### Messaging Options

#### Send Command Options
- `-g, --group` - Send to a group thread by name
- `-t, --thread-id <id>` - Send to a specific thread ID

#### Chat Mode Features
- **Auto-completion** - Tab completion for usernames
- **Message history** - Scroll through previous messages
- **Real-time updates** - See new messages as they arrive
- **Rich formatting** - Colored output with timestamps

## ⚡ Tips & Best Practices

### Real-time Messaging Tips
- Use `chat` command for interactive conversations
- Use `live-chat` for monitoring conversations with automatic updates
- Type `/help` in chat mode to see available commands
- Use Ctrl+C to quickly exit any chat mode

### Group Messaging Tips
- Use partial group names for easier targeting
- Check `threads` command to see exact group names
- Group names are case-insensitive
- Use quotes for group names with spaces

### Rate Limiting
Instagram CLI includes built-in rate limiting to protect your account:
- Automatic delays between requests
- Smart session management
- Human-like behavior simulation

### File Paths
When uploading images, you can use:
- Relative paths: `./images/photo.jpg`
- Absolute paths: `/home/user/photos/vacation.jpg`
- Current directory: `photo.jpg`

### Bulk Operations
For bulk messaging and following:
- Create text files with one username per line
- Use `--dry-run` to preview operations before executing
- Adjust delays based on your account age and activity
- Monitor for rate limiting and adjust accordingly
- See `examples/users.txt` for file format reference

### URL Formats
The CLI accepts various Instagram URL formats:
- Full URLs: `https://www.instagram.com/johndoe`
- Short URLs: `instagram.com/johndoe`
- Usernames: `johndoe` or `@johndoe`

## 🛠️ Troubleshooting

### Common Issues

**Registration Problems:**
```bash
# Try with verbose logging
instagram-cli register username email password --verbose

# Use phone instead of email if email fails
instagram-cli register username +1234567890 password

# Enable verification if required
instagram-cli register username email password --verify
```

**Login Problems:**
```bash
# Try with verbose logging
instagram-cli login username password --verbose

# Check your credentials
instagram-cli status
```

**Rate Limiting:**
```bash
# Wait a few minutes and try again
# Use --verbose to see detailed information
instagram-cli command --verbose
```

**Session Issues:**
```bash
# Clear all sessions and login again
instagram-cli logout --all
instagram-cli login username password
```

**Chat Mode Issues:**
```bash
# If chat freezes, use Ctrl+C to exit
# Clear terminal and try again
clear && instagram-cli chat username
```

### Error Messages

| Error | Solution |
|-------|----------|
| "Username already exists" | Try a different username or add numbers |
| "Email already registered" | Use a different email or login to existing account |
| "Phone verification required" | Use `--verify` flag to complete verification |
| "Registration rate limited" | Wait 1-2 hours before trying again |
| "Not authenticated" | Run `instagram-cli login <username> <password>` |
| "Rate limit exceeded" | Wait 5-10 minutes before trying again |
| "User not found" | Check the username spelling |
| "Group not found" | Check group name with `threads` command |
| "Invalid post URL" | Make sure you're using a valid Instagram post URL |
| "Image file not found" | Check the file path and make sure the image exists |
| "Chat connection failed" | Check internet connection and try again |

## 🔒 Security & Privacy

- **Local Storage**: All session data is stored locally on your device
- **No Data Collection**: Instagram CLI doesn't collect or transmit your personal data
- **Secure Sessions**: Session files are stored in your user directory
- **Rate Protection**: Built-in safeguards prevent account restrictions
- **Encrypted Storage**: Session data is encrypted for security

## 📋 Requirements

- **Node.js**: Version 14.0.0 or higher
- **NPM**: Latest version recommended
- **Operating System**: Windows, macOS, or Linux
- **Instagram Account**: Valid Instagram credentials
- **Terminal**: Modern terminal with Unicode support for best experience

## 🚀 Real-time Features

### Live Chat Capabilities
- **Instant messaging** with real-time message display
- **Auto-refresh** every 2 seconds for new messages
- **Bi-directional communication** - see both sent and received messages
- **Message timestamps** for better conversation tracking
- **Graceful handling** of network issues

### Interactive Chat Features
- **Command-line interface** for natural messaging
- **Message history** within the session
- **Quick exit commands** (`/exit`, `/quit`)
- **Help system** built into chat mode
- **Responsive design** that works in any terminal size

## 🤝 Contributing

This project is open for contributions! Feel free to:

- Report bugs
- Suggest new features  
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Usage Guidelines

### Educational Purpose
This tool is designed for educational and automation purposes. While it provides powerful Instagram functionality, it's essential to use it responsibly.

### Responsible Usage
- **Respect Instagram's Terms of Service** - Always comply with Instagram's community guidelines
- **No Spam or Abuse** - Do not use this tool for sending unsolicited messages, excessive following/unfollowing, or any form of harassment
- **Rate Limiting** - The tool includes built-in delays, but avoid excessive usage that could trigger Instagram's security measures
- **Personal Use** - Intended for managing your own content and legitimate interactions
- **Commercial Use** - Be aware of Instagram's policies regarding automated commercial activities

### Anti-Abuse Measures
- Built-in rate limiting to prevent account restrictions
- Session management to maintain account safety
- Proper error handling for Instagram's security responses
- Smart delays between actions to mimic human behavior

### Legal Disclaimer
The developers are not responsible for any account restrictions, violations, or legal issues that may result from misuse of this tool. Users are solely responsible for ensuring their usage complies with all applicable terms of service and laws.

## 🔗 Community

Join our growing community of developers who are building automation tools for social media platforms.

## 📊 Features Overview

### ✅ Implemented Features
- ✅ Account Registration (Email & Phone)
- ✅ Authentication & Session Management
- ✅ Direct Messaging
- ✅ Group Messaging
- ✅ Interactive Chat Mode
- ✅ Live Chat with Real-time Updates
- ✅ Thread/Conversation Management
- ✅ Content Publishing (Photos to Feed & Stories)
- ✅ Social Interactions (Follow/Unfollow/Like/Comment)
- ✅ Content Discovery (Feed/Search)
- ✅ Bulk Operations (Messaging & Following)
- ✅ Multi-Account Support
- ✅ Rate Limiting Protection
- ✅ Cross-Platform Support

### 🚀 Advanced Capabilities
- **Real-time Communication** - Chat with users in real-time from your terminal
- **Smart Group Targeting** - Send messages to groups using partial name matching
- **Persistent Sessions** - Stay logged in across sessions
- **Comprehensive Logging** - Detailed verbose and debug modes
- **Error Recovery** - Intelligent error handling and recovery
- **Human-like Behavior** - Built-in delays and patterns to avoid detection

---

**Made with ❤️ for the command-line community**

*Transform your Instagram experience with the power of the terminal!*
