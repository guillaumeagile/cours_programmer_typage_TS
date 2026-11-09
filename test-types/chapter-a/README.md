# Chapter A: Types as Constraints

> **Duration**: 60 min, in a 3-hour session covering chapters A to E ([plan](../README.md#the-3-hour-session)).

A **type** is a set of constraints: it says which values are allowed and which operations you may
apply to them. TypeScript checks those constraints **before the program runs** (at compile-time),
whereas JavaScript only discovers mistakes at runtime.

| #  | Section | File | Time |
|----|---------|------|------|
| A1 | [Types, inference and object types](#a1-types-inference-and-object-types) | [`01-types-and-objects.test.ts`](./01-types-and-objects.test.ts) | 10 min |
| A2 | [Structural typing](#a2-structural-typing) | [`02-structural-typing.test.ts`](./02-structural-typing.test.ts) | 10 min |
| A3 | [OOP in TypeScript: classes and interfaces](#a3-oop-in-typescript-classes-and-interfaces) | [`03-classes-and-interfaces.test.ts`](./03-classes-and-interfaces.test.ts) | 25 min |
| A4 | [Narrowing](#a4-narrowing) | [`04-narrowing.test.ts`](./04-narrowing.test.ts) | 15 min |

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
  `'pending' | 'shipped'`. Interfaces as contracts for classes: [A3](#a3-oop-in-typescript-classes-and-interfaces).

## A2. Structural typing

TypeScript compares types by **shape, not by name**. Two types with the same properties are
compatible, a value with **more** properties fits, and a class fits an interface without `implements`.
Java and C# are **nominal**: there, only declared names count.

😱 **The trap**: `type UserId = string` and `type Email = string` are the same type, so swapped
arguments compile. [Chapter C](../chapter-c/README.md) fixes this.

## A3. OOP in TypeScript: classes and interfaces

The OOP vocabulary is the same as in Java or C# (`class`, `interface`, `extends`, `implements`,
`abstract`), but several rules differ. Students who know another OO language are the ones who get
caught out.

**Classes**
- A class is **a type and a runtime value**: `instanceof` works.
- **Parameter properties**: `constructor(readonly id: string, private price: number) {}` declares and
  assigns the fields in one go.
- `readonly`, `private` and `protected` are checked **by the compiler only**. At runtime a `private`
  field is an ordinary property (it shows up in `JSON.stringify`). For real runtime privacy, use
  JavaScript's `#field`.

**Interfaces**
- An interface is a **contract**: `class EmailNotifier implements Notifier, Auditable`. A class can
  implement several interfaces, and an interface can `extends` several others.
- 😱 An interface **does not exist at runtime**, so `x instanceof Notifier` is impossible. You check
  the shape instead ([A4](#a4-narrowing)).
- 😱 No class is needed: any object of the right shape satisfies the interface ([A2](#a2-structural-typing)).

**Inheritance**
- `extends` (single inheritance), `super(...)`, `override` (the compiler checks that the parent
  method exists).
- `abstract` class: it cannot be instantiated, and its `abstract` methods must be implemented by the
  subclasses. **Polymorphism**: code written against the parent type calls the right method at runtime.
- **Interface or abstract class?** Use an interface by default (a pure contract, several allowed). Use
  an abstract class when there is code to share.

**😱 Surprises for Java / C# developers**

| Java / C# | TypeScript |
|-----------|-----------|
| Classes are compatible only if they are related by inheritance | Two unrelated classes with the same shape are interchangeable, **unless** they have a `private` member |
| `private` is enforced at runtime | `private` is erased; `#field` is enforced |
| Interfaces exist at runtime (`instanceof`) | Interfaces are erased |
| `this` is always the object | A method passed as a callback loses `this`. Use an arrow-function property |
| Method overloading: several bodies | Several signatures, **one** body |

The Liskov Substitution Principle (what a subclass must guarantee) is covered in
[Chapter B](../chapter-b/README.md#b2-liskov-substitution-principle).

## A4. Narrowing

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
4. OOP in TypeScript looks like Java but is structural and erased: interfaces and `private` do not
   exist at runtime.
5. Narrow instead of casting.

**Next**: [Chapter B: Coupling & Abstraction](../chapter-b/README.md)
