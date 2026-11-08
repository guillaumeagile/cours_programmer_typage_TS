# Jest vs Vitest: Running the Same Tests

This project demonstrates how to **mix Jest and Vitest** in the same project. Both test frameworks are installed and can coexist peacefully.

## Files

- **`00-internal-state-coupling.test.ts`** - Jest version
- **`00-internal-state-coupling.vitest.spec.ts`** - Vitest version

Both files contain **identical test logic**. The only difference is the import statement.

## Key Differences

### Import Statement

**Jest:**
```typescript
import { describe, it, expect } from '@jest/globals';
```

**Vitest:**
```typescript
import { describe, it, expect } from 'vitest';
```

## Assertion System

Both Jest and Vitest use **identical assertion syntax**:

```typescript
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toThrow()
// All standard Jest matchers work identically in both
```

### Vitest Enhancements

#### 1. Better Error Messages

When assertions fail, Vitest provides clearer, more readable diffs:

**Jest output:**
```
Expected: {"id": "1", "name": "Alice"}
Received: {"id": "2", "name": "Bob"}
```

**Vitest output:**
```
- Expected  - 1
+ Received  + 1

- id: "1"
+ id: "2"
  name: "Alice"
```

#### 2. Snapshot Testing

Both support snapshots, but Vitest's are faster and with better diffs:

```typescript
expect(result).toMatchSnapshot();
```

#### 3. Custom Matchers

Both support custom matchers equally well:

```typescript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `expected ${received} to be within range`
    };
  }
});

expect(5).toBeWithinRange(0, 10);
```

#### 4. Async Assertions

Both handle async equally:

```typescript
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

#### 5. Spy/Mock Improvements

Vitest's mocking API is slightly cleaner:

```typescript
import { vi } from 'vitest';

const spy = vi.fn();
const mock = vi.fn().mockReturnValue(42);

expect(spy).toHaveBeenCalled();
expect(mock).toHaveReturnedWith(42);
```

#### 6. Cleaner Test Organization

Vitest imports everything from one place:

```typescript
// Vitest - clean single import
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Jest - uses globals (less explicit)
import { describe, it, expect } from '@jest/globals';
// beforeEach, afterEach are global
```

#### 7. Better Performance Metrics

Vitest shows test duration more clearly:

```
✓ test-types/chapter-b/00-internal-state-coupling.vitest.spec.ts (22 tests) 3ms
```

vs Jest's more verbose output.

### For Your Course

**The assertion differences don't matter for teaching.** Both work identically:

```typescript
// Works the same in Jest and Vitest
expect(counter.getCount()).toBe(1);
expect(() => account.verify()).toThrow('User not set!');
expect(user.name).toBe('Alice');
```

**The real advantage of Vitest for teaching is:**
- ✅ **Faster feedback** - 3-4ms vs Jest's 400ms+
- ✅ **Clearer error messages** - Better diffs when tests fail
- ✅ **Better for live coding** - Students see results instantly

### Running Tests

**Jest (default):**
```bash
pnpm test                                    # Run all tests
pnpm run test:watch                          # Watch mode
pnpm run test 00-internal-state-coupling  # Run specific file
```

**Vitest:**
```bash
pnpm run test:vitest                         # Run all vitest files
pnpm run test:vitest:watch                   # Watch mode
pnpm exec vitest run test-types/chapter-b/00-internal-state-coupling.vitest.spec.ts
```

## Why Mix Both?

### Jest Advantages
- Industry standard for Node.js projects
- Mature ecosystem
- Great for integration tests with TestContainers
- Good for existing test suites

### Vitest Advantages
- **Faster execution** - Uses Vite's fast transformation
- **Better error messages** - More readable output
- **Instant feedback** - Great for live coding sessions
- **Native ESM support** - Works seamlessly with modern JavaScript
- **Simpler configuration** - Zero-config for TypeScript

## Recommendation for Teaching

**Use Vitest for Chapter B (Coupling & Abstraction)** because:

1. **Live Coding Sessions** - Instant feedback as students modify code
2. **Watch Mode** - Students see tests pass/fail in real-time
3. **Clear Output** - Error messages are easier to understand
4. **Performance** - Tests run faster, keeping students engaged

**Use Jest for Integration Tests** because:
- Works well with TestContainers
- Mature and stable
- Good for database/service integration tests

## Example: Running Chapter B Tests

### With Jest:
```bash
pnpm test test-types/chapter-b/00-internal-state-coupling.test.ts
```

Output:
```
PASS test-types/chapter-b/00-internal-state-coupling.test.ts
  Part 1: State Coupling in Classes
    ✓ tightly coupled counter works but is hard to test
    ✓ pure function is easy to test
    ✓ immutable counter is composable and testable
  ...
  Test Suites: 1 passed, 1 total
  Tests: 22 passed, 22 total
```

### With Vitest:
```bash
pnpm run test:vitest:watch test-types/chapter-b/00-internal-state-coupling.vitest.spec.ts
```

Output:
```
✓ test-types/chapter-b/00-internal-state-coupling.vitest.spec.ts (22 tests) 4ms

Test Files  1 passed (1)
Tests       22 passed (22)
```

## Configuration

### Vitest Config (Optional)

If you want to customize Vitest behavior, create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,           // Use global describe, it, expect
    environment: 'node',     // Node.js environment
    include: ['**/*.vitest.spec.ts'], // Only run .vitest.spec.ts files
  }
});
```

This ensures Vitest only runs files matching the pattern, avoiding conflicts with Jest.

## Summary

| Aspect | Jest | Vitest |
|--------|------|--------|
| **Speed** | Good | Excellent |
| **Setup** | Configured | Zero-config |
| **Error Messages** | Good | Excellent |
| **Live Coding** | Good | Excellent |
| **Integration Tests** | Excellent | Good |
| **Maturity** | Very Mature | Growing |
| **Best For** | Production tests | Teaching/Development |

Both work perfectly for teaching. Choose based on your needs:
- **Teaching live coding?** → Use Vitest
- **Integration tests with databases?** → Use Jest
- **Want both?** → Mix them (as shown here)
