# Teaching Guide: the 3-hour session

The rhythm for each section: **show the trap (😱), let the compiler refuse it (`@ts-expect-error`),
then give the first 🫵 exercise.** Live-code by deleting a `@ts-expect-error` so the students read the
real compiler message. The theory is in the chapter READMEs: don't read it out, show the code.

Domain used everywhere: a small online shop (products, orders, users, payments).

## Run sheet

| Time | Section | Live demo | In-class exercise | Message to land |
|------|---------|-----------|-------------------|-----------------|
| 0:00 | Intro | `5 * 'Laptop'` refused, `5 + 'Laptop'` accepted | — | The compiler is the fastest test |
| 0:02 | A1 Types & objects | missing / unknown / optional property | A1.1 `OrderLine` (3 min) | A type is a constraint, erased at runtime |
| 0:10 | A2 Structural typing | swapped `UserId` / `Email` strings | A2.1 (discussion) | Same shape = same type. Keep this trap in mind for C |
| 0:20 | A3 OOP in TS | `private` leaks in JSON; `instanceof Notifier` impossible; `Euro = new Dollar()`; lost `this` | A3.1 `PayPal` (7 min) | Same words as Java, different rules: structural and erased |
| 0:45 | A4 Narrowing | `typeof`, `in`, predicate with `filter`, wrong cast | A4.1 `parseQuantity` (5 min) | Narrow, don't cast |
| 1:00 | B1 Coupling & DI | `OrderService` + `SmtpMailer` → `Mailer` + `FakeMailer` | B1.1 `ExchangeRates` (7 min) | Depend on contracts, inject them |
| 1:15 | B2 Liskov | `Line.getArea()` throws → `Shape1D` / `Shape2D` | B2.2 Square/Rectangle (discussion) | A subtype keeps its parent's promises |
| 1:25 | *Break* | | | |
| 1:35 | C Value objects | brands refuse swapped arguments; `Money` | C1.1 `Quantity` (10 min) | Validate once, then trust the type |
| 2:00 | D Honest functions | `findUser` throws; `parseAge` returns NaN → `Result` | D1.1 `divide` (10 min) | The signature tells the whole truth |
| 2:30 | E Illegal states | flags → union; remove a `case` to see `never` fail | E1.1 add `refunded` (10 min) | Make bugs impossible to write |
| 2:55 | Wrap-up | Back to the A2 trap: which chapter fixes it? (C) | — | — |

## If you are running late

- Skip B2 (Liskov): it is the most independent section. Mention it and leave it as homework.
- In A3, keep the "surprises for Java / C# developers" part and go quickly over the syntax.
- In A1, only show the object-type part. Students usually know primitives already.
- Exercises: give 5 minutes, then live-code the solution together.

## Common questions

- **"Why not just use `any`?"** It turns the compiler off. `unknown` is the safe version (A4).
- **"Isn't `as` enough?"** A cast checks nothing (A4, last part). A smart constructor checks once (C).
- **"Why does `private` show up in my JSON?"** It only exists for the compiler. Use `#field` for runtime privacy (A3).
- **"Do I need a DI framework?"** No. A constructor parameter is dependency injection (B1).
- **"Exceptions or `Result`?"** Use `Result` for expected failures (bad input, not found). Keep
  exceptions for bugs.

## After the session

- Remaining 🫵 exercises as homework. Each file has 2.
- [going-further/](./going-further/README.md) and [chapter-ITER/](./chapter-ITER/README.md) for
  motivated students.
