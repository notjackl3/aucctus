/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const { createHash } = require('crypto')

const iconComponentPath = path.resolve(
  __dirname,
  '../src/app/components/Icon/Icon/Icon.tsx',
)

// Generate a new hash
const newHash = createHash('md5').update(Date.now().toString()).digest('hex')

// Read the Icon component file
let iconComponentContent = fs.readFileSync(iconComponentPath, 'utf8')

// Replace the existing hash with the new hash
iconComponentContent = iconComponentContent.replace(
  /const ICON_HASH = '.*';/,
  `const ICON_HASH = '${newHash}';`,
)

// Write the updated content back to the file
fs.writeFileSync(iconComponentPath, iconComponentContent)

console.log(`Updated ICON_HASH in Icon.tsx to ${newHash}`)
