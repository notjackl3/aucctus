#!/usr/bin/env node
/* eslint-disable no-console */

const { log, runCommand, prompt, checkReleasePleaseCLI } = require('./helpers')

// Create GitHub release using release-please CLI
const createGithubRelease = async () => {
  log.title('CREATING GITHUB RELEASE')
  log.info('Using release-please CLI to create GitHub releases...')

  // Check for GitHub token in environment first
  let token = process.env.GITHUB_TOKEN

  // If not found in environment, prompt user
  if (!token) {
    log.info('No GITHUB_TOKEN found in environment.')
    log.info('A GitHub token with repo write permissions is required.')
    log.info('This token will be used to create GitHub releases.')
    token = await prompt('Enter your GitHub token: ')

    if (!token || token.trim() === '') {
      log.error('No token provided. Aborting.')
      process.exit(1)
    }
  } else {
    log.success('Using GITHUB_TOKEN from environment ✓')
  }

  // Get repo URL from git remote
  // remote url
  const remoteUrl = 'Aucctus/aucctus'

  log.info(`Using repository: ${remoteUrl}`)

  // Run release-please to create GitHub releases
  log.info('Running release-please github-release...')

  const releasePleaseCmd = `release-please github-release token=${token} --repo-url=${remoteUrl}`

  const result = runCommand(releasePleaseCmd)

  if (result) {
    log.success('GitHub releases created successfully!')
    console.log(result)
  } else {
    log.error(
      'Failed to create GitHub releases. Check the error message above.',
    )

    // Offer to try again with debug output
    log.info('Would you like to try again with debug output enabled?')
    const shouldTryAgain = await prompt('Try again with debug output? (y/n): ')

    if (shouldTryAgain.toLowerCase() === 'y') {
      log.info('Running with debug output...')

      const debugCmd = `release-please github-release token=${token} --repo-url=${remoteUrl} --debug`
      const debugResult = runCommand(debugCmd)

      if (debugResult) {
        log.success('GitHub releases created successfully with debug enabled!')
        console.log(debugResult)
      } else {
        log.error(
          'Failed again. Check the debug output above for more details.',
        )
      }
    }
  }
}

// Main function
const main = async () => {
  log.title('AUCCTUS GITHUB RELEASE')

  checkReleasePleaseCLI()
  await createGithubRelease()

  log.success('GitHub release process completed!')
  rl.close()
}

// Run the script
main().catch((error) => {
  console.error('Error running GitHub release script:', error)
  rl.close()
})
