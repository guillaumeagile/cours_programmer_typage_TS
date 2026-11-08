# Type Systems as a Design Tool

A 3-hour course for **Bachelor 3rd-year** students. It uses TypeScript, but the ideas apply to any
typed language: types as constraints, low coupling, domain types, honest functions, and illegal states
made unrepresentable.

**Prerequisites**: basic JavaScript (variables, functions, objects), classes in any OO language, and
having written at least one unit test.

## The 3-hour session

| Time | Chapter | Main idea | Files |
|------|---------|-----------|-------|
| 0:00 – 0:40 | [A. Types as Constraints](./chapter-a/README.md) | A type restricts values. TypeScript compares shapes. Narrow instead of casting. | 3 |
| 0:40 – 1:10 | [B. Coupling & Abstraction](./chapter-b/README.md) | Depend on contracts, inject dependencies, respect Liskov. | 2 |
| 1:10 – 1:20 | *Break* | | |
| 1:20 – 1:50 | [C. Domain Types & Value Objects](./chapter-c/README.md) | `Email` rather than `string`: validate once, then trust the type. | 1 |
| 1:50 – 2:25 | [D. Honest Functions](./chapter-d/README.md) | Pure functions, and signatures that admit absence (`T \| undefined`) and failure (`Result`). | 1 |
| 2:25 – 2:55 | [E. Illegal States Unrepresentable](./chapter-e/README.md) | One type per state, `never` for exhaustiveness. | 1 |
| 2:55 – 3:00 | Wrap-up | | |

Each chapter builds on the previous ones, and each concept appears in **one** chapter only:
structural typing in A, then branded types in C; narrowing in A, then `Result` in D, then
discriminated unions in E. [TEACHING_GUIDE.md](./TEACHING_GUIDE.md) gives the facilitator's run sheet.

Not covered in the 3 hours: [going-further/](./going-further/README.md) (state coupling, Jest vs
Vitest) and [chapter-ITER/](./chapter-ITER/README.md) (advanced types).

## How to work

Each section is a test file, to read from top to bottom. The chapter README holds the short theory.

| Marker | Meaning |
|--------|---------|
| `// @ts-expect-error` | The next line is a **deliberate type error**, and the compiler checks that it really fails. 👉 Delete the comment to read the error message in your IDE. |
| `// 😱` | A trap: the code compiles and runs, but does something you probably did not expect. |
| `it.todo('🫵 ...')` | An exercise. Replace `it.todo` with `it` and write the test. In class, do the first exercise of each file; the others are homework. |

```bash
pnpm install                       # once
pnpm test test-types/chapter-a     # one chapter
pnpm test test-types/chapter-c/01  # one file
pnpm test test-types/chapter-a --watch
```
