# Contributing to Project Hub

Thank you for considering contributing to Project Hub! We're excited to have you join the community.

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, check the [issue list](https://github.com/yourusername/project-hub/issues) as you might find out that you don't need to create one. When you do create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/project-hub/issues). When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript/React style guides
- Include appropriate test cases
- End all files with a newline
- Reference relevant issues

## Development Setup

1. **Fork the repository**

```bash
git clone https://github.com/your-username/project-hub.git
cd project-hub
npm install
```

2. **Create a branch**

```bash
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

3. **Make your changes**

4. **Test your changes**

```bash
npm run dev      # Start development server
npm run build    # Test production build
npm run lint     # Run linter
```

5. **Commit your changes**

Use clear and descriptive commit messages:

```bash
git commit -m "feat: add new feature" # Feature
git commit -m "fix: resolve issue" # Bug fix
git commit -m "docs: update documentation" # Documentation
git commit -m "style: format code" # Formatting
git commit -m "refactor: restructure code" # Refactoring
git commit -m "test: add tests" # Tests
```

6. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request**

## Style Guides

### Commit Messages

- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript/React

- Use TypeScript for all new files
- Follow the existing code style
- Use functional components with hooks
- Add JSDoc comments for public functions
- Use meaningful variable names

Example:

```typescript
/**
 * Fetches user data and updates the state.
 * @param userId - The ID of the user to fetch
 * @returns Promise that resolves when data is fetched
 */
async function fetchUserData(userId: string): Promise<void> {
  // Implementation
}
```

### Tailwind CSS

- Use utility classes for styling
- Follow mobile-first approach
- Use semantic HTML

### Database Changes

- Always create migrations for schema changes
- Follow naming conventions (snake_case for fields)
- Add relations properly
- Document breaking changes

```prisma
model NewModel {
  id    String   @id @default(cuid())
  name  String
  // More fields...
  
  @@map("new_models")
}
```

## Testing

- Write tests for new features
- Run `npm test` before pushing
- Aim for >80% code coverage for critical paths
- Test edge cases and error scenarios

## Documentation

- Update README.md if you add new features
- Add comments for complex logic
- Update SETUP.md for setup changes
- Create examples for new features

## Project Priorities

1. **Security** - Always prioritize security
2. **Performance** - Keep performance in mind
3. **Accessibility** - Make features accessible
4. **User Experience** - Keep UX intuitive
5. **Code Quality** - Maintain code standards

## Release Process

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for breaking changes
- **MINOR** version for new features
- **PATCH** version for bug fixes

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

### Additional Resources

- [Project Hub Documentation](https://docs.project-hub.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- GitHub contributors page
- Monthly community highlights

## Questions?

Don't hesitate to reach out:
- 📧 Email: support@project-hub.dev
- 💬 Discord: [Join our community](https://discord.gg/project-hub)
- 💡 GitHub Discussions: [Ask a question](https://github.com/yourusername/project-hub/discussions)

Thank you for contributing to Project Hub! 🎉

