/* eslint-disable no-console */
import chokidar from 'chokidar'
import fs from 'fs'
import path from 'path'

function generateComponentBoilerplate(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath))
  const componentName = fileName.replace(/[-_](\w)/g, (_, letter) =>
    letter.toUpperCase(),
  )

  const boilerplate = `
import React from 'react';

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = ({}) => {
  return (
    <div></div>
  );
};

export default ${componentName};
  `

  fs.writeFileSync(filePath, boilerplate.trim())
  console.log(`Generated boilerplate for component ${fileName} at ${filePath}`)

  // Check if there's an index file and update it
  updateIndexFile(filePath, componentName)
}

function generatePageBoilerplate(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath))
  const componentName = fileName.replace(/[-_](\w)/g, (_, letter) =>
    letter.toUpperCase(),
  )

  const boilerplate = `
import React from 'react';

const ${componentName}: React.FC = () => {
  return (
    <div></div>
  );
};

export default ${componentName};
  `

  fs.writeFileSync(filePath, boilerplate.trim())
  console.log(`Generated boilerplate for page ${fileName} at ${filePath}`)
}

function updateIndexFile(filePath, componentName) {
  const dir = path.dirname(filePath)
  const parentDirName = path.basename(dir)
  const indexPath = path.resolve(dir, 'index.ts')

  if (fs.existsSync(indexPath)) {
    // Read the current index file content
    let indexContent = fs.readFileSync(indexPath, 'utf8')

    // Check if the component is already imported
    if (!indexContent.includes(componentName)) {
      // Add the import statement at the top
      indexContent =
        `import ${componentName} from './${componentName}';\n` + indexContent

      // Determine the export method being used
      if (indexContent.includes('(Default as any)')) {
        // Method 1: Attach to Default component
        indexContent = addToDefaultMethod(
          indexContent,
          componentName,
          parentDirName,
        )
      } else if (indexContent.includes(`const ${parentDirName} = {`)) {
        // Method 2: Object of Components
        indexContent = addToObjectMethod(
          indexContent,
          componentName,
          parentDirName,
        )
      } else {
        // If no export pattern is detected, assume object method by default
        indexContent += `\nexport default {\n  ${componentName},\n};`
      }

      // Write the updated content back to the index file
      fs.writeFileSync(indexPath, indexContent)
      console.log(`Updated index.ts with ${componentName} in ${dir}`)
    }
  }
}
function addToDefaultMethod(indexContent, componentName, parentDirName) {
  // Add the component to the attached properties
  const attachRegex = /\(Default as any\)\.[\s\S]*?;/
  if (attachRegex.test(indexContent)) {
    indexContent = indexContent.replace(attachRegex, (match) => {
      return `${match.trim()}\n(Default as any).${componentName} = ${componentName};`
    })
  } else {
    indexContent += `\n(Default as any).${componentName} = ${componentName};`
  }

  // Add to the Default type definition
  const typeDefRegex = new RegExp(
    `const\\s+${parentDirName}\\s*=\\s*Default\\s+as\\s+typeof\\s+Default\\s*&\\s*\\{([\\s\\S]*?)\\};`,
    'm',
  )
  console.log('Checking for type definition with regex: ', typeDefRegex)

  if (typeDefRegex.test(indexContent)) {
    console.log('Type definition found. Updating...')
    indexContent = indexContent.replace(typeDefRegex, (match, p1) => {
      // Insert the new component into the existing type definition, ensuring each property is on its own line
      const properties = p1
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line)
      properties.push(`${componentName}: typeof ${componentName};`)
      return match.replace(p1, `\n  ${properties.join('\n  ')}\n`)
    })
  } else {
    console.log(
      `Type definition for ${parentDirName} not found. Manual update might be required.`,
    )
    console.log('Current indexContent: \n', indexContent)
  }

  return indexContent
}

function addToObjectMethod(indexContent, componentName, parentDirName) {
  // Add the component to the export object
  const exportRegex = new RegExp(
    `const ${parentDirName}\\s*=\\s*\\{([\\s\\S]*?)\\};`,
    'm',
  )
  if (exportRegex.test(indexContent)) {
    indexContent = indexContent.replace(exportRegex, (match, p1) => {
      // Split the existing object properties into an array, add the new component, and then join them back
      const properties = p1
        .trim()
        .split(',')
        .map((line) => line.trim())
        .filter((line) => line)
      properties.push(`${componentName}`)
      return `const ${parentDirName} = {\n  ${properties.join(',\n  ')}\n};`
    })
  }

  return indexContent
}

function viteBoilerplatePlugin() {
  return {
    name: 'vite-boilerplate-plugin',
    apply: 'serve', // Only apply the plugin during development

    configureServer(server) {
      const componentsDir = path.resolve(__dirname, '../src/app/components')
      const pagesDir = path.resolve(__dirname, '../src/app/pages')

      const watcher = chokidar.watch([componentsDir, pagesDir], {
        persistent: true,
        ignoreInitial: true,
        depth: 99,
      })

      watcher.on('add', (filePath) => {
        if (path.extname(filePath) === '.tsx') {
          const fileStats = fs.statSync(filePath)
          if (fileStats.size === 0) {
            if (filePath.includes(componentsDir)) {
              generateComponentBoilerplate(filePath)
            } else if (filePath.includes(pagesDir)) {
              generatePageBoilerplate(filePath)
            }
          }
        }
      })

      server.watcher.on('change', (changedPath) => {
        console.log(`File changed: ${changedPath}`)
      })

      server.watcher.on('unlink', (removedPath) => {
        console.log(`File removed: ${removedPath}`)
      })
    },
  }
}

module.exports = {
  viteBoilerplatePlugin,
}
