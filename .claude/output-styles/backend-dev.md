---
name: backend-dev
description: Backend development with Django, Python, and automatic linting/type checking enforcement
keep-coding-instructions: true
---

# Backend Development Mode

You are working on the **Osiris Django Python backend** located in `/projects/server/`. This mode enforces strict code quality and type safety standards.

## Mandatory Development Workflow

After EVERY code change session (Edit, Write, or batch of changes), you MUST:

1. **Run Ruff Linting with Auto-Fix**
   ```bash
   cd projects/server && uv run ruff check --fix .
   ```
   - This automatically fixes most linting issues
   - Review the fixes applied
   - Address any remaining manual fixes required

2. **Run Type Checking**
   ```bash
   cd projects/server && uv run pyright .
   ```
   - Fix ALL type errors before considering the task complete
   - Add proper type hints where missing
   - Never leave type errors unresolved

3. **Iterate Until Clean**
   - If ruff check fails → review errors → fix → re-run
   - If pyright fails → fix type errors → re-run
   - Continue this loop until BOTH pass with zero errors
   - Only then is the task complete

## Backend Stack Reference

**Framework**: Django with Django Ninja (async API framework)
**Task Queue**: Celery with Redis broker
**Database**: PostgreSQL with connection pooling (PgBouncer)
**AI/LLM**: OpenAI, Anthropic, Google Gemini (via Lumis package)
**Testing**: pytest with Django test fixtures
**Type Checking**: Pyright (standard mode)
**Linting**: Ruff (replaces flake8, black, isort, etc.)

## Key Standards

### Python Code Style
- Line length: 200 characters
- Double quotes for strings
- snake_case for variables/functions
- Explicit type hints required
- Max cyclomatic complexity: 10

### Django Patterns

**Models**:
- UUID primary keys (not auto-increment)
- All fields must have `help_text`
- Use `LLMContextMixin` if AI agents need access
- Define `__context_fields__` for LLM-accessible fields

**API Routes**:
- Use `HTTPStatus` enum (not numeric codes)
- Use `ErrorSchema` for 4xx/5xx responses
- Use `MessageSchema` for success responses
- Always add `ClerkAuth()` for protected routes
- Never expose internal exception details

**Services**:
- Use `@sync_to_async` for transactional database operations
- Use `@transaction.atomic()` for transactions
- Emit events after commit: `transaction.on_commit()`

### AI Agent Patterns

**Preferred for new agents** - `BaseGeminiAgentBuilder.run()`:
```python
from core.ai.agents.base_gemini import BaseGeminiAgentBuilder

result = await (
    BaseGeminiAgentBuilder(account_uuid=account_uuid)
    .with_name("MyAgent")
    .with_model("gemini-3-flash-preview")
    .run(
        system_instruction=system_prompt,
        user_prompt="Analyze this data.",
        output_type=MyOutputType,
    )
)
```

**Legacy** - `ConceptAgentBuilder.build()` (still used in older agents):
```python
from core.ai.agents.concept import ConceptAgentBuilder

agent = (
    ConceptAgentBuilder[ResultType, ConceptAgentContext](
        account_uuid=account_uuid,
        concept_uuid=concept_uuid,
    )
    .with_concept_context(disabled=True)
    .with_name("Agent Name")
    .with_model("o4-mini")
    .with_output_format(ResultType)
    .build(instructions=system_prompt)
)
```

## Quality Checklist

Before completing any backend task, verify:
- [ ] `uv run ruff check --fix .` passes with zero errors
- [ ] `uv run pyright .` passes with zero errors
- [ ] Models have UUID primary keys
- [ ] All fields have `help_text`
- [ ] Routes use `HTTPStatus` enum
- [ ] Transactional writes use `@sync_to_async @transaction.atomic()`
- [ ] Tests written for new functionality

## Testing Commands

```bash
# Run all tests
cd projects/server && uv run pytest

# Run specific test file
cd projects/server && uv run pytest tests/apps/{domain}/test_file.py

# Run tests matching pattern
cd projects/server && uv run pytest -k "test_name"

# Exclude functional tests (default)
cd projects/server && uv run pytest

# Run only functional tests
cd projects/server && uv run pytest -m functional
```

## Important Reminders

- **NEVER** skip linting - ruff catches bugs and maintains consistency
- **NEVER** skip type checking - pyright prevents runtime errors
- **ALWAYS** run ruff with `--fix` to auto-fix issues
- **ALWAYS** re-run checks after fixes to verify they pass
- **ALWAYS** use `HTTPStatus` enum, not numeric codes (200, 404, etc.)
- Linting and type checking are **NON-NEGOTIABLE** parts of the development workflow

## Celery Task Routing

Tasks route by prefix:
- `background.*` → `background` queue
- `incubation.*` → `incubation` queue
- `ai_editing.*` → `ai_editing` queue
- `*` → `default` queue

## Database Operations

Always use the service layer pattern:
1. Models in `apps/{domain}/models/`
2. Schemas in `apps/{domain}/schemas/`
3. Services in `apps/{domain}/services/`
4. Routes in `apps/{domain}/routes/v1/`
