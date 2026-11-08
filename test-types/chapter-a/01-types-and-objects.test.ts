/**
 * Chapter A — Section A1: Types, inference and object types   (~15 min)
 * Theory: ./README.md#a1-types-inference-and-object-types
 *
 * Goals
 *   - a type restricts values AND operations; it is checked at compile-time only
 *   - let TypeScript infer, annotate where it cannot
 *   - describe an object shape with `type` (required, optional, readonly properties)
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

type Product = {
  readonly id: string;
  name: string;
  price: number;
  description?: string; // optional
};

describe('A1. Types, inference and object types', () => {
  describe('1. A type restricts values and operations', () => {
    it('refuses a value of the wrong type', () => {
      let quantity: number = 3;

      // @ts-expect-error — a string is not a number
      quantity = 'four';

      expect(quantity).toBe('four'); // 😱 at runtime JavaScript does not care: types are erased
    });

    it('refuses operations the type does not support', () => {
      const name: string = 'Laptop';

      expect(name.toUpperCase()).toBe('LAPTOP');

      // @ts-expect-error — strings have no toFixed() method
      expect(() => name.toFixed(2)).toThrow(TypeError); // the crash the compiler warned us about
    });

    it('😱 still lets some JavaScript coercions through', () => {
      expect(5 + 'Laptop').toBe('5Laptop'); // `+` with a string = concatenation: allowed

      // @ts-expect-error — other arithmetic operators are refused
      5 * 'Laptop';
    });
  });

  describe('2. Inference: TypeScript guesses, then checks just as strictly', () => {
    it('infers the type of an initialised variable', () => {
      let orderId = 'ORD-001'; // inferred: string (hover it in your IDE)

      // @ts-expect-error — inference is as strict as an annotation
      orderId = 42;

      expect(orderId).toBe(42);
    });

    it('you must annotate parameters and empty collections', () => {
      function formatOrderId(id: string): string {
        // without `: string`, `id` would be `any`, which strict mode refuses
        return id.toUpperCase();
      }
      const orderIds: string[] = []; // without it, TypeScript cannot know what goes inside

      orderIds.push(formatOrderId('ord-001'));

      expect(orderIds).toEqual(['ORD-001']);
    });
  });

  describe('3. Object types describe a shape', () => {
    it('requires every non-optional property, and refuses unknown ones', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      // @ts-expect-error — `price` is missing
      const broken: Product = { id: 'PROD-2', name: 'Mouse' };

      // @ts-expect-error — `colour` is not part of Product (typo protection!)
      const typo: Product = { id: 'PROD-3', name: 'Pen', price: 2, colour: 'blue' };

      expect(laptop.name).toBe('Laptop');
      expect(broken.price).toBeUndefined();
      expect(typo.price).toBe(2);
    });

    it('an optional property may be undefined: you must handle that case', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      // @ts-expect-error — `description` is possibly undefined
      expect(() => laptop.description.length).toThrow(TypeError);

      expect(laptop.description ?? 'No description').toBe('No description');
    });

    it('a readonly property cannot be reassigned', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      laptop.price = 899; // ✓

      // @ts-expect-error — `id` is readonly
      laptop.id = 'PROD-999';

      expect(laptop.price).toBe(899);
    });

    it('`type` and `interface` both work; only `type` can name a union', () => {
      interface Customer {
        name: string;
      }
      type OrderStatus = 'pending' | 'shipped' | 'delivered';

      const customer: Customer = { name: 'Alice' };
      let status: OrderStatus = 'pending';

      // @ts-expect-error — not one of the allowed values
      status = 'lost';

      expect(customer.name).toBe('Alice');
      expect(status).toBe('lost');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A1.1 define an `OrderLine` type (product, readonly quantity, optional discount) and a `lineTotal` function');
    it.todo('🫵 A1.2 write the line the compiler must refuse when changing `quantity` (with @ts-expect-error)');
  });
});
