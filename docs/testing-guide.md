# Testing Guide

This document outlines the comprehensive testing strategy implemented for the Multi-Tenancy AWS project using Jest and React Testing Library.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing

## Test Structure

### 1. Unit Tests

Unit tests focus on individual components and functions in isolation.

**Location**: `src/components/__tests__/`

**Examples**:
- `AuthForm.test.tsx` - Tests authentication form behavior
- `WorkspaceList.test.tsx` - Tests workspace listing and creation
- `FileManager.test.tsx` - Tests file upload/download functionality

**Key Testing Patterns**:
```typescript
// Mock external dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Test user interactions
const user = userEvent.setup();
await user.type(screen.getByLabelText('Username'), 'testuser');
await user.click(screen.getByRole('button', { name: 'Sign In' }));

// Assert expected outcomes
expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
```

### 2. Integration Tests

Integration tests verify complete user flows across multiple components.

**Location**: `src/__tests__/integration/`

**Examples**:
- `auth-flow.test.tsx` - Complete authentication workflow
- `workspace-project-flow.test.tsx` - Workspace and project management flows

**Key Features**:
- Tests full user journeys (registration → login → workspace creation → project management)
- Mocks API calls and external dependencies
- Verifies proper state management and navigation

### 3. API Route Tests

Tests for Next.js API routes to ensure proper request handling and responses.

**Location**: `src/app/api/__tests__/`

**Examples**:
- `auth.test.ts` - Authentication endpoint testing
- `workspaces.test.ts` - Workspace management endpoints

**Testing Approach**:
```typescript
// Mock external services
jest.mock('@/lib/auth');

// Test API endpoints
const request = new NextRequest('http://localhost:3000/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'user', password: 'pass' }),
});

const response = await loginPOST(request);
expect(response.status).toBe(200);
```

### 4. Snapshot Tests

Judiciously used to catch unintended UI changes in critical components.

**Location**: `src/components/__tests__/__snapshots__/`

**Usage Guidelines**:
- Only for stable, key UI components
- Focused on components with complex rendering logic
- Regularly reviewed and updated when intentional changes are made

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/lib/aws-config.ts', // Skip AWS config in tests
  ],
};
```

### Test Setup (`jest.setup.js`)

- Configures `@testing-library/jest-dom` matchers
- Mocks Next.js navigation hooks
- Mocks localStorage and fetch API
- Mocks AWS SDK to prevent actual AWS calls during testing

## Mocking Strategy

### 1. External Dependencies

**AWS SDK**: All AWS services are mocked to prevent actual cloud resource usage:
```javascript
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({ send: jest.fn() })),
}));
```

**Next.js Hooks**: Navigation and routing hooks are mocked:
```javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
```

### 2. API Calls

Fetch calls are mocked for predictable test outcomes:
```javascript
global.fetch = jest.fn();
mockFetch.mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
});
```

## Test Scripts

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test src/components/__tests__/AuthForm.test.tsx
```

### Coverage Configuration

Coverage reports include:
- **Statement coverage**: Percentage of code statements executed
- **Branch coverage**: Percentage of code branches taken
- **Function coverage**: Percentage of functions called
- **Line coverage**: Percentage of lines executed

Coverage is collected from all TypeScript/JavaScript files in `src/` except:
- Type definition files (`*.d.ts`)
- Layout components (`layout.tsx`)
- AWS configuration (to avoid testing credentials)

## Testing Best Practices

### 1. Test Structure

**Arrange-Act-Assert Pattern**:
```typescript
it('should authenticate user successfully', async () => {
  // Arrange
  const mockUser = { id: '1', username: 'test' };
  mockAuth.authenticateUser.mockResolvedValue(mockUser);

  // Act
  const result = await authenticateUser('test', 'password');

  // Assert
  expect(result).toEqual(mockUser);
});
```

### 2. User-Centric Testing

Focus on testing user interactions rather than implementation details:
```typescript
// Good - tests user behavior
await user.click(screen.getByRole('button', { name: 'Create Workspace' }));
expect(screen.getByText('New workspace created')).toBeInTheDocument();

// Avoid - tests implementation details
expect(component.state.workspaces).toHaveLength(1);
```

### 3. Descriptive Test Names

Use descriptive test names that explain the scenario and expected outcome:
```typescript
// Good
it('shows error message when login fails with invalid credentials', async () => {

// Avoid
it('handles login error', async () => {
```

### 4. Mock Management

- Clear mocks between tests using `beforeEach`
- Mock at the appropriate level (module, function, or implementation)
- Use specific return values for predictable test outcomes

## Error Handling Tests

All tests include error scenarios:
- Network failures
- Invalid user inputs
- API errors
- Edge cases (empty states, limits reached)

## Accessibility Testing

Tests include accessibility checks:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies (all mocked)
- Deterministic outcomes
- Fast execution times
- Clear failure messages

## Maintenance

### When to Update Tests

1. **Component Changes**: Update unit tests when component behavior changes
2. **API Changes**: Update API tests when endpoint contracts change
3. **User Flow Changes**: Update integration tests when user journeys change
4. **Snapshot Updates**: Review and update snapshots for intentional UI changes

### Test Coverage Goals

- **Minimum Coverage**: 80% overall coverage
- **Critical Paths**: 95% coverage for authentication, data management, and file operations
- **UI Components**: 90% coverage for interactive components

## Troubleshooting

### Common Issues

1. **Module Resolution**: Ensure `moduleNameMapper` in Jest config matches TypeScript paths
2. **Async Operations**: Use `waitFor` for asynchronous state changes
3. **Mocking Issues**: Verify mocks are set up before component rendering
4. **Snapshot Failures**: Review changes and update snapshots if intentional

### Debugging Tests

Use Jest's debugging features:
```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test with logs
npm test -- --verbose src/components/__tests__/AuthForm.test.tsx
```

This comprehensive testing setup ensures reliable, maintainable code with high confidence in the application's behavior across all critical user flows.