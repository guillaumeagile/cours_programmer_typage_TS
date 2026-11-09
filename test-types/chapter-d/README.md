# Chapter D: Honest Functions

> **Duration**: 30 min ([plan](../README.md#the-3-hour-session)).
> File: [`01-honest-functions.test.ts`](./01-honest-functions.test.ts)

```bash
pnpm test test-types/chapter-d
```

A function is **honest** when its signature tells the whole truth: what it needs, what it returns, and
how it can fail. A caller should not have to read the body.

## Pure functions

A **pure** function depends only on its parameters and changes nothing outside itself. The same inputs
always give the same output. It is trivial to test and to reason about. Side effects (I/O, time,
mutation of shared state) belong at the edges ([B1](../chapter-b/README.md#b1-coupling-and-dependency-injection)).

## Signatures that lie

| Signature | What it hides |
|-----------|---------------|
| `findUser(email): User` | throws when the user does not exist |
| `parseAge(input): number` | returns `NaN` on bad input |

## Being honest

- **Absence**: return `User | undefined`. With `strict`, the compiler refuses `user.name` until the
  `undefined` case is handled (`?.`, `??`, `if`).
- **Failure**: return a `Result`, a union with one case for success and one for failure:

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parseAge(input: string): Result<number, 'NOT_A_NUMBER' | 'OUT_OF_RANGE'>
```

The value can only be reached after checking `ok` ([narrowing, A4](../chapter-a/README.md#a4-narrowing)),
and the possible errors are listed in the type. Keep exceptions for bugs and truly unexpected
situations.

`Result<T, E>` is a **generic** type: `T` and `E` are type parameters, filled in at each use
(`Result<number, AgeError>`). Writing your own generics is covered in [chapter ITER](../chapter-ITER/README.md).

## Takeaways

1. Prefer pure functions, and push side effects to the edges.
2. A signature is a promise: `T | undefined` for absence, `Result` for expected failures.
3. Let the compiler force callers to handle every case.

**Next**: [Chapter E: Make Illegal States Unrepresentable](../chapter-e/README.md)
