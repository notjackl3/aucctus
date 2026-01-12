#!/bin/bash
# Claude Code PostToolUse Hook: TypeScript & ESLint Checker
# Runs after Edit/Write and feeds errors back to Claude for automatic fixing
#
# Exit codes:
#   0 - Success (no errors)
#   2 - Blocking error (stderr fed back to Claude to fix)

set -o pipefail

# Read the hook input from stdin
INPUT=$(cat)

# Extract file path from the tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path or not a TS/JS file
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

if ! echo "$FILE_PATH" | grep -qE '\.(ts|tsx|js|jsx)$'; then
    exit 0
fi

# Change to project directory
cd "$CLAUDE_PROJECT_DIR" || exit 0

# Collect all errors
ERRORS=""
HAS_ERRORS=0

# Run TypeScript check
echo "Running TypeScript check..." >&2
TSC_OUTPUT=$(npm run type-check 2>&1)
TSC_EXIT=$?

if [ $TSC_EXIT -ne 0 ]; then
    HAS_ERRORS=1
    ERRORS="${ERRORS}

=== TypeScript Errors ===
${TSC_OUTPUT}"
fi

# Run ESLint
echo "Running ESLint..." >&2
LINT_OUTPUT=$(npm run lint 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
    HAS_ERRORS=1
    ERRORS="${ERRORS}

=== ESLint Errors ===
${LINT_OUTPUT}"
fi

# If there are errors, exit with code 2 to feed them back to Claude
if [ $HAS_ERRORS -ne 0 ]; then
    echo "TypeScript/ESLint errors detected. Please fix these errors:" >&2
    echo "$ERRORS" >&2
    echo "" >&2
    echo "Fix all the errors above and the checks will run again automatically." >&2
    exit 2
fi

# All checks passed
echo "All TypeScript and ESLint checks passed."
exit 0
