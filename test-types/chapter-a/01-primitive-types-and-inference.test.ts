/**
 * Chapter A — Section A1: Primitive types & inference
 * Theory: ./README.md#a1-primitive-types--inference
 *
 * Goals
 *   - use the primitive types number, string, boolean
 *   - know when TypeScript infers a type and when you must write it
 *   - recognise a type error (and the cases TypeScript does NOT catch)
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('A1. Primitive types & inference', () => {
  describe('1. A type restricts values', () => {
    it('accepts only values of the declared type', () => {
      let quantity: number = 3;
      quantity = 4; // ✓ still a number

      // @ts-expect-error — a string is not a number
      quantity = 'four';

      expect(quantity).toBe('four'); // 😱 at runtime JavaScript does not care: the check only exists at compile-time
    });

    it('restricts the operations you may apply', () => {
      const price: number = 10;
      const name: string = 'Laptop';
      const inStock: boolean = true;

      expect(price * 2).toBe(20); // arithmetic on numbers
      expect(name.toUpperCase()).toBe('LAPTOP'); // string methods on strings
      expect(!inStock).toBe(false); // logic on booleans

      // @ts-expect-error — strings have no toFixed() method
      expect(() => name.toFixed(2)).toThrow(TypeError); // the compiler warned us before it crashed
    });

    it('😱 still lets some JavaScript coercions through', () => {
      const quantity = 5;
      const name = 'Laptop';

      // `+` with a string means concatenation: allowed, the number is converted
      expect(quantity + name).toBe('5Laptop');

      // other arithmetic operators are refused
      // @ts-expect-error — cannot multiply a number by a string
      quantity * name;
    });
  });

  describe('2. Inference: TypeScript guesses the type from the value', () => {
    it('infers the type of an initialised variable', () => {
      let orderId = 'ORD-001'; // inferred: string (hover it in your IDE)

      // @ts-expect-error — inference is as strict as an annotation
      orderId = 42;

      expect(typeof orderId).toBe('number'); // 😱 again: types are erased at runtime
    });

    it('infers literal types for constants', () => {
      const status = 'pending'; // inferred: the literal type "pending", not string
      let mutableStatus = 'pending'; // inferred: string (it may change)
      mutableStatus = 'shipped';

      const onlyPending: 'pending' = status; // ✓
      expect(onlyPending).toBe('pending');
      expect(mutableStatus).toBe('shipped');
    });

    it('infers array and return types', () => {
      const quantities = [1, 2, 3]; // number[]
      const mixed = [1, 'two']; // (string | number)[]

      function total(price: number, quantity: number) {
        return price * quantity; // return type inferred: number
      }

      expect(total(10, quantities[2])).toBe(30);
      expect(mixed).toHaveLength(2);
    });
  });

  describe('3. When you must annotate', () => {
    it('function parameters are never inferred', () => {
      // Without `: string` the parameter would be `any` and strict mode refuses it.
      function formatOrderId(id: string): string {
        return id.toUpperCase();
      }

      expect(formatOrderId('ord-001')).toBe('ORD-001');
    });

    it('empty collections need a type', () => {
      const orderIds: string[] = []; // without it, TypeScript cannot know what goes inside
      orderIds.push('ORD-001');

      // @ts-expect-error — only strings allowed
      orderIds.push(42);

      expect(orderIds[0]).toBe('ORD-001');
    });

    it('a return type documents (and protects) the contract', () => {
      function discountRate(isMember: boolean): number {
        return isMember ? 0.1 : 0;
        // If someone later writes `return 'none'`, the compiler refuses it right here,
        // instead of breaking every caller.
      }

      expect(discountRate(true)).toBe(0.1);
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A1.1 declare `let stock = 10`, then try to assign "ten": which line fails and why?');
    it.todo('🫵 A1.2 write `average(values: number[]): number` and a test; what happens if the array is empty?');
    it.todo('🫵 A1.3 find one more JavaScript coercion that TypeScript accepts (hint: `==`, template strings…)');
  });
});
