/**
 * Chapter A — Section A3: Structural typing
 * Theory: ./README.md#a3-structural-typing
 *
 * Goals
 *   - understand that TypeScript compares types by shape, not by name
 *   - see the trap: two concepts with the same shape can be swapped
 *   - fix it with branded types
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('A3. Structural typing', () => {
  describe('1. Same shape = compatible', () => {
    it('accepts a value of another type with the same shape', () => {
      type Point = { x: number; y: number };
      type Coordinate = { x: number; y: number };

      const point: Point = { x: 1, y: 2 };
      const coordinate: Coordinate = point; // ✓ names differ, shapes match

      expect(coordinate.x).toBe(1);
    });

    it('accepts a value with MORE properties than required', () => {
      type Named = { name: string };
      const product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      const named: Named = product; // ✓ product has at least `name`

      expect(named.name).toBe('Laptop');
    });

    it('refuses a value with FEWER properties', () => {
      type Contact = { name: string; email: string };
      const partial = { name: 'Alice' };

      // @ts-expect-error — `email` is missing
      const contact: Contact = partial;

      expect(contact.name).toBe('Alice');
    });

    it('a class does not need `implements` to fit an interface (duck typing)', () => {
      interface Logger {
        log(message: string): void;
      }

      class ConsoleLogger {
        // no `implements Logger` here
        messages: string[] = [];
        log(message: string) {
          this.messages.push(message);
        }
      }

      const logger: Logger = new ConsoleLogger(); // ✓ it has a log(string) method
      logger.log('hello');

      expect(logger).toBeInstanceOf(ConsoleLogger);
      // In Java or C# (nominal typing) this assignment would be refused.
    });
  });

  describe('2. The trap: different concepts, same shape', () => {
    it('😱 aliases of string are all the same type', () => {
      type UserId = string;
      type Email = string;

      function createUser(id: UserId, email: Email) {
        return { id, email };
      }

      // Arguments swapped by mistake: the compiler cannot see it.
      const user = createUser('alice@example.com', 'USER-123');

      expect(user.id).toBe('alice@example.com'); // 😱 the bug is in production
    });
  });

  describe('3. The fix: branded types', () => {
    // The "brand" is a fake property that only exists for the compiler.
    type UserId = string & { readonly __brand: 'UserId' };
    type Email = string & { readonly __brand: 'Email' };

    // The only way to obtain a branded value is through these functions:
    // a good place to validate the input.
    const userId = (value: string): UserId => value as UserId;
    const email = (value: string): Email => {
      if (!value.includes('@')) throw new Error(`Invalid email: ${value}`);
      return value as Email;
    };

    function createUser(id: UserId, mail: Email) {
      return { id, mail };
    }

    it('accepts correctly branded values', () => {
      const user = createUser(userId('USER-123'), email('alice@example.com'));
      expect(user.id).toBe('USER-123');
    });

    it('refuses swapped arguments', () => {
      // @ts-expect-error — an Email is not a UserId
      createUser(email('alice@example.com'), userId('USER-123'));
    });

    it('refuses a plain string', () => {
      // @ts-expect-error — a raw string has no brand
      createUser('USER-123', email('alice@example.com'));
    });

    it('is still a string at runtime: no cost', () => {
      const id = userId('USER-123');
      expect(typeof id).toBe('string');
      expect(id.startsWith('USER')).toBe(true);
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A3.1 create branded `OrderId` and `ProductId`, and a function `addToOrder(order, product)`');
    it.todo('🫵 A3.2 add validation to the `OrderId` constructor (must start with "ORD-") and test the error');
    it.todo('🫵 A3.3 in your own words: one advantage and one drawback of structural typing');
  });
});
