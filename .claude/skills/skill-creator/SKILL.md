---
name: skill-creator
description: Create new Claude Code skills following Anthropic's best practices. Use when the user wants to create a skill, build a skill, make a custom skill, or set up a new agent capability. Helps scaffold skill directories with proper structure, YAML frontmatter, and progressive disclosure patterns.
---

# Skill Creator

This skill helps you create new Claude Code skills following Anthropic's official Agent Skills architecture and best practices.

## When to Use This Skill

- User wants to create a new skill
- User asks to "build a skill" or "make a skill"
- User wants to package domain expertise for reuse
- User needs to scaffold a skill directory structure

## Quick Start

To create a new skill:

1. **Determine the skill location**:
   - Personal skills: `~/.claude/skills/your-skill-name/`
   - Project skills: `.claude/skills/your-skill-name/`

2. **Create the skill directory and SKILL.md file** with proper YAML frontmatter

3. **Add additional resources** (optional): templates, reference docs

## Required Skill Structure

Every skill MUST have a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it. Include trigger phrases.
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance for Claude to follow]

## Examples
[Concrete examples of using this Skill]
```

## YAML Frontmatter Requirements

### name (required)
- Maximum 64 characters
- Only lowercase letters, numbers, and hyphens
- Cannot contain XML tags
- Cannot contain reserved words: "anthropic", "claude"

### description (required)
- Must be non-empty
- Maximum 1024 characters
- Cannot contain XML tags
- **Should include both**:
  - What the Skill does
  - When Claude should trigger/use it (include trigger phrases)

## Progressive Disclosure Architecture

Skills use a 3-level loading system to minimize token usage:

### Level 1: Metadata (always loaded ~100 tokens)
- The YAML frontmatter (`name` and `description`)
- Loaded at startup in system prompt
- Used to determine when to trigger the skill

### Level 2: Instructions (loaded when triggered)
- The main body of SKILL.md
- Loaded only when the skill is activated
- Should be under 5k tokens

### Level 3: Resources (loaded as needed)
- Additional files, templates, reference docs
- Accessed via bash commands only when referenced
- Effectively unlimited size (doesn't consume context until accessed)

## Best Practices

### 1. Write Clear Trigger Descriptions

The description is the most critical part - it determines when Claude activates your skill.

**Formula:** `[What it does] + [When to use it] + [Trigger phrases]`

**Good description:**
```yaml
description: Generate API documentation from TypeScript interfaces. Use when user asks to document APIs, create API docs, generate interface documentation, or mentions OpenAPI/Swagger.
```

**Bad description:**
```yaml
description: Helps with documentation.
```

### 2. Use Progressive Disclosure

Don't put everything in SKILL.md. Structure your skill like this:

```
your-skill/
├── SKILL.md              # Core instructions (Level 2)
├── ADVANCED.md           # Advanced usage (Level 3)
├── REFERENCE.md          # Detailed reference (Level 3)
└── templates/
    └── template.md       # Template files (Level 3)
```

### 3. Provide Concrete Examples

Include 2-3 concrete examples showing:
- Input the user might provide
- Steps Claude should take
- Expected output or result

### 4. Reference Additional Files

Use markdown links to reference bundled files:
```markdown
For advanced configuration, see [ADVANCED.md](ADVANCED.md).
```

Claude will read these files via bash only when needed.

## Token Budget Guidelines

| Content Type | Recommended Size | Notes |
|--------------|------------------|-------|
| Description | < 200 chars | Always loaded, keep concise |
| SKILL.md body | < 5,000 tokens | Main instructions |
| Additional .md files | < 3,000 tokens each | Loaded on demand |

## Creating a Skill - Step by Step

1. **Identify the domain**: What specific capability should this skill provide?

2. **Write trigger phrases**: List 5-10 ways a user might request this capability

3. **Create the directory structure**:
   ```bash
   mkdir -p .claude/skills/my-skill
   ```

4. **Create SKILL.md** with:
   - YAML frontmatter (name + description with triggers)
   - Clear instructions
   - 2-3 concrete examples

5. **Add supporting files** (optional):
   - Templates for common outputs
   - Reference documentation

6. **Test the skill** by asking Claude to perform the task

## Skill Template

Use this template as a starting point for new skills:

```markdown
---
name: {{skill-name}}
description: {{Brief description of what this Skill does}}. Use when {{trigger phrases - list specific phrases or scenarios that should activate this skill}}.
---

# {{Skill Name}}

{{One paragraph overview of what this skill does and why it's useful.}}

## Quick Start

{{Minimal steps to use this skill - what does the user need to provide?}}

## Instructions

### Step 1: {{First Step}}
{{Clear guidance for the first action}}

### Step 2: {{Second Step}}
{{Clear guidance for the second action}}

### Step 3: {{Third Step}}
{{Clear guidance for the third action}}

## Examples

### Example 1: {{Simple Use Case}}

**User Request:**
{{Example user input}}

**Response:**
{{What Claude should produce}}

### Example 2: {{Complex Use Case}}

**User Request:**
{{Example user input}}

**Response:**
{{What Claude should produce}}

## Troubleshooting

### {{Common Issue 1}}
{{Solution}}
```

## Fetching Latest Documentation

For the most up-to-date information on creating skills, fetch the official Anthropic documentation:

- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

## Example Skills

### Simple Skill (minimal)

```markdown
---
name: git-commit-helper
description: Generate conventional commit messages. Use when user asks for commit messages, wants to commit changes, or mentions conventional commits.
---

# Git Commit Helper

Generate commit messages following Conventional Commits specification.

## Format
<type>(<scope>): <description>

[optional body]

## Types
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Tests
- chore: Maintenance

## Example
User: "commit message for adding user auth"
Output: feat(auth): add user authentication system
```

### Complex Skill (with resources)

```
api-docs-generator/
├── SKILL.md                 # Main instructions
├── OPENAPI.md               # OpenAPI-specific guidance
└── templates/
    ├── endpoint.md          # Endpoint documentation template
    └── schema.md            # Schema documentation template
```

## Skill Locations

| Location | Scope | Use Case |
|----------|-------|----------|
| `~/.claude/skills/` | Personal | Your personal workflow skills |
| `.claude/skills/` | Project | Team/project-specific skills |

## Common Mistakes to Avoid

### 1. Vague Descriptions
❌ `description: Helps with coding`
✅ `description: Generate Python unit tests using pytest. Use when user asks for tests, wants to test code, or mentions pytest/unittest.`

### 2. Overloading SKILL.md
❌ Putting 10,000+ tokens in SKILL.md
✅ Using progressive disclosure with multiple files

### 3. Missing Examples
❌ Abstract instructions without concrete examples
✅ 2-3 specific examples showing input → output

### 4. No Trigger Phrases
❌ `description: Creates documentation.`
✅ `description: Creates documentation. Use when user asks to document, generate docs, write API docs, or create README files.`

## Security Considerations

- Only use skills from trusted sources
- Review all bundled files before using external skills
- Be cautious of skills that fetch external data
- Audit any scripts for unexpected operations
