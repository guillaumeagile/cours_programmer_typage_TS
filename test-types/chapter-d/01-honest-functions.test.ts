/**
 * Chapter D — Section D1: Honest functions   (~35 min)
 * Theory: ./README.md
 *
 * Goals
 *   - tell a pure function from an impure one
 *   - spot a "lying" signature (it throws, returns undefined or NaN without saying so)
 *   - make absence explicit (`T | undefined`) and failure explicit (a `Result` type)
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

type User = { email: string; name: string };

// A Result says in its type that the function can fail, and how.
// It is a union of two object types with a common `ok` field: Chapter E generalises this idea.
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

describe('D1. Honest functions', () => {
  describe('1. Pure functions: same inputs → same output, no side effect', () => {
    let cartTotal = 0;
    function addToCartImpure(price: number): number {
      cartTotal += price; // side effect: modifies a variable outside the function
      return cartTotal;
    }

    function addToCart(total: number, price: number): number {
      return total + price; // pure: depends only on its inputs
    }

    it('😱 an impure function gives different answers to the same question', () => {
      expect(addToCartImpure(10)).toBe(10);
      expect(addToCartImpure(10)).toBe(20); // same call, different result
    });

    it('a pure function is trivial to test and to reason about', () => {
      expect(addToCart(0, 10)).toBe(10);
      expect(addToCart(0, 10)).toBe(10);
    });
  });

  describe('2. Signatures that lie', () => {
    const users: User[] = [{ email: 'alice@example.com', name: 'Alice' }];

    // The signature promises a User. Always. 😱
    function findUserLying(email: string): User {
      const user = users.find((u) => u.email === email);
      if (!user) throw new Error('User not found');
      return user;
    }

    // The signature promises a number. 😱
    function parseAgeLying(input: string): number {
      return parseInt(input, 10);
    }

    it('😱 the caller has no way to know it can throw', () => {
      expect(() => findUserLying('bob@example.com')).toThrow('User not found');
    });

    it('😱 the caller has no way to know it can return NaN', () => {
      expect(parseAgeLying('twelve')).toBeNaN();
    });
  });

  describe('3. Honest about absence: `T | undefined`', () => {
    const users: User[] = [{ email: 'alice@example.com', name: 'Alice' }];

    function findUser(email: string): User | undefined {
      return users.find((u) => u.email === email);
    }

    it('the compiler forces the caller to handle the missing case', () => {
      const user = findUser('bob@example.com');

      // @ts-expect-error — `user` is possibly undefined
      expect(() => user.name).toThrow(TypeError);

      expect(user?.name ?? 'Guest').toBe('Guest'); // handled
    });
  });

  describe('4. Honest about failure: a Result type', () => {
    type AgeError = 'NOT_A_NUMBER' | 'OUT_OF_RANGE';

    function parseAge(input: string): Result<number, AgeError> {
      const age = Number(input);
      if (!Number.isInteger(age)) return { ok: false, error: 'NOT_A_NUMBER' };
      if (age < 0 || age > 150) return { ok: false, error: 'OUT_OF_RANGE' };
      return { ok: true, value: age };
    }

    it('success and failure are both ordinary values', () => {
      expect(parseAge('42')).toEqual({ ok: true, value: 42 });
      expect(parseAge('twelve')).toEqual({ ok: false, error: 'NOT_A_NUMBER' });
      expect(parseAge('200')).toEqual({ ok: false, error: 'OUT_OF_RANGE' });
    });

    it('the value is only reachable after checking `ok` (narrowing, see A3)', () => {
      const result = parseAge('42');

      // @ts-expect-error — `value` does not exist on the failure case
      result.value;

      if (result.ok) {
        expect(result.value + 1).toBe(43); // here TypeScript knows: success
      } else {
        throw new Error(`unexpected ${result.error}`);
      }
    });

    it('the error cases are listed in the type: the caller can handle each one', () => {
      function ageMessage(input: string): string {
        const result = parseAge(input);
        if (result.ok) return `You are ${result.value}`;
        switch (result.error) {
          case 'NOT_A_NUMBER':
            return 'Please type a number';
          case 'OUT_OF_RANGE':
            return 'Please type a realistic age';
        }
      }

      expect(ageMessage('20')).toBe('You are 20');
      expect(ageMessage('abc')).toBe('Please type a number');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 D1.1 make `divide(a: number, b: number): number` honest about division by zero, with a Result');
    it.todo('🫵 D1.2 write `parseEmail(input: string): Result<Email, ...>` reusing the Email brand of Chapter C');
  });
});
