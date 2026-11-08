/**
 * Chapter A — Section A2: Object types
 * Theory: ./README.md#a2-object-types
 *
 * Goals
 *   - describe the shape of an object with `type`
 *   - use optional (`?`) and `readonly` properties
 *   - know the practical differences between `type` and `interface`
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

describe('A2. Object types', () => {
  describe('1. A type describes a shape', () => {
    it('requires every non-optional property', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      // @ts-expect-error — `price` is missing
      const broken: Product = { id: 'PROD-2', name: 'Mouse' };

      expect(laptop.name).toBe('Laptop');
      expect(broken.price).toBeUndefined();
    });

    it('refuses unknown properties in an object literal', () => {
      const mouse: Product = {
        id: 'PROD-2',
        name: 'Mouse',
        price: 25,
        // @ts-expect-error — `colour` is not part of Product (typo protection!)
        colour: 'black',
      };

      expect(mouse.price).toBe(25);
    });

    it('refuses access to properties that do not exist', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      // @ts-expect-error — Product has no `stock`
      expect(laptop.stock).toBeUndefined();
    });
  });

  describe('2. Optional and readonly properties', () => {
    it('an optional property may be undefined, so you must handle that case', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      // @ts-expect-error — `description` is possibly undefined
      expect(() => laptop.description.length).toThrow(TypeError); // the crash the compiler prevents

      const summary = laptop.description ?? 'No description';
      expect(summary).toBe('No description');
    });

    it('a readonly property cannot be reassigned', () => {
      const laptop: Product = { id: 'PROD-1', name: 'Laptop', price: 999 };

      laptop.price = 899; // ✓ allowed

      // @ts-expect-error — `id` is readonly
      laptop.id = 'PROD-999';

      expect(laptop.price).toBe(899);
    });
  });

  describe('3. type vs interface', () => {
    it('both describe object shapes, and are interchangeable here', () => {
      type UserAsType = { name: string; email: string };
      interface UserAsInterface {
        name: string;
        email: string;
      }

      const a: UserAsType = { name: 'Alice', email: 'alice@example.com' };
      const b: UserAsInterface = a; // ✓ same shape (more on this in A3)

      expect(b.name).toBe('Alice');
    });

    it('extend with `extends` (interface) or `&` (type)', () => {
      interface User {
        name: string;
      }
      interface Admin extends User {
        permissions: string[];
      }

      type Customer = { name: string };
      type VipCustomer = Customer & { discount: number };

      const admin: Admin = { name: 'Alice', permissions: ['delete'] };
      const vip: VipCustomer = { name: 'Bob', discount: 0.2 };

      expect(admin.permissions).toContain('delete');
      expect(vip.discount).toBe(0.2);
    });

    it('only `type` can name a primitive or a union', () => {
      type OrderStatus = 'pending' | 'shipped' | 'delivered';

      let status: OrderStatus = 'pending';
      status = 'shipped';

      // @ts-expect-error — not one of the allowed values
      status = 'lost';

      expect(status).toBe('lost');
    });

    it('😱 both disappear at runtime', () => {
      interface User {
        name: string;
      }
      const user: User = { name: 'Alice' };

      expect(typeof user).toBe('object'); // not "User": the type only exists for the compiler
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A2.1 define an `OrderLine` type (product, quantity, optional discount) and compute its total');
    it.todo('🫵 A2.2 make `quantity` readonly and write the line that the compiler must refuse (with @ts-expect-error)');
    it.todo('🫵 A2.3 rewrite `OrderLine` as an interface: what changes, what stays the same?');
  });
});
