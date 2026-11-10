# Chapter C: Domain Types & Value Objects

> **Duration**: 25 min ([plan](../README.md#the-3-hour-session)).
> File: [`01-value-objects.test.ts`](./01-value-objects.test.ts)

```bash
pnpm test test-types/chapter-c
```

## Primitive obsession

When every concept is a `string` or a `number`, the compiler cannot tell them apart. Swapped arguments
compile ([A2](../chapter-a/README.md#a2-structural-typing)), and nothing prevents
`email = "not an email"` or `price = -5`.

## Branded types

```typescript
type Email = string & { readonly __brand: 'Email' };

const email = (value: string): Email => {
  if (!value.includes('@')) throw new Error(`Invalid email: ${value}`);
  return value as Email;
};
```

The brand only exists for the compiler: an `Email` is still a plain string at runtime, at no cost.
The function that builds it (a **smart constructor**) is the only way to get one, so validation runs
**once, at the boundary**, and every function that receives an `Email` can trust it.

## Value objects

When the concept has **rules and behaviour**, use a small class:

| Property | How | Example (`Money`) |
|----------|-----|-------------------|
| Always valid | private constructor + static factory that validates | `Money.of(-5, 'EUR')` throws |
| Immutable | `readonly` fields, operations return a new object | `price.add(tax)` |
| Compared by value | an `equals` method | `Money.of(10,'EUR').equals(Money.of(10,'EUR'))` |
| Holds its rules | methods next to the data | no adding EUR to USD |

## Takeaways

1. Give each domain concept its own type: `Email`, `UserId`, `Money`, not `string` and `number`.
2. Validate once, when the value is created. After that, the type is the proof.
3. Use a branded type for a simple tag, and a value object when there are rules and operations.

**Next**: [Chapter D: Honest Functions](../chapter-d/README.md)
