# Aucctus Frontend

## Requirements

- Node.js 20.x

## Commands

- `dev`/`start` - start dev server and open browser
- `build` - build for production
- `preview` - locally preview production build
- `test` - launch test runner

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod

```

## Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for semantic versioning and automatic changelog generation.

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) to generate the changelog automatically:

- `feat: add new feature` - New feature (minor version bump)
- `fix: resolve bug` - Bug fix (patch version bump)
- `docs: update README` - Documentation changes
- `style: format code` - Formatting changes
- `refactor: simplify code` - Code refactoring
- `perf: improve performance` - Performance improvements
- `test: add tests` - Test changes
- `chore: update dependencies` - Chores like dependency updates
- `build: update build process` - Build system changes
- `ci: update CI pipeline` - CI configuration changes

Breaking changes should include `BREAKING CHANGE:` in the commit message body.

### Release Workflow

Our release process follows these steps:

1. Development happens on feature branches
2. Features are merged to the `develop` branch
3. When ready for release, run the release helper script:

   ```bash
   # Basic interactive mode
   npm run release

   # Force a release (regardless of conventional commits)
   npm run release -- --force-release

   # Specify exact version
   npm run release -- --release-as 2.2.1
   ```

4. The script will:
   - Verify you're on the `develop` branch
   - Pull the latest changes
   - Use release-please CLI to create a PR from `develop` to `prod`
   - Use GITHUB_TOKEN from your environment or prompt for one
5. After the PR is merged to `prod`, run:
   ```bash
   npm run release-github
   ```
6. This will:
   - Create a release with the appropriate version bump
   - Generate a changelog based on commit messages
   - Create a git tag for the version
   - Trigger the deployment process

### Release Options

The release script supports several modes:

- **Auto**: Determines version based on conventional commits
- **Force**: Creates a release even when no conventional commits are detected
- **Version**: Explicitly sets the next version number

You can use either interactive prompts or command-line arguments to control this behavior.

### Versioning

Version numbers follow semantic versioning (MAJOR.MINOR.PATCH):

- Major: Breaking changes
- Minor: New features (backwards compatible)
- Patch: Bug fixes (backwards compatible)

For versions below 1.0.0, minor changes may be treated as patches.

## Troubleshooting

**Bootstrap**

If you're running into issues with bootstrap and scss. Simply re-install the scss node module followed by reinstalling bootstrap.

```bash
npm install scss
# then
npm install bootstrap

```
