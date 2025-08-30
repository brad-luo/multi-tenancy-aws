# Contributing to Multi-Tenant Workspace Management System

First off, thank you for considering contributing to our project! 🎉 It's people like you that make this project such a great tool for the community.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [What We're Looking For](#what-were-looking-for)
- [How to Contribute](#how-to-contribute)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [project-email@example.com].

### Our Pledge

We pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## What We're Looking For

We welcome many different types of contributions, including:

- 🐛 **Bug fixes**
- ✨ **New features** 
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- 🧪 **Test coverage improvements**
- 🔧 **Performance optimizations**
- 🌍 **Internationalization/localization**
- 📝 **Code examples and tutorials**

### Priority Areas

We're particularly interested in contributions in these areas:

- **OAuth Integration**: Adding support for Google, GitHub, Microsoft authentication
- **File Management**: Enhanced file operations (preview, versioning, drag-and-drop)
- **Performance**: Database query optimization, caching strategies
- **Security**: Security audits, vulnerability fixes
- **Testing**: Increased test coverage, E2E testing
- **Accessibility**: WCAG compliance improvements

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

**Use the following template:**

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
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
- Node.js version
- npm/yarn version

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful** to most users
- **List some other applications where this enhancement exists** if applicable

## Getting Started

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/multi-tenancy-aws.git
   cd multi-tenancy-aws
   ```

3. **Add the original repository as upstream**:
   ```bash
   git remote add upstream https://github.com/original-owner/multi-tenancy-aws.git
   ```

4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your AWS credentials
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

### Branch Naming Convention

Use descriptive branch names that follow this pattern:

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation changes
- `test/description` - for test-related changes
- `refactor/description` - for code refactoring
- `style/description` - for styling changes

Examples:
- `feature/oauth-google-integration`
- `fix/file-upload-validation`
- `docs/api-endpoint-documentation`

## Development Process

### Making Changes

1. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our style guidelines

4. **Test your changes**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add oauth google integration
   
   - Add Google OAuth provider configuration
   - Update authentication context to support OAuth
   - Add OAuth callback handling
   - Update UI with Google sign-in button
   
   Closes #123"
   ```

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts

**Examples:**
```bash
feat(auth): add google oauth integration
fix(upload): resolve file size validation error
docs(readme): update installation instructions
test(components): add file manager component tests
```

## Pull Request Process

### Before Submitting

- [ ] **Test your changes thoroughly**
- [ ] **Add or update tests** as needed
- [ ] **Update documentation** if you've changed APIs
- [ ] **Run the linter** and fix any issues
- [ ] **Ensure all tests pass**
- [ ] **Check that your code follows our style guidelines**

### Submitting a Pull Request

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - **Clear title** that summarizes the change
   - **Detailed description** of what the PR does
   - **Link to any relevant issues**
   - **Screenshots** for UI changes
   - **Breaking change notes** if applicable

### Pull Request Template

```markdown
## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable):

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated checks** must pass (tests, linting, build)
2. **At least one maintainer** will review your PR
3. **Address feedback** if requested
4. **Get approval** from a maintainer
5. **Merge** will be handled by maintainers

## Style Guidelines

### Code Style

We use ESLint and Prettier to enforce consistent code style:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### Key Guidelines

- **Use TypeScript** for all new code
- **Prefer functional components** with hooks
- **Use descriptive variable names**
- **Add JSDoc comments** for complex functions
- **Follow existing patterns** in the codebase
- **Keep functions small** and focused
- **Use meaningful commit messages**

### File Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── __tests__/      # Component tests
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── config/             # Configuration files
└── constants/          # Application constants
```

### React/Next.js Guidelines

- Use **Server Components** when possible
- Implement proper **error boundaries**
- Use **React.Suspense** for loading states
- Prefer **composition over inheritance**
- Use **custom hooks** for complex logic
- Implement **proper TypeScript types**

### CSS/Styling Guidelines

- Use **Tailwind CSS** classes
- Follow **mobile-first** responsive design
- Use **semantic HTML** elements
- Ensure **accessibility** compliance
- Test across **different browsers**

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- components/FileManager.test.tsx
```

### Writing Tests

- **Write tests for new features**
- **Test edge cases and error conditions**
- **Use descriptive test names**
- **Group related tests with `describe` blocks**
- **Mock external dependencies**
- **Test user interactions, not implementation details**

### Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something when condition is met', () => {
    // Arrange
    const props = { /* test props */ };
    
    // Act
    render(<ComponentName {...props} />);
    
    // Assert
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Documentation

### Code Documentation

- **Document public APIs** with JSDoc
- **Add inline comments** for complex logic
- **Keep README.md** up to date
- **Document breaking changes**

### API Documentation

When adding new API endpoints:

1. **Document the endpoint** in the code
2. **Add request/response examples**
3. **Update API documentation**
4. **Include error responses**

### Examples

```typescript
/**
 * Creates a new workspace for the authenticated user
 * @param name - The workspace name (1-50 characters)
 * @param description - Optional workspace description
 * @param userId - The authenticated user's ID
 * @returns Promise<Workspace | null> - The created workspace or null if failed
 * @throws {Error} When workspace limit is exceeded
 */
export async function createWorkspace(
  name: string,
  userId: string,
  description?: string
): Promise<Workspace | null> {
  // Implementation
}
```

## Community

### Getting Help

- 📖 **Documentation**: Check the `/docs` directory
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Create an issue for bugs and feature requests
- 📧 **Email**: Contact maintainers at [project-email@example.com]

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: General questions, ideas
- **Pull Request Reviews**: Code-specific discussions

### Recognition

Contributors are recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **Special mentions** in project announcements

## Development Tips

### Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Check TypeScript
npm run type-check

# Update dependencies
npm update

# Clean install
rm -rf node_modules package-lock.json && npm install
```

### IDE Setup

**Recommended VS Code extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

### Performance Considerations

- **Lazy load components** when appropriate
- **Optimize images** and assets
- **Use React.memo** for expensive components
- **Implement proper caching** strategies
- **Monitor bundle size**

## Questions?

Don't hesitate to reach out if you have questions about contributing. We're here to help and appreciate every contribution, no matter how small!

**Happy Contributing! 🚀**

---

*This contributing guide is inspired by open source best practices and is designed to make contributing to this project as easy and transparent as possible.*