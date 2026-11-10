/**
 * Chapter C — Section C1: Domain types and value objects   (~25 min)
 * Theory: ./README.md
 *
 * Goals
 *   - recognise "primitive obsession": everything is a string or a number
 *   - give a concept its own type with a branded type (zero runtime cost)
 *   - build a value object: validated once, immutable, compared by value, with behaviour
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('C1. Domain types and value objects', () => {
  describe('1. Primitive obsession', () => {
    it('😱 a string can hold anything, and two strings can be swapped (recall A2)', () => {
      function createUser(id: string, email: string) {
        return { id, email };
      }

      const swapped = createUser('alice@example.com', 'USER-123'); // compiles
      const invalid = createUser('USER-1', 'not an email'); // compiles too

      expect(swapped.id).toBe('alice@example.com');
      expect(invalid.email).toBe('not an email');
    });
  });

  describe('2. Branded types: a name for the compiler, a plain string at runtime', () => {
    // The "brand" is a fake property that only exists for the compiler.
    type UserId = string & { readonly __brand: 'UserId' };
    type Email = string & { readonly __brand: 'Email' };

    // The only way to obtain a branded value is through these functions ("smart constructors"):
    // the right place to validate.
    const userId = (value: string): UserId => value as UserId;
    const email = (value: string): Email => {
      if (!value.includes('@')) throw new Error(`Invalid email: ${value}`);
      return value as Email;
    };

    function createUser(id: UserId, mail: Email) {
      return { id, mail };
    }

    it('accepts correctly built values', () => {
      expect(createUser(userId('USER-123'), email('alice@example.com')).id).toBe('USER-123');
    });

    it('refuses swapped arguments and raw strings', () => {
      // @ts-expect-error — an Email is not a UserId
      createUser(email('alice@example.com'), userId('USER-123'));

      // @ts-expect-error — a raw string has no brand
      createUser('USER-123', email('alice@example.com'));
    });

    it('validates once, at the boundary', () => {
      expect(() => email('not an email')).toThrow('Invalid email');
    });

    it('is still a string at runtime', () => {
      expect(typeof userId('USER-123')).toBe('string');
    });
  });

  describe('3. Value objects: a small immutable class with rules and behaviour', () => {
    type Currency = 'EUR' | 'USD';

    class Money {
      // private constructor: the only way in is `Money.of`, which validates
      private constructor(
        readonly cents: number,
        readonly currency: Currency,
      ) {}

      static of(amount: number, currency: Currency): Money {
        if (amount < 0) throw new Error('Money cannot be negative');
        return new Money(Math.round(amount * 100), currency);
      }

      add(other: Money): Money {
        if (other.currency !== this.currency) throw new Error('Cannot add different currencies');
        return new Money(this.cents + other.cents, this.currency); // a NEW object: immutable
      }

      equals(other: Money): boolean {
        return this.cents === other.cents && this.currency === other.currency;
      }

      toString(): string {
        return `${(this.cents / 100).toFixed(2)} ${this.currency}`;
      }
    }

    it('cannot be created invalid', () => {
      expect(() => Money.of(-5, 'EUR')).toThrow('negative');

      // @ts-expect-error — the constructor is private: no way to skip validation
      new Money(-500, 'EUR');

      // @ts-expect-error — only known currencies
      Money.of(5, 'BTC');
    });

    it('is immutable: operations return a new value', () => {
      const price = Money.of(10, 'EUR');
      const total = price.add(Money.of(2.5, 'EUR'));

      expect(total.toString()).toBe('12.50 EUR');
      expect(price.toString()).toBe('10.00 EUR'); // unchanged

      // @ts-expect-error — readonly
      price.cents = 0;
    });

    it('is compared by value, not by reference', () => {
      expect(Money.of(10, 'EUR') === Money.of(10, 'EUR')).toBe(false); // two objects
      expect(Money.of(10, 'EUR').equals(Money.of(10, 'EUR'))).toBe(true); // same value
    });

    it('carries the business rules with the data (no 0.1 + 0.2 surprise, no currency mix-up)', () => {
      expect(0.1 + 0.2).not.toBe(0.3); // 😱 floating point
      expect(Money.of(0.1, 'EUR').add(Money.of(0.2, 'EUR')).equals(Money.of(0.3, 'EUR'))).toBe(true);
      expect(() => Money.of(1, 'EUR').add(Money.of(1, 'USD'))).toThrow('different currencies');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 C1.1 write a `Quantity` value object (integer, 1 to 99) with `of`, `add` and `equals`, and its tests');
    it.todo('🫵 C1.2 rewrite `createOrderLine(productId: string, quantity: number, price: number)` with domain types');
  });
});
