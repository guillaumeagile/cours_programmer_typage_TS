# Chapter A: Cohesion - Types as Constraints

> **Audience**: Bachelor, 3rd year. You know basic JavaScript and have seen classes in an OO language.
> **Duration**: about 3 hours (6 sections of ~30 min).

A **type** is a set of constraints: it says which values are allowed and which operations you may
apply to them. TypeScript checks those constraints **before the program runs** (at compile-time),
whereas JavaScript only discovers mistakes at runtime.

This chapter builds up from the simplest types to class hierarchies. Each section has **one test
file**: read the short theory below, then open the file and follow it from top to bottom.

## Plan

| #  | Section                                                   | File                                                                       | You will learn                                              |
|----|-----------------------------------------------------------|----------------------------------------------------------------------------|-------------------------------------------------------------|
| A1 | [Primitive types & inference](#a1-primitive-types--inference) | [`01-primitive-types-and-inference.test.ts`](./01-primitive-types-and-inference.test.ts) | `number`, `string`, `boolean`, annotations, inference, type errors |
| A2 | [Object types](#a2-object-types)                          | [`02-object-types.test.ts`](./02-object-types.test.ts)                     | object shapes, optional & `readonly` properties, `type` vs `interface` |
| A3 | [Structural typing](#a3-structural-typing)                | [`03-structural-typing.test.ts`](./03-structural-typing.test.ts)           | "same shape = same type", its trap, branded types           |
| A4 | [Classes & inheritance](#a4-classes--inheritance)         | [`04-classes-and-inheritance.test.ts`](./04-classes-and-inheritance.test.ts) | classes as types, `extends`, `abstract`, polymorphism        |
| A5 | [Narrowing](#a5-narrowing)                                | [`05-narrowing.test.ts`](./05-narrowing.test.ts)                           | `typeof`, `instanceof`, `in`, type predicates, casts (`as`) |
| A6 | [Liskov substitution](#a6-liskov-substitution-principle)  | [`06-liskov-substitution.test.ts`](./06-liskov-substitution.test.ts)       | when a subtype breaks its parent's contract, and how to fix it |

Every file uses the same running example (a small online shop: products, orders, users) so you can
focus on the types, not on the domain.

## How to work with the test files

```bash
npm test -- test-types/chapter-a                  # the whole chapter
npm test -- test-types/chapter-a/03               # one section
npm test -- test-types/chapter-a --watch          # re-run on every save
```

Conventions used in every file:

| Marker                | Meaning                                                                                 |
|-----------------------|-----------------------------------------------------------------------------------------|
| `// @ts-expect-error` | The next line is a **deliberate type error**. The compiler checks that it really fails. 👉 Delete the comment to read the error message in your IDE. |
| `// 😱`               | A trap: the code compiles and runs, but does something you probably did not expect.    |
| `it.todo('🫵 ...')`    | An exercise for you. Replace `it.todo` with `it` and write the test.                    |

---

## A1. Primitive types & inference

TypeScript's basic types are `number`, `string` and `boolean`. You can **annotate** a variable
(`const age: number = 30`) or let TypeScript **infer** the type from the value (`const age = 30`).
Both give exactly the same safety: an inferred type is still checked.

Rules of thumb:

- **Let TypeScript infer** local variables initialised with a value.
- **Always annotate** function parameters (they cannot be inferred) and empty collections
  (`const ids: string[] = []`).
- **Annotate return types** of functions others will call: it documents the contract.

A **type error** is code that is syntactically valid but breaks a type rule
(`const age: number = "thirty"`). It is caught by the compiler, before any test runs.

Beware: TypeScript keeps some JavaScript habits. `5 + "Alice"` is **allowed** (it builds the string
`"5Alice"`), while `5 * "Alice"` is an error.

## A2. Object types

An object type describes a **shape**: which properties exist and what their types are.

```typescript
type Product = {
  readonly id: string;  // cannot be reassigned
  name: string;
  price: number;
  description?: string; // optional: may be missing (undefined)
};
```

TypeScript rejects a missing required property, an unknown property in an object literal, and access
to a property that does not exist.

`type` and `interface` both describe object shapes. Differences that matter at this level:

| `type`                                        | `interface`                                  |
|-----------------------------------------------|----------------------------------------------|
| Can name anything: `type Id = string`, unions | Only object shapes                           |
| Combined with `&` (intersection)              | Combined with `extends`                      |

Pick one convention per project. Both **disappear at runtime**: `typeof user` is always `"object"`.

## A3. Structural typing

TypeScript compares types by their **shape**, not by their name (*structural typing*, also called
duck typing: "if it quacks like a duck…"). Java and C# compare by name (*nominal typing*).

```typescript
type Point = { x: number; y: number };
type Coordinate = { x: number; y: number };
const p: Point = { x: 1, y: 2 };
const c: Coordinate = p; // ✓ same shape → compatible
```

This is flexible, but it has a trap: `type UserId = string` and `type Email = string` are the
**same** type, so nothing stops you from swapping them. **Branded types** add an invisible "label"
so that the compiler can tell them apart:

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type Email  = string & { readonly __brand: 'Email' };
```

(Chapter C goes further with Value Objects, which also validate their content.)

## A4. Classes & inheritance

A class defines **a type and an implementation** at the same time. Unlike `type`/`interface`, a class
still exists at runtime, so `instanceof` works.

- `extends` creates a **subtype**: a `Dog` can be used wherever an `Animal` is expected, not the other
  way around.
- An `abstract` class cannot be instantiated; its `abstract` methods must be implemented by
  subclasses.
- **Polymorphism**: code written against the parent type calls the right subclass method at runtime.
- A class can `implements` an interface to promise it respects a contract.

## A5. Narrowing

When a value has a broad type (`string | number`, `unknown`, a parent class), you must **narrow** it
before using what is specific to one case. TypeScript follows your `if` statements:

| Check                         | Narrows                       |
|-------------------------------|-------------------------------|
| `typeof x === 'string'`       | primitive types               |
| `x instanceof ShippedOrder`   | class instances               |
| `'trackingNumber' in x`       | objects by property           |
| `isShipped(x)` (`x is …`)     | your own reusable check       |

A **cast** (`x as T`) does *not* check anything: it tells the compiler "trust me". If you are wrong,
the error only shows up at runtime. Prefer a check that narrows; use `as` only when you truly know
more than the compiler.

## A6. Liskov Substitution Principle

The "L" of SOLID: **a subtype must be usable everywhere its parent is expected, without surprises.**
The compiler checks that method signatures match, but not that the *behaviour* honours the contract.

Example: `Line extends Shape` must implement `getArea()`. A line has no area, so it throws an
exception, and every piece of code that loops over shapes now crashes. The fix is to split the
contract into smaller interfaces (the "I" of SOLID, *Interface Segregation*): `Shape1D` with
`getLength()`, `Shape2D` with `getArea()` too. A `Line` is then simply not a `Shape2D`, and the
compiler refuses to put it in a list of 2D shapes.

---

## Key takeaways

- A type is a set of **constraints** checked at compile-time.
- Types create **cohesion**: they keep related data together with the rules that apply to it
  (Chapter B looks at the other side of the coin: coupling).
- Inference is as safe as annotations; annotate parameters, empty collections and public contracts.
- TypeScript types are **structural**; use branded types when two concepts share the same shape.
- `type` and `interface` vanish at runtime; classes do not.
- Narrow broad types with checks, not with casts.
- Inheritance is a promise about behaviour (Liskov), not only about method names.

**Next: [Chapter B: Coupling & Abstraction](../chapter-b/README.md)**
