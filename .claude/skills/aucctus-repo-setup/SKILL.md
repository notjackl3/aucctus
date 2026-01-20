---
name: aucctus-repo-setup
description: Set up the Aucctus frontend development environment. Use when a new developer needs to set up the frontend, onboard to React/TypeScript, install dependencies, or mentions "setup aucctus", "frontend setup", or "getting started with frontend".
---

# Aucctus Frontend Repository Setup

Interactive setup assistant for the Aucctus React/TypeScript frontend. Checks prerequisites, installs dependencies, and guides developers through the complete setup process.

## Quick Start

Run this skill and follow the prompts. The skill will:
1. Check your system for required tools
2. Offer to install missing prerequisites
3. Install npm dependencies
4. Configure environment variables
5. Set up git hooks
6. Start the development server
7. Verify the setup works

## Instructions

### Phase 1: Detect Operating System

First, detect the operating system to determine installation commands:

```bash
uname -s
```

- `Darwin` = macOS (use `brew`)
- `Linux` = Linux (use `apt` or check for distro)

### Phase 2: Check Prerequisites

Check each prerequisite and track status. Run these checks:

#### Check Node.js
```bash
command -v node && node --version
```

Required version: **Node.js 20.x** (check `.node-version` file)

#### Check npm
```bash
command -v npm && npm --version
```

Report the status of each prerequisite in a table format:

| Prerequisite | Status | Version | Required |
|--------------|--------|---------|----------|
| Node.js | ✓ / ✗ | x.x.x | 20.x |
| npm | ✓ / ✗ | x.x.x | (bundled) |

### Phase 3: Install Missing Prerequisites

For missing prerequisites, ask the user if they want to install them:

#### macOS Installation Commands
```bash
# Node.js 20.x
brew install node@20

# Or using nvm (if installed)
nvm install 20
nvm use 20
```

#### Linux (Debian/Ubuntu) Installation Commands
```bash
# Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Phase 4: Install npm Dependencies

Navigate to the aucctus directory and install dependencies:

```bash
cd /Users/jduggan/GitRepos/osiris/aucctus && npm install
```

### Phase 5: Environment Configuration

Check if .env file exists:

```bash
test -f /Users/jduggan/GitRepos/osiris/aucctus/.env && echo "EXISTS" || echo "MISSING"
```

Check if .env.sample exists:

```bash
test -f /Users/jduggan/GitRepos/osiris/aucctus/.env.sample && echo "EXISTS" || echo "MISSING"
```

**If .env is MISSING:**

Ask the user:
1. "Do you have a .env file to copy into place?"
2. If yes: Tell them to copy it to `aucctus/.env`
3. If no: Ask if they want to copy from .env.sample (they'll need to fill in secrets later)

To copy from sample:
```bash
cp /Users/jduggan/GitRepos/osiris/aucctus/.env.sample /Users/jduggan/GitRepos/osiris/aucctus/.env
```

**Required environment variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_AUCCTUS_BASE_RESOURCE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_AUCCTUS_BASE_WS_URL` | WebSocket URL | `ws://localhost:8000` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth key | (required - get from team) |

**Optional environment variables:**
- `NODE_ENV` - `development` or `production`
- `ENVIRONMENT` - Application environment
- `VITE_SENTRY_DNS` - Sentry error tracking
- `VITE_DYNAMIC_FRONTEND_URL` - Dynamic frontend service URL
- Feature flags: `FEATURE_CUSTOMER_PROFILE_CHAT`, `FEATURE_CONCEPT_VERSIONING`, etc.

### Phase 6: Setup Git Hooks

Install Husky git hooks for pre-commit checks:

```bash
cd /Users/jduggan/GitRepos/osiris/aucctus && npm run prepare
```

### Phase 7: Start Development Server

Start the Vite development server:

```bash
cd /Users/jduggan/GitRepos/osiris/aucctus && npm run dev
```

The server will start on `http://localhost:5173`.

### Phase 8: Verify Setup

Check if the dev server is responding:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "Dev server not responding"
```

A `200` response means the server is running.

### Phase 9: Report Final Status

Display a summary:

```
## Setup Complete!

| Component | Status |
|-----------|--------|
| Node.js 20.x | ✓ Installed |
| npm Dependencies | ✓ Installed |
| Environment File | ✓ Present |
| Git Hooks | ✓ Configured |
| Dev Server | ✓ Running |

Frontend running at: http://localhost:5173

Next steps:
1. Fill in VITE_CLERK_PUBLISHABLE_KEY in .env
2. Ensure backend is running at http://localhost:8000
3. Open http://localhost:5173 in your browser
```

## Development Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run format` | Auto-format with Prettier |

## Examples

### Example 1: Fresh Setup

**User:** "I need to set up the frontend"

**Claude:**
1. Detects macOS
2. Checks Node.js - finds v18.x installed (wrong version)
3. Asks: "Node.js 20.x is required but you have 18.x. Install Node.js 20?"
4. User confirms, Claude runs installation
5. Runs `npm install`
6. Finds .env missing, asks user if they have one
7. User says no, Claude copies from .env.sample
8. Runs `npm run prepare` for git hooks
9. Starts dev server
10. Reports success with next steps

### Example 2: Partial Setup

**User:** "aucctus setup"

**Claude:**
1. Checks Node.js - correct version
2. Checks node_modules - exists
3. Checks .env - exists
4. Checks git hooks - configured
5. Starts dev server
6. Reports: "Everything is ready! Frontend at http://localhost:5173"

## Troubleshooting

### Node.js Version Mismatch
If you have the wrong Node.js version:
- Use nvm: `nvm install 20 && nvm use 20`
- Or reinstall: `brew unlink node && brew install node@20`

### npm install Fails
Try clearing the cache:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port 5173 Already in Use
Check what's using the port: `lsof -i :5173`
Or start on a different port: `npm run dev -- --port 3000`

### TypeScript Errors
Run type check to see all errors:
```bash
npm run type-check
```

### Backend Connection Issues
Ensure the Osiris backend is running:
```bash
curl http://localhost:8000/api/health
```

If not running, start it from the osiris root:
```bash
docker compose up -d
```

## Important Notes

1. **Separate Git Repository**: The `aucctus/` directory is its own Git repo. Run git commands from within `aucctus/`.

2. **Backend Required**: The frontend needs the Osiris backend running on `http://localhost:8000` for full functionality.

3. **Clerk Authentication**: You must have a valid `VITE_CLERK_PUBLISHABLE_KEY` to log in.
