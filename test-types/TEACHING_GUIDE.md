# Teaching Guide: Type Systems Course

## Overview

This guide helps instructors teach the Type Systems course to students. The course is designed for both self-study and classroom instruction.

## Course Philosophy

- **Concepts over syntax**: Focus on ideas that apply across languages
- **Practical examples**: Every concept has working code
- **Hands-on learning**: Students write code, not just read
- **Incremental complexity**: Start simple, build up gradually
- **Verification checkpoints**: Ensure understanding before moving on

## Teaching Approach

### The Pattern

For each chapter, follow this pattern:

1. **Introduce the Problem** (5-10 min)
   - Show a code smell or anti-pattern
   - Explain why it's a problem
   - Make students feel the pain

2. **Explain the Concept** (10-15 min)
   - Read the explanation file together
   - Use the examples to illustrate
   - Answer questions

3. **Live Code** (15-20 min)
   - Live-code the examples
   - Make mistakes intentionally
   - Let students see the compiler catch errors
   - Modify examples and show variations

4. **Hands-On Practice** (20-30 min)
   - Have students complete checkpoints
   - Pair programming works well
   - Circulate and help
   - Discuss solutions together

5. **Reflection** (5-10 min)
   - Ask students to explain concepts
   - Connect to their own code
   - Preview next chapter

### Time Allocation

For a 3-hour workshop per chapter:
- Introduction: 15 min
- Concept explanation: 30 min
- Live coding: 45 min
- Hands-on practice: 60 min
- Reflection & discussion: 30 min

For a semester course (1 hour per week):
- Week 1: Chapters A & B (2 weeks)
- Week 3: Chapter C (2 weeks)
- Week 5: Chapter D (2 weeks)
- Week 7: Chapter E (2 weeks)
- Week 9: Review & advanced topics

## Chapter-by-Chapter Guide

### Chapter A: Cohesion - Types as Constraints (about 3 hours, Bachelor 3)

**Goal**: Students understand types as constraints checked at compile-time, from primitives to class hierarchies.

**Sequence** (one test file per section, ~30 min each): A1 primitives & inference → A2 object types →
A3 structural typing & branded types → A4 classes & inheritance → A5 narrowing → A6 Liskov.

**Teaching Tips**:
1. Live-code each file top to bottom; every deliberate type error is marked `// @ts-expect-error`:
   delete the comment in front of the class so students read the real compiler message.
2. Stop on every `😱` test: the code compiles but misbehaves. These are the discussion points
   (types erased at runtime, `5 + "a"`, swapped string ids, wrong casts, `Line extends Shape`).
3. Exercises are `it.todo('🫵 ...')`: students turn them into real tests during the session.

**Common Misconceptions**:
- "Types are just syntax" → No, they're constraints that prevent bugs
- "Inferred types are less safe" → No, inference is checked exactly like an annotation
- "Types exist at runtime" → No, `type`/`interface` are erased; only classes survive
- "If it compiles, the subclass is correct" → No, Liskov is about behaviour (A6)

### Chapter B: Coupling & Abstraction (2-3 hours)

**Goal**: Students understand how abstraction reduces coupling and enables testing.

**Key Concepts**:
- Tight coupling is fragile
- Interfaces decouple from implementation
- Dependency Injection makes code testable
- Test doubles (mocks, stubs, fakes)
- Orthogonality (independence)

**Teaching Tips**:
1. Show tight coupling: `class UserService { private db = new PostgresDatabase() }`
2. Show the problem: "Can't test without a real database"
3. Introduce abstraction: `interface Database { insert(...) }`
4. Show DI: `constructor(private db: Database)`
5. Show testing: `const mockDb = new MockDatabase()`

**Live Coding Demo**:
```typescript
// Start with tight coupling
class UserService {
  private db = new PostgresDatabase();
  createUser(name: string) {
    return this.db.insert('users', { name });
  }
}

// Refactor to use abstraction
interface Database {
  insert(table: string, data: any): any;
}

class UserService {
  constructor(private db: Database) {}
  createUser(name: string) {
    return this.db.insert('users', { name });
  }
}

// Now we can test with a mock
class MockDatabase implements Database {
  insert(table: string, data: any) {
    return { id: '1', ...data };
  }
}
```

**Common Misconceptions**:
- "DI is too complex" → No, it's just passing dependencies as parameters
- "We don't need tests" → Yes, we do, and DI makes them possible
- "Interfaces are just for big teams" → No, they help even alone

**Checkpoint Focus**:
- B.1: Tight vs. loose coupling
- B.2: Design a PaymentProcessor abstraction
- B.3: Identify tight coupling
- B.4: Refactor to use DI

### Chapter C: Strong Typing & Clean Code (2-3 hours)

**Goal**: Students design expressive domain types and avoid anti-patterns.

**Key Concepts**:
- Primitive Obsession (using primitives instead of domain types)
- Value Objects (immutable, validated, semantic)
- Anemic Objects (data only, no behavior)
- Rich Objects (data + behavior)
- Single Responsibility Principle
- Domain-Driven Design through types

**Teaching Tips**:
1. Show Primitive Obsession: `function createUser(a: string, b: string, c: number)`
2. Show the problem: Easy to mix up parameters
3. Introduce Value Objects: `class Email { constructor(value: string) { ... } }`
4. Show the benefit: Type safety + validation
5. Show Anemic Objects: `class User { id: string; name: string; }`
6. Show Rich Objects: `class User { private id: string; getId() { ... } }`

**Live Coding Demo**:
```typescript
// Primitive Obsession - easy to mix up
function createUser(id: string, email: string, age: number) {
  return { id, email, age };
}
createUser('alice@example.com', 'Alice', 30); // ✗ Wrong order!

// Value Objects - impossible to mix up
class Email {
  constructor(readonly value: string) {
    if (!value.includes('@')) throw new Error('Invalid email');
  }
}

class Age {
  constructor(readonly value: number) {
    if (value < 0 || value > 150) throw new Error('Invalid age');
  }
}

function createUser(id: string, email: Email, age: Age) {
  return { id, email, age };
}
createUser('123', new Email('alice@example.com'), new Age(30)); // ✓ Clear!
```

**Common Misconceptions**:
- "Value Objects are overkill" → No, they prevent entire categories of bugs
- "Validation should be in the database" → No, it should be in the type
- "Rich Objects are just getters/setters" → No, they have behavior

**Checkpoint Focus**:
- C.1: Why Value Objects are better
- C.2: Design a PhoneNumber Value Object
- C.3: Identify anemic vs. rich objects
- C.4: Apply SRP

### Chapter D: Honest Functions (2-3 hours)

**Goal**: Students write functions with clear contracts and honest type signatures.

**Key Concepts**:
- Pure functions (deterministic, no side effects)
- Input types as contracts
- Output types as promises
- Semantic types
- Type-driven design
- Composability

**Teaching Tips**:
1. Show impure functions: `let count = 0; function increment() { count++; return count; }`
2. Show the problem: Different results for same input
3. Show pure functions: `function add(a: number, b: number) { return a + b; }`
4. Show dishonest functions: `function getUser(id: string): User { return db.find(id); }` (might be null)
5. Show honest functions: `function getUser(id: string): User | null`

**Live Coding Demo**:
```typescript
// Dishonest - type says User, might be null
function getUser(id: string): User {
  return database.find(id); // Might be null!
}

// Honest - type tells the truth
function getUser(id: string): User | null {
  return database.find(id);
}

// Even better - Result type
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function getUser(id: string): Result<User, 'NotFound'> {
  const user = database.find(id);
  return user ? { ok: true, value: user } : { ok: false, error: 'NotFound' };
}
```

**Common Misconceptions**:
- "Pure functions are too restrictive" → No, they're clearer and easier to test
- "Side effects are necessary" → Yes, but they should be explicit
- "Exceptions are fine" → No, they're invisible in types

**Checkpoint Focus**:
- D.1: Why pure functions are better
- D.2: Design an honest function
- D.3: Identify dishonest functions
- D.4: Refactor to be honest

### Chapter E: Type Safety & Feedback (2-3 hours)

**Goal**: Students use types to prevent bugs and get fast feedback.

**Key Concepts**:
- Making illegal states unrepresentable
- Null as a problem
- Exceptions as a problem
- Option type (for optional values)
- Result type (for failures)
- Monads (composing operations)
- Fast feedback loops

**Teaching Tips**:
1. Show permissive types: `type User = { status: string; isActive: boolean; isDeleted: boolean }`
2. Show the problem: Can have both active and deleted
3. Show restrictive types: `type UserStatus = 'active' | 'inactive' | 'deleted'`
4. Show discriminated unions: `type User = { status: 'active'; ... } | { status: 'deleted'; ... }`
5. Show Option: `type Option<T> = { isSome: true; value: T } | { isSome: false }`
6. Show Result: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`

**Live Coding Demo**:
```typescript
// Permissive - illegal states possible
type User = {
  status: string;
  isActive: boolean;
  isDeleted: boolean;
};
const user: User = { status: 'invalid', isActive: true, isDeleted: true }; // ✗ Illegal!

// Restrictive - illegal states impossible
type UserStatus = 'active' | 'inactive' | 'deleted';
type User = {
  status: UserStatus;
};
// Can't represent both active and deleted

// Discriminated union - even better
type User = 
  | { status: 'active'; name: string }
  | { status: 'deleted'; deletedAt: Date };
// Can't have properties that don't make sense
```

**Common Misconceptions**:
- "Null is fine" → No, it causes runtime errors
- "Exceptions are fine" → No, they're invisible in types
- "Type safety is overkill" → No, it prevents entire categories of bugs

**Checkpoint Focus**:
- E.1: Why illegal states should be unrepresentable
- E.2: Design a payment status type system
- E.3: Compare null, exceptions, and Result
- E.4: Implement Option and Result helpers

## Assessment Strategies

### Formative Assessment (During Learning)

1. **Checkpoint Completion**
   - Have students complete checkpoints in class
   - Discuss solutions together
   - Identify misconceptions

2. **Code Review**
   - Review student code from checkpoints
   - Provide feedback on design
   - Celebrate good patterns

3. **Peer Teaching**
   - Have students explain concepts to each other
   - Ask "Why?" questions
   - Listen for misconceptions

### Summative Assessment (End of Course)

1. **Design Exercise**
   - Give students a problem to solve
   - They must design types and functions
   - Evaluate for correct patterns

2. **Code Refactoring**
   - Give students bad code
   - They must refactor using course concepts
   - Evaluate for improvements

3. **Concept Quiz**
   - Ask conceptual questions
   - Evaluate understanding of "why"
   - Not just syntax

## Common Teaching Challenges

### Challenge 1: "This is too abstract"
**Solution**: 
- Start with concrete examples
- Show real problems in their code
- Connect to their projects
- Use live coding to show benefits

### Challenge 2: "I don't understand monads"
**Solution**:
- Don't use the word "monad" until the end
- Teach map/flatMap as composition
- Show practical benefits (chaining operations)
- Introduce the term after they understand the pattern

### Challenge 3: "This is too much typing"
**Solution**:
- Show how types prevent bugs
- Compare time spent typing vs. debugging
- Show IDE support (autocomplete, refactoring)
- Emphasize that types are documentation

### Challenge 4: "I want to use `any`"
**Solution**:
- Show what `any` loses
- Explain the cost of `any`
- Provide alternatives (generics, unions)
- Use linting to discourage `any`

## Extending the Course

### Advanced Topics

1. **Generics**
   - Generic types and constraints
   - Variance (covariance, contravariance)
   - Generic functions and classes

2. **Advanced Patterns**
   - Builder pattern
   - Strategy pattern
   - Visitor pattern
   - Adapter pattern

3. **Type-Level Programming**
   - Conditional types
   - Mapped types
   - Type inference
   - Template literal types

4. **Functional Programming**
   - Currying and partial application
   - Function composition
   - Pipe and compose utilities
   - Transducers

### Real-World Applications

1. **API Design**
   - Designing type-safe APIs
   - Request/response types
   - Error handling

2. **State Management**
   - Type-safe state machines
   - Redux with types
   - Immutable updates

3. **Testing**
   - Property-based testing
   - Type-driven testing
   - Test data generation

## Resources for Instructors

### Presentation Materials
- Use the README files as slides
- Live-code the examples
- Show compiler errors and fixes

### Discussion Questions
- "Why is this better than the alternative?"
- "What could go wrong with this code?"
- "How would you test this?"
- "How does this apply to your project?"

### Assignment Ideas
1. Refactor existing code using course concepts
2. Design types for a new feature
3. Write a blog post explaining a concept
4. Teach a concept to a peer

## Feedback and Iteration

### Gather Feedback
- Ask students what was confusing
- Ask what was most valuable
- Ask what they want more of
- Iterate based on feedback

### Track Learning
- Monitor checkpoint completion
- Review code submissions
- Ask conceptual questions
- Assess understanding

## Conclusion

This course teaches **thinking in types**. The goal is not to make students TypeScript experts, but to help them:

1. **Think in types** - Design with types first
2. **Use types as tools** - Leverage types to prevent bugs
3. **Write honest code** - Make types tell the truth
4. **Design better systems** - Use types to guide design

When students finish this course, they should be able to:
- Recognize type system opportunities in their code
- Design types that prevent bugs
- Use abstraction to reduce coupling
- Write functions with clear contracts
- Make illegal states unrepresentable

---

**Happy teaching!**
