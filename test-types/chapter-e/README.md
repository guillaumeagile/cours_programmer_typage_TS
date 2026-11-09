# Chapter E: Make Illegal States Unrepresentable

> **Duration**: 25 min ([plan](../README.md#the-3-hour-session)).
> File: [`01-illegal-states.test.ts`](./01-illegal-states.test.ts)

```bash
pnpm test test-types/chapter-e
```

## The problem

```typescript
type Order = { isPaid: boolean; isShipped: boolean; isCancelled: boolean; trackingNumber?: string };
```

Three booleans give 8 combinations, and only 4 of them make sense. "Shipped but not paid" and
"shipped without a tracking number" compile. Every function then has to check for these impossible
cases, or forget to.

## Discriminated unions

```typescript
type Order =
  | { status: 'pending'; id: string }
  | { status: 'paid'; id: string; paidAt: Date }
  | { status: 'shipped'; id: string; paidAt: Date; trackingNumber: string }
  | { status: 'cancelled'; id: string; reason: string };
```

Each state carries **only its own data**. The `status` field (the **discriminant**) tells the cases
apart, and checking it narrows the type ([A4](../chapter-a/README.md#a4-narrowing)). The `Result` of
[Chapter D](../chapter-d/README.md) is built the same way.

## Exhaustiveness with `never`

In the `default` branch of a `switch` that handles every case, the variable has type `never`. Passing
it to `assertNever(value: never)` turns "I forgot a case" into a **compile error**. When a new state
is added, the compiler lists every place to update.

## Transitions in the signatures

`ship(order: Paid): Shipped` cannot receive a `Pending` order. The illegal move is refused before any
test runs.

## Takeaways

1. Replace flags and optional fields by one type per state.
2. Use `switch` on the discriminant with `assertNever`, so the compiler checks every case.
3. Encode allowed transitions in the parameter and return types.
4. Course summary: the cheapest bug is the one the compiler refuses.

**Going further**: [chapter ITER](../chapter-ITER/README.md) (generics, conditional and mapped types)
