const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { InstagramClient } = require('../instagram-client');

function postCommand(program) {
  program
    .command('post <imagePath> [caption]')
    .description('Upload a photo to Instagram feed')
    .action(async (imagePath, caption = '', options) => {
      try {
        const client = new InstagramClient({
          verbose: program.opts().verbose,
          debug: program.opts().debug
        });

        // Validate image file
        if (!await fs.pathExists(imagePath)) {
          throw new Error(`Image file not found: ${imagePath}`);
        }

        const ext = path.extname(imagePath).toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png'];
        
        if (!validExtensions.includes(ext)) {
          throw new Error(`Invalid image format. Supported formats: ${validExtensions.join(', ')}`);
        }

        await client.uploadPhoto(imagePath, caption);
        
      } catch (error) {
        console.error(chalk.red('❌ Post failed:'), error.message);
        process.exit(1);
      }
    });
}

module.exports = postCommand;
