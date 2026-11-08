# Understanding Type Systems: A Practical Course

## Overview

This course teaches **type systems as a design tool** for writing better software. While using TypeScript as the language vehicle, the concepts apply across Object-Oriented languages (Java, C#, Python) and Functional languages (Haskell, Scala, Rust).

The course emphasizes:
- **Types as constraints** that create cohesion and prevent bugs
- **Abstraction** to reduce coupling and enable flexibility
- **Domain-driven design** through expressive types
- **Type safety** as the fastest feedback loop for correctness

## Course Structure

Each chapter has:
- **Explanations** (`.md` files) - Concepts and theory
- **Working Examples** (`.test.ts` files) - Runnable code demonstrating concepts
- **Checkpoints** (🫵) - Exercises to verify understanding

### Chapter A: Cohesion - Types as Constraints
**How types create structure and enforce constraints** (6 sections, one test file each)

- A1. Primitive types & inference
- A2. Object types (`type`, `interface`, optional / `readonly`)
- A3. Structural typing and branded types
- A4. Classes & inheritance, polymorphism
- A5. Narrowing (`typeof`, `instanceof`, `in`, type predicates, casts)
- A6. Liskov Substitution Principle

### Chapter B: Coupling & Abstraction
**How typing induces coupling and how abstraction solves it**

- Tight coupling through concrete types
- Abstraction as a decoupling mechanism
- Interfaces and contracts
- Dependency Injection (the simple way)
- Orthogonality through abstraction
- Testability through DI

### Chapter C: Strong Typing & Clean Code
**Building expressive, maintainable domain models**

- Primitive Obsession anti-pattern
- Value Objects as types
- Anemic Objects anti-pattern
- Single Responsibility Principle (SRP)
- Domain-Driven Design (DDD) through types
- Fine-grained vs. broad types
- SOLID principles applied

### Chapter D: Honest Functions with Types
**Using types to reveal intent and guarantee correctness**

- Pure functions and side effects
- Input types as contracts
- Output types as promises
- Semantic types (not just `string` or `number`)
- Type-driven function design
- Composability through types

### Chapter E: Type Safety & Feedback
**Making illegal states unrepresentable**

- Illegal state patterns
- Null and exceptions as anti-patterns
- Option/Maybe types
- Result/Either types
- Monads as type-safe abstractions
- Fast feedback loops

## How to Use This Course

1. **Read** the explanation files (`.md`) to understand concepts
2. **Study** the working examples (`.test.ts` files)
3. **Run** the tests: `pnpm test test-types/`
4. **Complete** the checkpoints (🫵) to verify understanding
5. **Experiment** - modify examples and observe type errors

## Running Tests

```bash
# Run all type-system tests
pnpm test test-types/

# Run a specific chapter
pnpm test test-types/chapter-a/

# Run with watch mode
pnpm test test-types/ --watch
```

## Prerequisites

- Audience: Bachelor, 3rd year
- Basic JavaScript knowledge (variables, functions, objects)
- Familiarity with OOP concepts (classes, inheritance)
- Understanding of testing frameworks (Jest)

## Key Principles

- **Types are constraints** - They prevent invalid states
- **Abstraction reduces coupling** - Depend on contracts, not implementations
- **Domain types reveal intent** - `Email` is clearer than `string`
- **Type safety is feedback** - Errors caught at compile-time, not runtime
- **Illegal states are unrepresentable** - Use types to make bugs impossible

---

**Start with [Chapter A: Cohesion](./chapter-a/README.md)**
