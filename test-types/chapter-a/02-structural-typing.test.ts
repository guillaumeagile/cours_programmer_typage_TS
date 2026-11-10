/**
 * Chapter A — Section A2: Structural typing   (~10 min)
 * Theory: ./README.md#a2-structural-typing
 *
 * Goals
 *   - understand that TypeScript compares types by shape, not by name
 *   - see the trap: two concepts with the same shape can be swapped
 *     (the fix, branded types and value objects, comes in Chapter C)
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('A2. Structural typing', () => {
  describe('1. Same shape = compatible', () => {
    it('accepts a value of another type with the same shape', () => {
      type Point = { x: number; y: number };
      type Coordinate = { x: number; y: number };

      const point: Point = { x: 1, y: 2 };
      const tupleXetY = { x: 1, y: 2 };   // type anonyme
      var coordinate: Coordinate = point; // ✓ names differ, shapes match
      coordinate = tupleXetY; // ca fonctionne aussi, parce que les types ont la même forme
      //  { x: 1, y: 2 } n'a pas de nom : TypeScript en déduit le type { x: number; y: number } directement à partir de la valeur.
      //  C'est un type anonyme, et il se range sans difficulté dans Point ou Coordinate
      //  grâce au typage structurel, puisque seule la forme compte.

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
      // How to make the compiler see it: Chapter C (branded types, value objects).
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A2.1 write a `Discount = { rate: number }` and a `Tax = { rate: number }`: can you pass a Tax where a Discount is expected? Why?');
    it.todo('🫵 A2.2 in your own words: one advantage and one drawback of structural typing');
  });
});
