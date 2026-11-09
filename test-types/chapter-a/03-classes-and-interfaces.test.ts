/**
 * Chapter A — Section A3: OOP in TypeScript: classes and interfaces   (~25 min)
 * Theory: ./README.md#a3-oop-in-typescript-classes-and-interfaces
 *
 * Goals
 *   - write classes the TypeScript way (parameter properties, readonly, access modifiers)
 *   - use interfaces as contracts: `implements`, `extends`, several at once
 *   - build a hierarchy with `extends`, `abstract`, `override`, and use polymorphism
 *   - know what is DIFFERENT from Java / C#:
 *       interfaces vanish at runtime, classes are compared structurally,
 *       `private` is compile-time only, `this` can get lost
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('A3. OOP in TypeScript: classes and interfaces', () => {
  describe('1. A class is a type AND a runtime value', () => {
    class Product {
      // parameter properties: declare + assign in the constructor signature
      constructor(
        readonly id: string,
        readonly name: string,
        private price: number,
      ) {}

      label(): string {
        return `${this.name} (${this.price} €)`;
      }

      applyDiscount(rate: number): void {
        this.price = this.price * (1 - rate);
      }
    }

    it('groups data and behaviour', () => {
      const laptop = new Product('PROD-1', 'Laptop', 1000);
      laptop.applyDiscount(0.1);

      expect(laptop.label()).toBe('Laptop (900 €)');
      expect(laptop).toBeInstanceOf(Product); // a class exists at runtime
    });

    it('readonly and private are checked by the compiler', () => {
      const laptop = new Product('PROD-1', 'Laptop', 1000);

      // @ts-expect-error — `id` is readonly
      laptop.id = 'PROD-2';

      // @ts-expect-error — `price` is private
      laptop.price = 0;

      expect(laptop.label()).toBe('Laptop (0 €)'); // 😱 …but only by the compiler: the assignment ran
    });

    it('😱 `private` is erased at runtime; `#field` (JavaScript private) is not', () => {
      class Account {
        private pin = '1234'; // TypeScript private: a compile-time convention
        #secret = 'abcd'; // JavaScript private: enforced by the runtime

        hasSecret(): boolean {
          return this.#secret.length > 0;
        }
      }
      const account = new Account();

      expect(JSON.stringify(account)).toBe('{"pin":"1234"}'); // the "private" pin leaks
      expect((account as any)['pin']).toBe('1234');
      expect(account.hasSecret()).toBe(true); // #secret is truly hidden
    });
  });

  describe('2. Interfaces: contracts that vanish at runtime', () => {
    interface Notifier {
      send(to: string, message: string): boolean;
    }

    interface Auditable {
      readonly history: string[];
    }

    // an interface can extend one or several others
    interface AuditedNotifier extends Notifier, Auditable {}

    // a class can implement several interfaces
    class EmailNotifier implements Notifier, Auditable {
      readonly history: string[] = [];
      send(to: string, message: string): boolean {
        this.history.push(`${to}: ${message}`);
        return true;
      }
    }

    it('`implements` makes the compiler check the class against the contract', () => {
      const notifier: AuditedNotifier = new EmailNotifier();
      notifier.send('alice@example.com', 'Your order has shipped');

      expect(notifier.history).toEqual(['alice@example.com: Your order has shipped']);
    });

    it('refuses a class that does not fulfil the contract', () => {
      // @ts-expect-error — `send` is missing
      class BrokenNotifier implements Notifier {}

      expect(new BrokenNotifier()).toBeDefined();
    });

    it('😱 no class is needed: any object of the right shape is a Notifier (structural, see A2)', () => {
      const silent: Notifier = { send: () => true };

      expect(silent.send('bob@example.com', 'hi')).toBe(true);
    });

    it('😱 an interface does not exist at runtime: no `instanceof Notifier`', () => {
      const notifier: unknown = new EmailNotifier();

      // @ts-expect-error — 'Notifier' only refers to a type, it has no runtime value
      expect(() => notifier instanceof Notifier).toThrow(ReferenceError);

      // to check at runtime, look at the shape (more in A4 with type predicates)
      expect(typeof notifier === 'object' && notifier !== null && 'send' in notifier).toBe(true);
    });
  });

  describe('3. Inheritance and polymorphism: extends, abstract, override', () => {
    abstract class PaymentMethod {
      abstract fees(amount: number): number; // no body: each subclass decides

      total(amount: number): number {
        return amount + this.fees(amount); // shared behaviour, written once
      }
    }

    class CreditCard extends PaymentMethod {
      fees(amount: number): number {
        return amount * 0.02;
      }
    }

    class BankTransfer extends PaymentMethod {
      fees(): number {
        return 1;
      }
    }

    class InternationalTransfer extends BankTransfer {
      constructor(readonly country: string) {
        super();
      }
      override fees(): number {
        return super.fees() + 4; // `override` + `super`: reuse the parent's version
      }
    }

    it('an abstract class cannot be instantiated', () => {
      // @ts-expect-error — PaymentMethod is abstract
      expect(() => new PaymentMethod()).not.toThrow(); // 😱 at runtime nothing stops it
    });

    it('polymorphism: one piece of code, the right method picked at runtime', () => {
      const methods: PaymentMethod[] = [new CreditCard(), new BankTransfer(), new InternationalTransfer('CA')];

      expect(methods.map((m) => m.total(100))).toEqual([102, 101, 105]);
    });

    it('a subclass is usable where the parent is expected, not the other way around', () => {
      const payment: BankTransfer = new InternationalTransfer('CA'); // ✓

      // @ts-expect-error — a BankTransfer has no `country`: it is not an InternationalTransfer
      const international: InternationalTransfer = new BankTransfer();

      expect(payment.total(100)).toBe(105);
      expect(international.country).toBeUndefined();
    });
  });

  describe('4. Interface or abstract class?', () => {
    // interface: a pure contract, no code, a class can implement many
    // abstract class: a partial implementation to share, single inheritance only
    interface Shippable {
      weightKg(): number;
    }

    class Book implements Shippable {
      constructor(private readonly pages: number) {}
      weightKg(): number {
        return this.pages * 0.002;
      }
    }

    it('prefer an interface by default; use an abstract class when there is code to share', () => {
      const parcel: Shippable[] = [new Book(500), { weightKg: () => 2 }];

      expect(parcel.reduce((sum, item) => sum + item.weightKg(), 0)).toBe(3);
    });
  });

  describe('5. 😱 Differences that surprise Java / C# developers', () => {
    it('two unrelated classes with the same shape are interchangeable', () => {
      class Euro {
        constructor(readonly amount: number) {}
      }
      class Dollar {
        constructor(readonly amount: number) {}
      }

      const price: Euro = new Dollar(10); // ✓ structural typing, even for classes

      expect(price).toBeInstanceOf(Dollar);
    });

    it('…unless they have a private member: then the class behaves nominally', () => {
      class Euro {
        private readonly currency = 'EUR';
        constructor(readonly amount: number) {}
      }
      class Dollar {
        private readonly currency = 'USD';
        constructor(readonly amount: number) {}
      }

      // @ts-expect-error — separate declarations of a private property
      const price: Euro = new Dollar(10);

      expect(price.amount).toBe(10);
    });

    it('a method loses its `this` when passed as a callback', () => {
      class Cart {
        items: string[] = [];
        add(item: string): void {
          this.items.push(item);
        }
        addArrow = (item: string): void => {
          this.items.push(item); // an arrow function captures `this` once and for all
        };
      }
      const cart = new Cart();

      expect(() => ['pen', 'book'].forEach(cart.add)).toThrow(TypeError); // `this` is undefined
      ['pen', 'book'].forEach(cart.addArrow); // ✓

      expect(cart.items).toEqual(['pen', 'book']);
    });

    it('no method overloading: one implementation, several signatures', () => {
      class PriceFormatter {
        format(amount: number): string;
        format(amount: number, currency: string): string;
        format(amount: number, currency = '€'): string {
          // the single implementation must handle every signature
          return `${amount.toFixed(2)} ${currency}`;
        }
      }
      const formatter = new PriceFormatter();

      expect(formatter.format(5)).toBe('5.00 €');
      expect(formatter.format(5, '$')).toBe('5.00 $');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A3.1 add a `PayPal` payment method (fees: 0.5 € + 3 %) and test `total(100)`');
    it.todo('🫵 A3.2 write an `SmsNotifier` that implements `Notifier` and refuses messages over 160 characters');
  });
});
