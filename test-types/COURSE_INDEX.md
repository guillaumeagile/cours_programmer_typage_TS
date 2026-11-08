# Type Systems Course - Complete Index

## Course Overview

A comprehensive course on **type systems as a design tool** for writing better software. Using TypeScript as the vehicle, the concepts apply across all OO and FP languages.

**Key Philosophy**: Types are constraints that prevent bugs, reveal intent, and enable fast feedback.

---

## Chapter A: Cohesion - Types as Constraints
**How types create structure and enforce constraints**

Plan and theory: `chapter-a/README.md`. One test file per section:

| #  | File                                         | Concepts                                                  |
|----|----------------------------------------------|-----------------------------------------------------------|
| A1 | `01-primitive-types-and-inference.test.ts`   | primitive types, annotations, inference, type errors      |
| A2 | `02-object-types.test.ts`                    | object shapes, optional / `readonly`, `type` vs `interface` |
| A3 | `03-structural-typing.test.ts`               | structural vs nominal typing, branded types               |
| A4 | `04-classes-and-inheritance.test.ts`         | classes as types, `extends`, `abstract`, polymorphism, `implements` |
| A5 | `05-narrowing.test.ts`                       | `typeof`, `instanceof`, `in`, type predicates, casts, `unknown` |
| A6 | `06-liskov-substitution.test.ts`             | Liskov Substitution, Interface Segregation                |

### Learning Outcomes
- Understand types as constraints checked at compile-time
- Know when inference is enough and when to annotate
- Recognize structural typing and use branded types against accidental mixing
- Design class hierarchies and apply polymorphism
- Narrow broad types instead of casting
- Recognize a Liskov Substitution violation

### Exercises 🫵
Each section ends with 3 exercises written as `it.todo('🫵 A<n>.<m> ...')`.

---

## Chapter B: Coupling & Abstraction
**How typing induces coupling and how abstraction solves it**

### Concepts
- Tight coupling problem (fragile, hard to test)
- Abstraction as decoupling mechanism
- Interfaces as contracts
- Dependency Injection (constructor, method, parameter objects)
- Orthogonality (independence of components)
- Testability through DI (mocks, stubs, fakes)
- Test doubles (mock vs. stub vs. fake)

### Learning Outcomes
- Recognize tight coupling in code
- Use interfaces to decouple from implementations
- Apply Dependency Injection effectively
- Understand how DI enables testing
- Design orthogonal components

### Files
- **Explanation**: `chapter-b/README.md`
- **Examples**: `chapter-b/01-coupling.test.ts`

### Key Checkpoints 🫵
- B.1: Explain tight vs. loose coupling
- B.2: Design a PaymentProcessor abstraction
- B.3: Identify tight coupling in code
- B.4: Refactor to use DI

---

## Chapter C: Strong Typing & Clean Code
**Building expressive, maintainable domain models**

### Concepts
- Primitive Obsession anti-pattern
- Value Objects (immutable, validated, semantic)
- Anemic Objects anti-pattern
- Rich Objects (data + behavior)
- Single Responsibility Principle (SRP)
- Domain-Driven Design (DDD) through types
- Fine-grained vs. broad types
- Restrictive types (prevent invalid states)
- SOLID principles applied

### Learning Outcomes
- Recognize and fix Primitive Obsession
- Design Value Objects with validation
- Avoid Anemic Objects
- Apply SRP to classes
- Use domain types to reveal intent
- Create restrictive types

### Files
- **Explanation**: `chapter-c/README.md`
- **Examples**: `chapter-c/01-value-objects.test.ts`

### Key Checkpoints 🫵
- C.1: Explain why Value Objects are better
- C.2: Design a PhoneNumber Value Object
- C.3: Identify anemic vs. rich objects
- C.4: Apply SRP to a multi-responsibility class

---

## Chapter D: Honest Functions with Types
**Using types to reveal intent and guarantee correctness**

### Concepts
- Pure functions (deterministic, no side effects)
- Input types as contracts (what function expects)
- Output types as promises (what function guarantees)
- Semantic types (encode domain meaning)
- Type-driven function design
- Composability through types
- Honest functions (types tell the truth)
- Function composition and piping

### Learning Outcomes
- Write pure functions
- Design clear input/output types
- Use semantic types for clarity
- Understand type-driven design
- Compose functions safely
- Make functions "honest" about their behavior

### Files
- **Explanation**: `chapter-d/README.md`
- **Examples**: `chapter-d/01-pure-functions.test.ts`

### Key Checkpoints 🫵
- D.1: Explain why pure functions are better
- D.2: Design an honest function for finding users
- D.3: Identify dishonest functions
- D.4: Refactor dishonest functions

---

## Chapter E: Type Safety & Feedback
**Making illegal states unrepresentable**

### Concepts
- Illegal states (states that shouldn't be possible)
- Making illegal states unrepresentable
- Null as a billion-dollar mistake
- Exceptions as anti-pattern
- Option/Maybe type (represents optional values)
- Result/Either type (represents computations that might fail)
- Monads (pattern for composing operations)
- Fast feedback loops (compile-time vs. runtime)
- Type safety benefits

### Learning Outcomes
- Design types that prevent illegal states
- Replace null with Option type
- Replace exceptions with Result type
- Understand monadic operations (map, flatMap)
- Appreciate fast feedback from types
- Recognize type safety benefits

### Files
- **Explanation**: `chapter-e/README.md`
- **Examples**: `chapter-e/01-type-safety.test.ts`

### Key Checkpoints 🫵
- E.1: Explain why illegal states should be unrepresentable
- E.2: Design a payment status type system
- E.3: Compare null, exceptions, and Result types
- E.4: Implement Option and Result helpers

---

## Learning Path

### Beginner (Chapters A-B)
Start here if you're new to type systems:
1. **Chapter A**: Understand what types are and how they create cohesion
2. **Chapter B**: Learn how abstraction reduces coupling

**Outcome**: You can write loosely coupled code with clear types.

### Intermediate (Chapters C-D)
Continue with domain modeling and function design:
3. **Chapter C**: Design expressive domain types
4. **Chapter D**: Write honest functions with clear contracts

**Outcome**: You can design clean, maintainable code with semantic types.

### Advanced (Chapter E)
Master type safety and error handling:
5. **Chapter E**: Make illegal states unrepresentable

**Outcome**: You can write type-safe code that prevents entire categories of bugs.

---

## How to Use This Course

### For Self-Study
1. Read the explanation file (`.md`) for each chapter
2. Study the working examples (`.test.ts` files)
3. Run the tests: `npm test -- test-types/chapter-a/`
4. Complete the checkpoints (🫵) to verify understanding
5. Modify examples and experiment

### For Teaching
1. Start with the explanation files as slides/notes
2. Live-code the examples with students
3. Have students complete checkpoints
4. Discuss answers and variations
5. Assign additional exercises based on checkpoints

### For Reference
- Use the README files as quick reference guides
- Return to examples when you need to remember a pattern
- Use checkpoints to self-assess understanding

---

## Running Tests

```bash
# Run all type-system tests
npm test -- test-types/

# Run a specific chapter
npm test -- test-types/chapter-a/
npm test -- test-types/chapter-b/
npm test -- test-types/chapter-c/
npm test -- test-types/chapter-d/
npm test -- test-types/chapter-e/

# Run with watch mode
npm test -- test-types/ --watch

# Run a specific test file
npm test -- test-types/chapter-a/01-primitive-types-and-inference.test.ts
```

---

## Key Principles Summary

| Principle | Chapter | Benefit |
|-----------|---------|---------|
| Types as constraints | A | Prevent invalid states |
| Abstraction over implementation | B | Reduce coupling, enable testing |
| Domain types | C | Reveal intent, prevent errors |
| Pure functions | D | Predictable, composable, testable |
| Type safety | E | Fast feedback, prevent bugs |

---

## Concepts by Language

While this course uses **TypeScript**, the concepts apply across languages:

### Object-Oriented Languages
- **Java**: Interfaces, classes, generics, sealed classes
- **C#**: Interfaces, classes, nullable reference types, discriminated unions
- **Python**: Type hints, protocols, dataclasses, typing module
- **Kotlin**: Interfaces, sealed classes, data classes, extension functions

### Functional Languages
- **Haskell**: Type classes, algebraic data types, monads
- **Scala**: Traits, case classes, sealed traits, for-comprehensions
- **Rust**: Traits, enums, Result/Option types, pattern matching
- **F#**: Discriminated unions, records, type providers

---

## Recommended Reading

### Type Systems
- "Types and Programming Languages" by Benjamin C. Pierce
- "Programming in TypeScript" by Boris Cherny

### Domain-Driven Design
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon

### Functional Programming
- "Composing Software" by Eric Elliott
- "Mostly Adequate Guide to Functional Programming" by Brian Lonsdorf

### Clean Code
- "Clean Code" by Robert C. Martin
- "Clean Architecture" by Robert C. Martin

---

## Course Statistics

- **Total Chapters**: 5 (A, B, C, D, E)
- **Total Concepts**: 50+
- **Working Examples**: 80+ (streamlined for 1-hour course)
- **Checkpoints**: 25+ (with human-written answers required)
- **Estimated Study Time**: 15-20 hours (optimized)

---

## Recent Changes

### Chapter A restructured for Bachelor 3 (Nov 2026)
- 6 numbered sections, one test file each, plan in `chapter-a/README.md`
- Removed duplicates (inference, branded types and Liskov were each covered 2-3 times)
- Theory merged into the chapter README (the separate `02-*.md` / `03-*.md` files are gone)
- Deliberate type errors are now verified with `// @ts-expect-error`
- Exercises are `it.todo` instead of pre-filled answers

---

**Start with [Chapter A: Cohesion](./chapter-a/README.md)**
