import path from 'path';
import { exec } from 'child_process';

var iconDir = path.resolve(__dirname, '../../icons');
var iconFile = path.resolve(iconDir, '*.svg');

function watchIcons() {
  return {
    name: 'watch-custom-folder',
    configureServer(server) {
      server.watcher.add(iconFile);
      console.log('Watching Icons at: ', iconFile);

      server.watcher.on('change', (changedPath) => {
        if (changedPath.startsWith(iconDir)) {
          console.log(`Detected change in ${changedPath}, running script...`);
          exec('npm run generate-sprite', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`${stdout}`);
          });
        }
      });
    },
  };
}

module.exports = {
  watchIcons,
};
