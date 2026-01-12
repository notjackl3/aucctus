# Claude Code Glossary

A quick reference guide for Claude Code features to help developers get the most out of AI-assisted development.

---

## Skills

**What they are:** Markdown files that teach Claude specialized knowledge for specific domains or tasks. Claude automatically decides when to use them based on matching your request to their descriptions.

**Key points:**
- Live in `.claude/skills/` (project) or `~/.claude/skills/` (personal)
- Require a `SKILL.md` file with YAML frontmatter (`name` and `description`)
- Use progressive disclosure - keep `SKILL.md` under 500 lines, link to detailed docs
- Can restrict tool access with `allowed-tools` for security-sensitive workflows

**When to use:**
- Codifying domain expertise (e.g., Django-to-React porting patterns)
- Standardizing complex workflows across the team
- Teaching Claude project-specific conventions

**Example trigger:** "Port this Django schema to TypeScript" activates the `osiris-aucctus-porting` skill

---

## Subagents

**What they are:** Specialized AI assistants that Claude delegates tasks to. Each has its own context window, tool access, and system prompt - preventing main conversation pollution.

**Key points:**
- Define in `.claude/agents/` (project) or `~/.claude/agents/` (personal)
- Include `name`, `description`, and custom system prompt in markdown with YAML frontmatter
- Can specify `tools`, `model`, and `skills` to preload
- Cannot spawn other subagents (prevents infinite nesting)

**When to use:**
- Code review after writing significant code
- Debugging with isolated investigation context
- Security audits with restricted tool access
- Data analysis with specialized SQL expertise

**Example:** A `code-reviewer` subagent that automatically runs `git diff` and checks for security issues

---

## Hooks

**What they are:** User-defined shell commands that execute automatically at specific lifecycle events. They provide deterministic control - certain actions always happen rather than relying on the LLM.

**Key points:**
- Configure via `/hooks` command or `settings.json`
- 10 events: `PreToolUse`, `PostToolUse`, `PermissionRequest`, `UserPromptSubmit`, `Notification`, `Stop`, `SubagentStop`, `PreCompact`, `SessionStart`, `SessionEnd`
- Receive JSON input via stdin with tool/event information
- Can block actions (exit code 2), provide feedback, or allow/deny permissions

**When to use:**
- Auto-formatting code after edits (run Prettier on `.ts` files)
- Protecting sensitive files from modification (`.env`, `package-lock.json`)
- Logging all executed commands for compliance
- Custom notifications when Claude needs input

**Example:** A `PostToolUse` hook on `Edit|Write` that runs `npx prettier --write` on TypeScript files

---

## Output Styles

**What they are:** Configurations that modify Claude's system prompt to adapt behavior beyond default software engineering mode while preserving core capabilities.

**Key points:**
- Three built-in styles: Default, Explanatory (educational insights), Learning (collaborative coding)
- Custom styles go in `.claude/output-styles/` or `~/.claude/output-styles/`
- `keep-coding-instructions: false` (default) removes coding-specific instructions
- Change via `/output-style` command or `/config`

**When to use:**
- Onboarding new developers with Explanatory mode
- Learning sessions where you want to understand "why"
- Non-coding tasks (documentation, analysis, planning)
- Team-specific interaction patterns

**Example:** An "explanatory" style that provides insights about implementation choices between coding tasks

---

## Custom Slash Commands

**What they are:** Reusable prompts stored as markdown files that you invoke explicitly with `/command-name`. Unlike skills (model-invoked), you control when they run.

**Key points:**
- Project commands: `.claude/commands/command-name.md`
- Personal commands: `~/.claude/commands/command-name.md`
- Support arguments via `$ARGUMENTS` placeholder in the markdown
- Triggered explicitly by typing `/command-name`

**When to use:**
- Standardized PR review workflows (`/review-pr`)
- Issue fixing templates (`/fix-issue 123`)
- Performance optimization checks (`/optimize`)
- Security audits (`/security-review`)

**Example:** `/fix-issue 123` expands to detailed steps for understanding, reproducing, and fixing GitHub issue #123

---

## Plugins

**What they are:** Installable packages that extend Claude Code with commands, agents, hooks, skills, and MCP servers from marketplaces.

**Key points:**
- Official marketplace plugins available via `/plugin install plugin-name@claude-plugins-official`
- Categories: LSP (language servers), integrations (GitHub, Linear, Figma), workflows
- Scopes: user (all projects), project (team), local (you in this repo), managed (enterprise)
- Add third-party marketplaces via `/plugin marketplace add owner/repo`

**When to use:**
- Adding language intelligence (TypeScript LSP, Python LSP)
- Connecting external services (GitHub, Linear, Sentry, Figma)
- Installing team workflow plugins

**Example:** `typescript-lsp` plugin adds jump-to-definition and type checking capabilities

---

## Headless Mode (Programmatic Usage)

**What it is:** Non-interactive CLI mode for scripting, CI/CD pipelines, and automation using the `-p` flag.

**Key points:**
- Run with `claude -p "your prompt"` for non-interactive execution
- Output formats: `text` (default), `json` (with metadata), `stream-json` (real-time)
- Auto-approve tools with `--allowedTools "Read,Edit,Bash"`
- Continue sessions with `--continue` or `--resume session_id`

**When to use:**
- CI/CD code review pipelines
- Automated linting scripts
- Batch processing of files
- Build script integration

**Example:** `cat build-error.txt | claude -p 'explain the root cause' --output-format json`

---

## MCP Servers (Model Context Protocol)

**What they are:** External tools and data sources that Claude can call via a standardized protocol. Often bundled in plugins.

**Key points:**
- Provide Claude access to external APIs, databases, and services
- Configured via plugins or manual setup in settings
- Examples: GitHub API, database connections, cloud services

**When to use:**
- Querying external project management tools (Linear, Jira)
- Accessing design systems (Figma)
- Interacting with cloud infrastructure (Vercel, Firebase)

---

## Plan Mode

**What it is:** A safe analysis mode where Claude explores code and creates plans before making changes, requiring explicit approval.

**Key points:**
- Enable with `Shift+Tab` during session or `--permission-mode plan`
- Claude can read but not modify files without approval
- Great for multi-step implementations and learning codebases
- Set as default in `.claude/settings.json`

**When to use:**
- Complex refactoring requiring careful planning
- Exploring unfamiliar codebases before modifications
- When you want to review all changes before they happen

---

## Session Management

**What it is:** Tools for resuming, naming, and organizing Claude Code conversations.

**Key points:**
- Resume recent: `claude --continue`
- Resume specific: `claude --resume session-name`
- Name sessions: `/rename auth-refactor`
- Use git worktrees for parallel sessions on different branches

**When to use:**
- Long-running feature development
- Switching between multiple concurrent tasks
- Maintaining context across sessions

---

## Quick Reference Table

| Feature | Triggered By | Location | Best For |
|---------|-------------|----------|----------|
| Skills | Claude (automatic) | `.claude/skills/` | Domain expertise |
| Subagents | Claude or explicit | `.claude/agents/` | Isolated tasks |
| Hooks | Lifecycle events | `settings.json` | Automation |
| Output Styles | `/output-style` | `.claude/output-styles/` | Behavior modes |
| Slash Commands | User (`/command`) | `.claude/commands/` | Reusable prompts |
| Plugins | `/plugin install` | Via marketplaces | Extensions |
| Plan Mode | `Shift+Tab` | Runtime | Safe exploration |
