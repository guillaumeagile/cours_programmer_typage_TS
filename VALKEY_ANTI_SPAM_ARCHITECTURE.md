# Valkey Anti-Spam Implementation - Hexagonal Architecture Guide

## Overview

This implementation demonstrates how to build a production-ready anti-spam system using:
- **Hexagonal Architecture** (Ports & Adapters)
- **Repository Pattern** for data access
- **Dependency Injection** for testability
- **TestContainers** for integration testing
- **Valkey** (Redis-compatible) for banned email storage

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Ports (Interfaces):                                         │
│  - AntiSpamPort: Check if email is blocked                  │
│  - BannedEmailRepository: Access banned email list          │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ implements
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Adapters:                                                   │
│  - ValkeyAntiSpamAdapter (implements AntiSpamPort)          │
│  - ValkeyBannedEmailRepository (implements Repository)      │
│  - MockBannedEmailRepository (for unit tests)               │
│                                                              │
│  External Services:                                          │
│  - Valkey (Redis-compatible in-memory datastore)            │
│  - TestContainers (Docker automation for tests)             │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── domain/
│   └── ports/
│       ├── anti-spam.port.ts                 # Domain port (existing)
│       └── banned-email.repository.ts        # NEW: Repository port
│
└── infrastructure/
    ├── external-services/
    │   ├── external-api-anti-spam.adapter.ts # Existing: External API adapter
    │   └── valkey-anti-spam.adapter.ts       # NEW: Valkey adapter
    │
    └── repositories/
        ├── valkey-banned-email.repository.ts # NEW: Real Valkey implementation
        └── mock-banned-email.repository.ts   # NEW: Mock for unit tests

tests/
├── unit/
│   └── infrastructure/
│       └── in-memory-banned-email.repository.test.ts     # NEW: Unit tests with mock
│
└── integration/
    └── infrastructure/
        └── valkey-anti-spam.integration.test.ts  # NEW: Integration tests with TestContainers
```

## Key Components

### 1. Domain Ports (Contracts)

#### `AntiSpamPort` (existing)
```typescript
interface AntiSpamPort {
  isBlocked(email: string): Promise<boolean>;
}
```
- **Purpose**: Domain needs to check if an email is blocked
- **Implementation**: Multiple adapters can implement this

#### `BannedEmailRepository` (NEW)
```typescript
interface BannedEmailRepository {
  isBanned(email: string): Promise<boolean>;
  ban(email: string): Promise<void>;
  unban(email: string): Promise<void>;
  getAllBanned(): Promise<string[]>;
  clear(): Promise<void>;
}
```
- **Purpose**: Domain needs to access a banned email list
- **Implementation**: Valkey or Mock

### 2. Infrastructure Adapters

#### `ValkeyAntiSpamAdapter`
- **Implements**: `AntiSpamPort`
- **Depends on**: `BannedEmailRepository`
- **Responsibility**: Check if email is blocked by delegating to repository
- **Error Handling**: Fails open (allows email if check fails)

```typescript
export class ValkeyAntiSpamAdapter implements AntiSpamPort {
  constructor(private readonly bannedEmailRepository: BannedEmailRepository) {}

  async isBlocked(email: string): Promise<boolean> {
    try {
      return await this.bannedEmailRepository.isBanned(email);
    } catch (error) {
      console.error('Failed to check banned email list:', error);
      return false; // Fail open
    }
  }
}
```

#### `ValkeyBannedEmailRepository`
- **Implements**: `BannedEmailRepository`
- **Uses**: Valkey client
- **Data Structure**: Valkey Set (key: `banned:emails`)
- **Responsibility**: Persist and retrieve banned emails from Valkey

```typescript
export class ValkeyBannedEmailRepository implements BannedEmailRepository {
  constructor(
    private readonly valkey: Valkey,
    setKey: string = 'banned:emails'
  ) {}

  async isBanned(email: string): Promise<boolean> {
    const result = await this.valkey.sismember(this.setKey, email.toLowerCase());
    return result === 1;
  }

  async ban(email: string): Promise<void> {
    await this.valkey.sadd(this.setKey, email.toLowerCase());
  }
  // ... other methods
}
```

#### `MockBannedEmailRepository`
- **Implements**: `BannedEmailRepository`
- **Uses**: In-memory Set
- **Purpose**: Fast unit testing without external services
- **Responsibility**: Simulate repository behavior for tests

## Testing Strategy

### Unit Tests (`tests/unit/infrastructure/in-memory-banned-email.repository.test.ts`)

**What they test**: Adapter logic in isolation
**How**: Using `MockBannedEmailRepository`
**Speed**: Fast (< 100ms)
**External Dependencies**: None

```typescript
it('should return true for banned emails', async () => {
  const mockRepository = new MockBannedEmailRepository();
  const adapter = new ValkeyAntiSpamAdapter(mockRepository);
  
  await mockRepository.ban('spammer@example.com');
  
  expect(await adapter.isBlocked('spammer@example.com')).toBe(true);
});
```

**Run unit tests**:
```bash
pnpm run test:unit in-memory-banned-email.repository.test.ts
```

### Integration Tests (`tests/integration/infrastructure/valkey-anti-spam.integration.test.ts`)

**What they test**: Complete flow with real Valkey
**How**: Using TestContainers to spin up Valkey in Docker
**Speed**: Slower (5-10 seconds)
**External Dependencies**: Docker

```typescript
beforeAll(async () => {
  // TestContainers starts Valkey in Docker
  container = new ValkeyContainer();
  const startedContainer = await container.start();
  
  // Connect to real Valkey
  valkey = new Valkey({
    host: startedContainer.getHost(),
    port: startedContainer.getPort(),
  });
});

it('should persist data across adapter calls', async () => {
  const email = 'persistent@example.com';
  
  await repository.ban(email);
  
  // Create new adapter (simulating app restart)
  const newAdapter = new ValkeyAntiSpamAdapter(repository);
  
  // Data persists
  expect(await newAdapter.isBlocked(email)).toBe(true);
});
```

**Run integration tests**:
```bash
pnpm run test:integration valkey-anti-spam.integration.test.ts
```

## Hexagonal Architecture Principles Applied

### 1. **Port = Interface/Contract**
- `AntiSpamPort`: What the domain needs
- `BannedEmailRepository`: How to access data
- Both are in the `domain/ports/` directory (domain owns the contracts)

### 2. **Adapter = Implementation**
- `ValkeyAntiSpamAdapter`: Implements `AntiSpamPort`
- `ValkeyBannedEmailRepository`: Implements `BannedEmailRepository`
- `MockBannedEmailRepository`: Test double for `BannedEmailRepository`
- All in `infrastructure/` directory (infrastructure implements)

### 3. **Dependency Injection**
- Adapters receive dependencies via constructor
- No `new` keyword inside adapters (dependencies injected)
- Enables swapping implementations for testing

```typescript
// Good: Dependency injected
const adapter = new ValkeyAntiSpamAdapter(repository);

// Bad: Hard-coded dependency
class ValkeyAntiSpamAdapter {
  private repository = new ValkeyBannedEmailRepository(valkey);
}
```

### 4. **Fail Open Strategy**
- If Valkey is down, emails are allowed (not blocked)
- Conservative approach: Better to allow than to block legitimate users
- Alternative: Fail Closed (block emails if service is down)

```typescript
async isBlocked(email: string): Promise<boolean> {
  try {
    return await this.bannedEmailRepository.isBanned(email);
  } catch (error) {
    return false; // Fail open: allow email
  }
}
```

## Data Flow

### Adding a Banned Email

```
1. Repository.ban('spammer@example.com')
   ↓
2. Valkey.sadd('banned:emails', 'spammer@example.com')
   ↓
3. Email stored in Valkey Set
```

### Checking if Email is Blocked

```
1. Adapter.isBlocked('spammer@example.com')
   ↓
2. Repository.isBanned('spammer@example.com')
   ↓
3. Valkey.sismember('banned:emails', 'spammer@example.com')
   ↓
4. Returns true/false
```

## Running Tests

### Install Dependencies
```bash
pnpm install
```

### Run All Tests
```bash
pnpm test
```

### Run Unit Tests Only
```bash
pnpm run test:unit
```

### Run Integration Tests Only
```bash
pnpm run test:integration
```

### Run Specific Test File
```bash
pnpm test in-memory-banned-email.repository.test.ts

```

### Run with Coverage
```bash
pnpm run test:coverage
```

## Production Usage Example

```typescript
import { Valkey } from 'valkey';
import { ValkeyBannedEmailRepository } from './infrastructure/repositories/valkey-banned-email.repository';
import { ValkeyAntiSpamAdapter } from './infrastructure/external-services/valkey-anti-spam.adapter';

// Initialize Valkey connection
const valkey = new Valkey({
  host: process.env.VALKEY_HOST || 'localhost',
  port: parseInt(process.env.VALKEY_PORT || '6379'),
});

// Create repository
const repository = new ValkeyBannedEmailRepository(valkey);

// Create adapter
const antiSpamAdapter = new ValkeyAntiSpamAdapter(repository);

// Use in domain
const email = 'user@example.com';
const isBlocked = await antiSpamAdapter.isBlocked(email);

if (isBlocked) {
  throw new Error('Email is blocked');
}

// Manage banned emails
await repository.ban('spammer@example.com');
await repository.unban('spammer@example.com');
```

## Advanced Topics

### 1. Custom Set Key
```typescript
const repository = new ValkeyBannedEmailRepository(
  valkey,
  'custom:banned:emails' // Custom key instead of default
);
```

### 2. Multiple Repositories
```typescript
// Different repositories for different purposes
const bannedRepository = new ValkeyBannedEmailRepository(valkey, 'banned:emails');
const suspiciousRepository = new ValkeyBannedEmailRepository(valkey, 'suspicious:emails');
```

### 3. Composition with Other Adapters
```typescript
// Combine multiple anti-spam strategies
class CompositeAntiSpamAdapter implements AntiSpamPort {
  constructor(
    private readonly valkeyAdapter: ValkeyAntiSpamAdapter,
    private readonly externalApiAdapter: ExternalApiAntiSpamAdapter
  ) {}

  async isBlocked(email: string): Promise<boolean> {
    // Check both sources
    const blockedByValkey = await this.valkeyAdapter.isBlocked(email);
    const blockedByApi = await this.externalApiAdapter.isBlocked(email);
    
    return blockedByValkey || blockedByApi;
  }
}
```

## Troubleshooting

### TestContainers Docker Issues
- Ensure Docker is running: `docker ps`
- Check Docker permissions: `docker run hello-world`
- On Mac: Docker Desktop must be running

### Valkey Connection Issues
- Verify Valkey is accessible: `redis-cli ping`
- Check port conflicts: `lsof -i :6379`
- Verify credentials in environment variables

### Test Timeouts
- Increase Jest timeout: `jest.setTimeout(30000)`
- Check Docker resource limits
- Verify network connectivity

## Key Takeaways

✅ **Ports** define contracts (domain owns them)
✅ **Adapters** implement contracts (infrastructure provides them)
✅ **Dependency Injection** enables testability
✅ **Test Doubles** (mocks) for unit tests
✅ **TestContainers** for integration tests
✅ **Fail Open** for resilience
✅ **Repository Pattern** abstracts data access
✅ **Hexagonal Architecture** keeps domain independent

## References

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [TestContainers](https://testcontainers.com/)
- [Valkey Documentation](https://valkey.io/)
