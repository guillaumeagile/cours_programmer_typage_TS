# Chapter A: Types as Constraints

> **Duration**: 40 min, in a 3-hour session covering chapters A to E ([plan](../README.md#the-3-hour-session)).

A **type** is a set of constraints: it says which values are allowed and which operations you may
apply to them. TypeScript checks those constraints **before the program runs** (at compile-time),
whereas JavaScript only discovers mistakes at runtime.

| #  | Section | File | Time |
|----|---------|------|------|
| A1 | [Types, inference and object types](#a1-types-inference-and-object-types) | [`01-types-and-objects.test.ts`](./01-types-and-objects.test.ts) | 15 min |
| A2 | [Structural typing](#a2-structural-typing) | [`02-structural-typing.test.ts`](./02-structural-typing.test.ts) | 10 min |
| A3 | [Narrowing](#a3-narrowing) | [`03-narrowing.test.ts`](./03-narrowing.test.ts) | 15 min |

```bash
pnpm test test-types/chapter-a           # the whole chapter
pnpm test test-types/chapter-a/02        # one section
pnpm test test-types/chapter-a --watch   # re-run on every save
```

## A1. Types, inference and object types

- A type restricts **values** (`quantity = 'four'` is refused) and **operations** (`name.toFixed()`
  is refused on a string).
- Types are **erased at runtime**: they protect you only while compiling.
- TypeScript **infers** the type of an initialised variable, and checks it just as strictly as an
  annotation. You **must annotate** function parameters and empty collections.
- An object type describes a **shape**. Missing properties, unknown properties in a literal and
  access to a property that does not exist are all refused.
- `description?: string` means the property may be missing, so the compiler makes you handle
  `undefined`. `readonly id: string` cannot be reassigned.
- `type` and `interface` are interchangeable for object shapes. Only `type` can name a union such as
  `'pending' | 'shipped'`.

## A2. Structural typing

TypeScript compares types by **shape, not by name**. Two types with the same properties are
compatible, a value with **more** properties fits, and a class fits an interface without `implements`.
Java and C# are **nominal**: there, only declared relationships count.

😱 **The trap**: `type UserId = string` and `type Email = string` are the same type, so swapped
arguments compile. [Chapter C](../chapter-c/README.md) fixes this.

## A3. Narrowing

A variable of type `number | string` only allows what both types share. **Narrowing** is a runtime
check that the compiler understands, and inside the checked branch the type becomes precise:

| Check | Use it for |
|-------|-----------|
| `typeof x === 'number'` | primitive types |
| `x instanceof ShippedOrder` | classes |
| `'cardNumber' in x` | plain objects |
| `function isShipped(o): o is ShippedOrder` | a reusable check (type predicate) |

A **cast** (`x as ShippedOrder`) checks nothing: it only silences the compiler. Prefer narrowing, and
prefer `unknown` to `any` for data you don't control.

Narrowing comes back in chapters D (`Result`) and E (discriminated unions).

## Takeaways

1. A type is a constraint checked before the code runs. It does not exist at runtime.
2. Infer locally, annotate at the boundaries (parameters, return types of public functions).
3. TypeScript is structural: "same shape = same type". That is convenient, but risky for concepts
   that share a primitive type.
4. Narrow instead of casting.

**Next**: [Chapter B: Coupling & Abstraction](../chapter-b/README.md)
