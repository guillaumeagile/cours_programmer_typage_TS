# Getting Started with the Type Systems Course

## Quick Start

### 1. Start Here
Read the main course overview:
```bash
# Open and read:
test-types/README.md
```

### 2. Choose Your Path

**First Time?** Start with Chapter A:
```bash
# Read the explanation
test-types/chapter-a/README.md

# Study the examples
test-types/chapter-a/01-primitive-types-and-inference.test.ts

# Run the tests
pnpm test test-types/chapter-a/
```

**Want the Big Picture?** Read the index:
```bash
test-types/COURSE_INDEX.md
```

### 3. Work Through Each Chapter

For each chapter:
1. **Read** the explanation (`chapter-X/README.md`)
2. **Study** the examples (`chapter-X/01-*.test.ts`)
3. **Run** the tests: `pnpm test test-types/chapter-X/`
4. **Complete** the checkpoints (🫵)
5. **Experiment** - modify examples and see what breaks

## Course Structure

```
test-types/
├── README.md                 # Course overview
├── COURSE_INDEX.md          # Complete index and reference
├── GETTING_STARTED.md       # This file
│
├── chapter-a/               # Cohesion
│   ├── README.md
│   ├── 01-primitive-types-and-inference.test.ts
│   ├── 02-object-types.test.ts
│   ├── 03-structural-typing.test.ts
│   ├── 04-classes-and-inheritance.test.ts
│   ├── 05-narrowing.test.ts
│   └── 06-liskov-substitution.test.ts
│
├── chapter-b/               # Coupling & Abstraction
│   ├── README.md
│   └── 01-coupling.test.ts
│
├── chapter-c/               # Strong Typing & Clean Code
│   ├── README.md
│   └── 01-value-objects.test.ts
│
├── chapter-d/               # Honest Functions
│   ├── README.md
│   └── 01-pure-functions.test.ts
│
└── chapter-e/               # Type Safety & Feedback
    ├── README.md
    └── 01-type-safety.test.ts
```

## Running Tests

### Run All Tests
```bash
pnpm test test-types/
```

### Run a Specific Chapter
```bash
pnpm test test-types/chapter-a/
pnpm test test-types/chapter-b/
pnpm test test-types/chapter-c/
pnpm test test-types/chapter-d/
pnpm test test-types/chapter-e/
```

### Run with Watch Mode
```bash
pnpm test test-types/ --watch
```

### Run a Specific Test File
```bash
pnpm test test-types/chapter-a/01-primitive-types-and-inference.test.ts
```

## Learning Outcomes by Chapter

### Chapter A: Cohesion - Types as Constraints
- Use primitive types, and know when inference is enough
- Describe object shapes with `type` and `interface`
- Recognize structural typing and its trap (branded types)
- Build class hierarchies and use polymorphism
- Narrow broad types safely instead of casting
- Spot a Liskov Substitution violation

**Time**: about 3 hours

### Chapter B: Coupling & Abstraction
- Identify tight coupling
- Use interfaces to decouple
- Apply Dependency Injection
- Understand test doubles
- Design orthogonal components

**Time**: 2-3 hours

### Chapter C: Strong Typing & Clean Code
- Recognize Primitive Obsession
- Design Value Objects
- Avoid Anemic Objects
- Apply Single Responsibility Principle
- Use Domain-Driven Design

**Time**: 2-3 hours

### Chapter D: Honest Functions
- Write pure functions
- Design clear input/output types
- Use semantic types
- Understand type-driven design
- Compose functions safely

**Time**: 2-3 hours

### Chapter E: Type Safety & Feedback
- Make illegal states unrepresentable
- Replace null with Option
- Replace exceptions with Result
- Understand monads
- Appreciate fast feedback

**Time**: 2-3 hours

**Total**: 10-15 hours of active learning

## Checkpoint System

Each chapter has checkpoints (🫵) to verify understanding:

- **Explanation checkpoints**: Answer questions about concepts
- **Design checkpoints**: Create types and functions from scratch
- **Identification checkpoints**: Spot patterns in code
- **Refactoring checkpoints**: Improve existing code

Checkpoints are **not auto-graded**. They require you to:
1. Write code or answers
2. Verify your work runs
3. Reflect on your understanding

## Tips for Success

### 1. Read First, Code Second
- Read the explanation file completely before looking at examples
- Understand the "why" before the "how"

### 2. Run the Tests
- Tests show working examples
- Modify them and see what breaks
- Use tests to verify your understanding

### 3. Complete the Checkpoints
- Don't skip checkpoints
- Write your own code, don't just copy
- Discuss answers with others

### 4. Experiment
- Modify the examples
- Break things intentionally
- See what the compiler catches

### 5. Connect to Your Work
- Think about your own code
- Identify patterns from the course
- Apply concepts to real projects

## Common Questions

### Q: Do I need to know TypeScript?
**A**: Basic knowledge helps, but the course teaches concepts that apply to all languages. You'll learn TypeScript as you go.

### Q: Can I skip chapters?
**A**: Not recommended. Each chapter builds on previous ones. Start with Chapter A.

### Q: How long does this take?
**A**: 10-15 hours of active learning. You can spread it over weeks.

### Q: Can I use this to teach?
**A**: Yes! The course is designed for both self-study and teaching. See COURSE_INDEX.md for teaching tips.

### Q: What if I don't understand something?
**A**: 
1. Re-read the explanation
2. Study the examples more carefully
3. Run the tests and modify them
4. Discuss with others
5. Move on and come back later

## Next Steps

1. **Start with Chapter A**: `test-types/chapter-a/README.md`
2. **Study the examples**: `test-types/chapter-a/01-primitive-types-and-inference.test.ts`
3. **Run the tests**: `pnpm test test-types/chapter-a/`
4. **Complete the checkpoints**: Look for 🫵 in the test file
5. **Move to Chapter B**: `test-types/chapter-b/README.md`

## Resources

### In This Course
- **README.md**: Course overview
- **COURSE_INDEX.md**: Complete reference
- **chapter-X/README.md**: Concept explanations
- **chapter-X/01-*.test.ts**: Working examples

### External Resources
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Domain-Driven Design: https://www.domainlanguage.com/ddd/
- Functional Programming: https://mostly-adequate.gitbook.io/

## Feedback

This course is designed to be practical and hands-on. If you have suggestions for improvements, please share them.

---

**Ready to start?** → [Chapter A: Cohesion](./chapter-a/README.md)
