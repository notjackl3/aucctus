const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

// Specify the path to your SVG sprite file
const iconDir = path.resolve(__dirname, '../src/app/components/Icons/Icon');
const spritePath = path.resolve(iconDir, 'icon-sprite.svg');
const outputPath = path.resolve(iconDir, 'icons.d.ts');

// Read the SVG file
fs.readFile(spritePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading SVG file:', err);
    return;
  }

  // Load the SVG content into cheerio
  const $ = cheerio.load(data, {
    xmlMode: true, // Enable XML mode for parsing SVG correctly
  });

  // Find all <symbol> elements and extract ids
  const ids = $('symbol')
    .map((i, elem) => $(elem).attr('id'))
    .get();

  // Generate TypeScript type
  const typeDeclaration = `type IconVariant = '${ids.join("' | '")}';\n`;

  // Write the type to a TypeScript definition file
  fs.writeFile(outputPath, typeDeclaration, (err) => {
    if (err) {
      console.error('Error writing TypeScript file:', err);
      return;
    }
    console.log('Icon type definition generated successfully!');
  });
});
