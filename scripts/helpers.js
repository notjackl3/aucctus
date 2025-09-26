/* eslint-disable no-console */
const readline = require('readline')
const { execSync } = require('child_process')

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
}

// Helper to log with color
const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  title: (msg) =>
    console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}\n`),
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper to run commands
const runCommand = (command) => {
  try {
    return execSync(command, { encoding: 'utf8' })
  } catch (error) {
    log.warning(`Command failed: ${command}`)
    log.warning(error.message)
    return null
  }
}

// Prompt for user input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset}`, (answer) => {
      resolve(answer)
    })
  })
}

// Check if we're on the develop branch
const checkBranch = async (branchName) => {
  const currentBranch = runCommand('git branch --show-current').trim()
  if (currentBranch !== branchName) {
    log.error(
      `You must be on the '${branchName}' branch to create a release. Current branch: '${currentBranch}'`,
    )
    const answer = await prompt(
      `Do you want to switch to '${branchName}' branch? (y/n): `,
    )
    if (answer.toLowerCase() === 'y') {
      log.info(`Switching to '${branchName}' branch...`)
      runCommand(`git checkout ${branchName}`)
      log.success(`Switched to '${branchName}' branch`)
    } else {
      log.error(
        `Aborting release process. Please switch to '${branchName}' branch and try again.`,
      )
      process.exit(1)
    }
  } else {
    log.success(`Already on '${branchName}' branch ✓`)
  }
}

/**
 * Parse command line arguments into a structured object
 * @returns {Object} Map of argument keys to values
 */
const parseArguments = () => {
  const args = process.argv.slice(2)
  const argMap = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2)
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        argMap[key] = args[i + 1]
        i++
      } else {
        argMap[key] = true
      }
    }
  }

  return argMap
}

module.exports = {
  rl,
  runCommand,
  prompt,
  colors,
  log,
  checkBranch,
  parseArguments,
}
