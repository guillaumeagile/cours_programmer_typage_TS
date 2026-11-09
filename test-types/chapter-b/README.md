# Chapter B: Coupling & Abstraction

> **Duration**: 25 min ([plan](../README.md#the-3-hour-session)).

**Coupling** measures how much a piece of code must know about another. A class that creates its own
`SmtpMailer` is tied to that concrete class: you cannot change it, and you cannot test the class
without a mail server. **Abstraction** breaks the link: the class depends on a **contract** (an
interface) and receives an implementation from outside.

| #  | Section | File | Time |
|----|---------|------|------|
| B1 | [Coupling and dependency injection](#b1-coupling-and-dependency-injection) | [`01-coupling-and-injection.test.ts`](./01-coupling-and-injection.test.ts) | 15 min |
| B2 | [Liskov substitution](#b2-liskov-substitution-principle) | [`02-liskov-substitution.test.ts`](./02-liskov-substitution.test.ts) | 10 min |

```bash
pnpm test test-types/chapter-b
```

## B1. Coupling and dependency injection

1. **Spot the hidden dependency**: a `new` inside a class, `new Date()`, `Math.random()`, a global.
2. **Write the contract**: an interface with only what the class needs (`Mailer { send(to, body) }`).
3. **Inject it** through the constructor: `constructor(private readonly mailer: Mailer)`.
4. **Test with a fake**: a small class that implements the interface and records the calls.

This builds on interfaces and `implements` ([A3](../chapter-a/README.md#a3-oop-in-typescript-classes-and-interfaces)).
The compiler checks that whatever you inject fulfils the contract. Thanks to structural typing
([A2](../chapter-a/README.md#a2-structural-typing)), any object of the right shape will do.

You don't need a framework for this. Passing the dependency as a parameter is enough.

## B2. Liskov Substitution Principle

> If `S` is a subtype of `T`, an `S` must be usable everywhere a `T` is expected, **without surprises**.

A `Line extends Shape` whose `getArea()` throws compiles fine, then crashes the code that sums the
areas. The compiler cannot catch it: `Line` **says** it is a `Shape` but does not **behave** like one.

The fix is smaller contracts (**Interface Segregation**): `Shape1D { getLength() }` and
`Shape2D extends Shape1D { getArea() }`. A `Line` is only `Shape1D`, and the compiler now refuses it
where an area is needed.

Warning sign: a method that throws "not supported" in a subclass.

## Takeaways

1. Depend on contracts (interfaces), not on concrete classes.
2. Make dependencies visible: inject them through the constructor or as parameters.
3. A subtype must keep its parent's promises. When it can't, split the contract.

**Going further**: [internal state and temporal coupling](../going-further/README.md)

**Next**: [Chapter C: Domain types & Value Objects](../chapter-c/README.md)
