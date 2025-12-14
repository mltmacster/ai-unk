# Contributing to AI Unk

First off, thank you for considering contributing to AI Unk! It's people like you that make AI Unk such a great tool for empowering the next generation of tech entrepreneurs.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this code.

**Our Standards:**
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members
- Accept constructive criticism gracefully

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS 14.0]
 - Browser: [e.g. Chrome 120]
 - Node version: [e.g. 22.0.0]
 - App version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** and description
- **Use case**: Why is this enhancement useful?
- **Proposed solution**: How should it work?
- **Alternatives**: What other solutions have you considered?
- **Additional context**: Screenshots, mockups, or examples

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the coding standards
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm
- MySQL/TiDB database

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-unk.git
   cd ai-unk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Run tests**
   ```bash
   pnpm test
   ```

## Pull Request Process

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

Examples:
- `feature/conversation-search`
- `fix/auth-redirect-404`
- `docs/update-setup-guide`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(chat): add conversation search functionality

Implements real-time search across conversation titles and messages.
Includes debouncing for performance optimization.

Closes #123
```

```
fix(auth): resolve 404 error on login redirect

Changed login redirect from /login route to proper OAuth URL.

Fixes #456
```

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compiles without errors (`pnpm check`)
- [ ] New code has appropriate test coverage
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow the conventional format
- [ ] PR description clearly explains the changes
- [ ] Screenshots/GIFs included for UI changes
- [ ] Breaking changes are clearly documented

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Related Issues
Closes #(issue number)
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types; use proper typing
- Use interfaces for object shapes
- Use type aliases for unions and complex types

**Example:**
```typescript
// Good
interface User {
  id: number;
  name: string;
  email: string | null;
}

// Avoid
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Prefer named exports over default exports
- Use TypeScript for prop types
- Keep components focused and small
- Extract reusable logic into custom hooks

**Example:**
```typescript
// Good
export function ChatMessage({ message, sender }: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div onMouseEnter={() => setIsHovered(true)}>
      {message}
    </div>
  );
}

interface ChatMessageProps {
  message: string;
  sender: 'user' | 'ai_unk';
}
```

### tRPC Procedures

- Use Zod for input validation
- Keep procedures focused on single responsibilities
- Use appropriate procedure types (public/protected)
- Include error handling
- Add JSDoc comments for complex logic

**Example:**
```typescript
export const appRouter = router({
  chat: router({
    send: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string().min(1).max(5000),
      }))
      .mutation(async ({ ctx, input }) => {
        // Implementation
      }),
  }),
});
```

### Database Operations

- Use Drizzle ORM for all database operations
- Keep database logic in `server/db.ts`
- Use transactions for multi-step operations
- Handle errors appropriately
- Add database indexes for frequently queried fields

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme
- Use shadcn/ui components when possible
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

### File Organization

- Place React components in `client/src/components/`
- Place pages in `client/src/pages/`
- Place server logic in `server/`
- Place shared types in `shared/`
- Keep files focused and under 300 lines

## Testing Guidelines

### Unit Tests

Write unit tests for:
- Database helper functions
- Utility functions
- tRPC procedures
- Custom hooks

**Example:**
```typescript
describe('getUserProgress', () => {
  it('should return user progress', async () => {
    const progress = await db.getUserProgress(1);
    expect(progress).toBeDefined();
    expect(progress?.userId).toBe(1);
  });
});
```

### Integration Tests

Test complete workflows:
- User authentication flow
- Conversation creation and messaging
- Admin provider management

### Test Coverage

- Aim for 80%+ code coverage
- Focus on critical paths
- Test edge cases and error conditions
- Mock external dependencies (AI APIs, etc.)

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/chat.test.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

## Documentation

### Code Comments

- Use JSDoc for functions and complex logic
- Explain *why*, not *what*
- Keep comments up-to-date
- Remove commented-out code

**Example:**
```typescript
/**
 * Retrieves the last N messages for a conversation to provide context
 * for the AI. Limits to 10 messages to stay within token limits while
 * maintaining conversation continuity.
 */
async function getConversationContext(conversationId: number, limit = 10) {
  // Implementation
}
```

### README Updates

When adding features:
- Update the main README.md
- Add to the Features section
- Update the API Documentation section
- Add to the Roadmap if applicable

### API Documentation

For new tRPC procedures:
- Document in API_DOCUMENTATION.md
- Include input/output types
- Provide usage examples
- Note any authentication requirements

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/yourusername/ai-unk/discussions)
- **Bugs?** Open a [GitHub Issue](https://github.com/yourusername/ai-unk/issues)
- **Chat?** Join our community (link when available)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for their contributions
- Special thanks in documentation

Thank you for contributing to AI Unk! Together, we're empowering the next generation of tech entrepreneurs. 🚀
