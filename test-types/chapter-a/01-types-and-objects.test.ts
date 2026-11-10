/**
 * Chapter A — Section A1: Types, inference and object types   (~8 min)
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

      interface HasName {
        name: string;
      }/*
       type HasName = {
        name: string;
      }*/

      const james : HasName = { name: 'James' }  // essaye avec le type

      // The fundamental difference: an interface can only name an object shape.
      // A `type` can name ANY type: a union, a primitive, a tuple, a function, an object…

      type OrderStatus = 'pending' | 'shipped' | 'delivered';
      let status: OrderStatus = 'pending';
      // @ts-expect-error — not one of the allowed values
      status = 'lost';
      expect(status).toBe('lost');


      interface HasId {
        id: string;
      }

      // 'union' sur 2 interfaces
      let customer: HasName | HasId = { name: 'Bond', id: "007" }
      // @ts-expect-error
      expect(customer.name).toBe('Bond');
      // @ts-expect-error
      expect(customer.id).toBe('007');

      //attention à la confusion entre les valeurs et les types
      let client : HasName | HasId
      type TypeDeClient = HasName | HasId   // mais en pratiqe on n'écrit jamais TypeDeT , on écrit juste T, et T est un type
      const client1 :  TypeDeClient = { name: 'Bond'  }
      expect(client1.name).toBe('Bond');
      const client2 :  TypeDeClient = { id: '007'  }
      expect(client2.id).toBe('007');

      // La convention TypeScript (et celle de la plupart des langages) est :
      // -> Types, interfaces, classes, alias de type, enums : PascalCase. Exemples : Client, OrderStatus, HasName, Money.
      // -> Variables, fonctions, paramètres, propriétés : camelCase. Exemples : customer, lineTotal, formatOrderId.
      // -> Constantes globales (parfois) : UPPER_SNAKE_CASE, par exemple MAX_QUANTITY.


      // produit sur 2 interfaces
      const customer2: HasName & HasId = { name: 'Bond', id: "007" }
      expect(customer2.name).toBe('Bond');
      expect(customer2.id).toBe('007');

//    A & B : une valeur doit satisfaire les deux types à la fois. Pour des objets, ça revient à réunir leurs champs, comme un enregistrement qui contient tout ce qu'il y a dans A et dans B. C'est le produit au sens « ET ».
//    A | B : une valeur est d'un type ou de l'autre. C'est la somme au sens « OU », celle des unions discriminées.

      // type anonyme: il n'a pas de nom, ni d'interface
      let anonymousCustomer = { name: 'Bond', id: "007" }
      expect(anonymousCustomer.name).toBe('Bond');

    });

    it('an interface can be declared twice: the declarations merge (a `type` cannot)', () => {
      interface Shipment {
        trackingId: string;
      }
      interface Shipment {
        carrier: string; // merged into the first declaration
      }

      const shipment: Shipment = { trackingId: 'TRK-1', carrier: 'DHL' };

     // @ts-expect-error — `carrier` is part of the merged interface: it is required
      const missing: Shipment = { trackingId: 'TRK-2' };

      expect(shipment.carrier).toBe('DHL');
      expect(missing.trackingId).toBe('TRK-2');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A1.1 define an `OrderLine` type (product, readonly quantity, optional discount) and a `lineTotal` function');
    it.todo('🫵 A1.2 write the line the compiler must refuse when changing `quantity` (with @ts-expect-error)');
  });
});
