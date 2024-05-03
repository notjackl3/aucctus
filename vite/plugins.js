import path from 'path';
import { exec } from 'child_process';

var iconDir = path.resolve(__dirname, '../icons');

function watchIcons() {
  return {
    name: 'watch-svg-icons',
    configureServer(server) {
      // Log the directory being watched
      console.log('Watching Icons at:', iconDir);

      // Add the directory to the watcher
      server.watcher.add(iconDir);

      // Handle change events
      server.watcher.on('change', (changedPath) => {
        console.log(`Change detected at ${changedPath}`);

        // Check if the changed path is within the icons directory
        if (changedPath.startsWith(iconDir)) {
          console.log(`Running script due to change in ${changedPath}...`);
          exec('npm run generate-sprite', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            if (stderr) {
              console.error(`stderr: ${stderr}`);
            }
          });
        }
      });
    },
  };
}

module.exports = {
  watchIcons,
};
