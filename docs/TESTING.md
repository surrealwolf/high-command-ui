# Testing Guide - High Command UI

## Overview

High Command UI includes comprehensive testing infrastructure with **unit tests** powered by Vitest and **end-to-end tests** powered by Playwright.

## Quick Start

```bash
# Install dependencies (includes test frameworks)
npm install

# Run all unit tests
npm run test

# Run unit tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Unit Testing

### Framework: Vitest + React Testing Library

Vitest is a blazingly fast unit testing framework optimized for Vite projects, with excellent ES modules support and TypeScript integration.

### Running Unit Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- src/test/api.test.ts

# Run tests matching pattern
npm run test -- --grep "ChatInterface"

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
src/test/
├── setup.ts                  # Global test setup, mocks, fixtures
├── api.test.ts              # High Command API service tests
├── claude.test.ts           # Claude service tests
├── ChatInterface.test.tsx    # Chat component tests
└── DataDisplay.test.tsx      # Data display component tests
```

### Writing Tests

#### Service Tests (api.test.ts, claude.test.ts)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import HighCommandAPI from '../../services/api'

describe('HighCommandAPI', () => {
  let api: HighCommandAPI

  beforeEach(() => {
    api = new HighCommandAPI()
    vi.clearAllMocks()
  })

  it('should fetch war status', async () => {
    const mockData = { status: 'active' }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    const result = await api.getWarStatus()
    expect(result).toEqual(mockData)
  })
})
```

#### Component Tests (ChatInterface.test.tsx)

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInterface from '../../components/ChatInterface'

describe('ChatInterface', () => {
  it('should render welcome message', () => {
    render(
      <ChatInterface
        messages={[]}
        loading={false}
        onSendMessage={vi.fn()}
        messagesEndRef={{ current: null }}
      />
    )
    expect(screen.getByText(/STRATEGIST REPORTS FOR DUTY/)).toBeInTheDocument()
  })

  it('should send message on form submit', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()

    render(
      <ChatInterface
        messages={[]}
        loading={false}
        onSendMessage={onSendMessage}
        messagesEndRef={{ current: null }}
      />
    )

    const input = screen.getByPlaceholderText(/Enter command/)
    await user.type(input, 'Test message')
    await user.keyboard('{Enter}')

    expect(onSendMessage).toHaveBeenCalledWith('Test message')
  })
})
```

### Test Coverage

Current test files cover:

- **api.ts**
  - `getWarStatus()` - War status fetching
  - `getCampaignInfo()` - Campaign info retrieval
  - `getPlanets()` - Planet data fetching
  - `getFactions()` - Faction data retrieval
  - `getBiomes()` - Biome information
  - `getStatistics()` - Game statistics
  - Error handling and null returns
  - Keyword interpretation for fallback mode

- **claude.ts**
  - Constructor initialization
  - `getAvailableTools()` - Tool fetching and caching
  - `executeCommand()` - Command execution flow
  - Tool formatting for Claude API
  - Error handling and API key validation
  - Conversation history management

- **ChatInterface.tsx**
  - Welcome message rendering
  - Quick action button display
  - Message display and threading
  - Loading indicator state
  - User message input and submission
  - Empty message handling
  - Keyboard Enter submission
  - Accessibility features

- **DataDisplay.tsx**
  - Empty/null data handling
  - Loading state display
  - JSON data rendering
  - Array data formatting
  - Numeric, boolean, and string values

### Mocking Strategies

#### Mocking Fetch

```typescript
global.fetch = vi.fn().mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'test' })
})
```

#### Mocking Services

```typescript
vi.mock('../../services/claude', () => ({
  ClaudeService: vi.fn(() => ({
    executeCommand: vi.fn(),
    getAvailableTools: vi.fn()
  }))
}))
```

#### Mocking User Events

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.type(input, 'text')
await user.click(button)
await user.keyboard('{Enter}')
```

## E2E Testing

### Framework: Playwright

Playwright provides reliable cross-browser testing with real browser automation.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (debug mode)
npx playwright test --ui

# Run specific test file
npx playwright test e2e/chat.spec.ts

# Run single test
npx playwright test -g "should send message"

# Run on specific browser
npx playwright test --project=chromium

# Generate and view report
npx playwright show-report
```

### Test Structure

```
e2e/
└── chat.spec.ts  # Chat interface integration tests
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should send message and display response', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  const input = page.locator('input[placeholder*="command"]')
  const submitButton = page.locator('button:has-text("SEND COMMAND")')

  await input.fill('What is the war status?')
  await submitButton.click()

  await page.waitForTimeout(1000)
  await expect(page.locator('text=What is the war status?')).toBeVisible()
})
```

### Test Coverage

**Chat Interface Integration Tests:**
- Welcome message display on load
- Message sending and response display
- Quick action button execution
- Tab navigation between console/galactic/news/major/help
- Loading state display during API calls
- Error handling when API unavailable
- Keyboard Enter key submission
- Empty message rejection
- Multiple sequential messages
- Markdown rendering in responses
- Chat UI element rendering
- Scroll position maintenance
- Rapid message submission handling

### Playwright Configuration

**File:** `playwright.config.ts`

- **Test directory:** `e2e/`
- **Test match:** `**/*.spec.ts`
- **Base URL:** `http://localhost:3000`
- **Retries:** 0 (dev), 2 (CI)
- **Workers:** Auto (dev), 1 (CI)
- **Browsers:** Chromium, Firefox, WebKit
- **Screenshots:** Only on failure
- **Traces:** On first retry

### Debugging E2E Tests

```bash
# Interactive debug mode
npx playwright test --debug

# Step through with inspector
npx playwright test --debug -g "should send message"

# Enable trace viewer
npx playwright test --trace on

# View traces
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Coverage Reports

### Generate Coverage

```bash
npm run test:coverage
```

This creates an HTML report in `coverage/`:

```bash
open coverage/index.html
```

### Coverage Targets

- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

### Excluded from Coverage

- `node_modules/`
- `src/test/`
- `**/*.d.ts`
- `dist/`

## Best Practices

### Unit Tests

✅ **Do:**
- Test behavior, not implementation details
- Use descriptive test names
- Keep tests focused and isolated
- Mock external dependencies
- Use `beforeEach` for setup
- Clean up with `afterEach`

❌ **Don't:**
- Test framework internals
- Make unrelated assertions
- Skip tests (use `.skip` deliberately)
- Create global state
- Make actual API calls

### E2E Tests

✅ **Do:**
- Test complete user workflows
- Use page object model for maintainability
- Wait for elements explicitly
- Check multiple browsers
- Use meaningful selectors

❌ **Don't:**
- Test implementation details
- Use hard sleeps (use `waitFor` instead)
- Mix test concerns
- Rely on test order
- Use overly specific selectors

## Troubleshooting

### Vitest Issues

**Tests not found:**
```bash
npm run test -- --reporter=verbose
```

**Module resolution errors:**
- Check `vitest.config.ts` path aliases
- Verify imports are correct

**Timeout errors:**
- Increase timeout: `vi.setConfig({ testTimeout: 10000 })`
- Check for unresolved promises

### Playwright Issues

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Browser not found:**
```bash
npx playwright install
npx playwright install --with-deps
```

**Flaky tests:**
- Use `waitForLoadState('networkidle')`
- Avoid hard timeouts
- Check for race conditions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testing-library.com/docs/best-practices)

## Contributing Tests

When adding features:

1. Write unit tests first (TDD approach)
2. Add E2E tests for user flows
3. Maintain >80% coverage
4. Run full test suite before pushing
5. Update this guide if adding new test patterns
