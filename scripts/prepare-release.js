#!/usr/bin/env node
/* eslint-disable no-console */
const {
  log,
  runCommand,
  prompt,
  checkReleasePleaseCLI,
  checkBranch,
  parseArguments,
  rl,
} = require('./helpers')

const BRANCH_NAME = 'develop'
const RELEASE_BRANCH_NAME = `prod`

// Parse command line arguments
const argMap = parseArguments()

// Check for uncommitted changes
const checkForUncommittedChanges = async () => {
  const status = runCommand('git status --porcelain')
  if (status && status.trim()) {
    log.error('You have uncommitted changes:')
    console.log(status)
    log.error(
      'Please commit or stash your changes before creating a release PR.',
    )
    process.exit(1)
  } else {
    log.success('Working directory is clean ✓')
  }
}

// Pull latest changes
const pullLatestChanges = async () => {
  log.info(`Pulling latest changes from origin/${BRANCH_NAME}...`)
  const result = runCommand(`git pull origin ${BRANCH_NAME}`)
  if (result && !result.includes('Already up to date')) {
    log.success('Latest changes pulled ✓')
    return true
  } else if (result) {
    log.success(`Already up to date with origin/${BRANCH_NAME} ✓`)
    return false
  } else {
    log.error(
      'Failed to pull latest changes. Please check your connection and try again.',
    )
    process.exit(1)
  }
}

// Create release PR using release-please CLI
const createReleasePR = async () => {
  log.title('CREATING RELEASE PR')
  log.info('Using release-please CLI to create a release PR...')

  // Check for GitHub token in environment first
  let token = process.env.GITHUB_TOKEN

  // If not found in environment, prompt user
  if (!token) {
    log.info('No GITHUB_TOKEN found in environment.')
    log.info('A GitHub token with repo write permissions is required.')
    log.info(
      `This token will be used to create a PR from ${BRANCH_NAME} to ${RELEASE_BRANCH_NAME}.`,
    )
    token = await prompt('Enter your GitHub token: ')

    if (!token || token.trim() === '') {
      log.error('No token provided. Aborting.')
      process.exit(1)
    }
  } else {
    log.success('Using GITHUB_TOKEN from environment ✓')
  }

  // remote url
  const remoteUrl = 'Aucctus/aucctus'

  // Run release-please to create a release PR
  log.info('Running release-please release-pr...')

  // Get additional flags for release-please
  const additionalFlags = await buildReleasePleaseFlags(argMap, prompt)
  const releasePleaseCmd = `release-please release-pr --token=${token} --repo-url=${remoteUrl} --target-branch=${RELEASE_BRANCH_NAME} ${additionalFlags}`

  const result = runCommand(releasePleaseCmd)

  if (result) {
    log.success('Release PR created successfully!')
    console.log(result)
  } else {
    log.error('Failed to create release PR. Check the error message above.')
  }
}

// Show instructions for completing the release
const showReleaseInstructions = () => {
  log.title('RELEASE INSTRUCTIONS')
  log.info('1. Review the release PR on GitHub')
  log.info('2. Get required approvals')
  log.info('3. Merge the PR to prod')
  log.info('4. After merging to prod, run:')
  log.info('   npm run release-github')
  log.info('   This will create GitHub releases based on the merged PR')
  log.info(
    '\nThe release PR includes version bumps and changelog updates based on your conventional commits.',
  )
}

// Main function
const main = async () => {
  log.title('AUCCTUS RELEASE PREPARATION')

  await checkBranch(BRANCH_NAME)
  await checkForUncommittedChanges()
  await pullLatestChanges()
  checkReleasePleaseCLI()

  const shouldContinue = await prompt(
    `Ready to create a release PR from ${BRANCH_NAME} to ${RELEASE_BRANCH_NAME}? (y/n): `,
  )
  if (shouldContinue.toLowerCase() !== 'y') {
    log.warning('Release process aborted.')
    process.exit(0)
  }

  await createReleasePR()
  showReleaseInstructions()

  rl.close()
}

// Run the script
main().catch((error) => {
  console.error('Error running release script:', error)
  rl.close()
})
