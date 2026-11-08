/**
 * Chapter A — Section A4: Classes & inheritance
 * Theory: ./README.md#a4-classes--inheritance
 *
 * Goals
 *   - use a class as a type
 *   - build a hierarchy with `extends` and `abstract`
 *   - write polymorphic code against the parent type
 *   - make a class respect an interface with `implements`
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('A4. Classes & inheritance', () => {
  describe('1. A class is a type (and a runtime value)', () => {
    class Product {
      // `readonly` parameters declare and assign the properties in one go
      constructor(
        readonly id: string,
        readonly name: string,
        readonly price: number,
      ) {}

      label(): string {
        return `${this.name} (${this.price} €)`;
      }
    }

    it('groups data and behaviour', () => {
      const laptop: Product = new Product('PROD-1', 'Laptop', 999);

      expect(laptop.label()).toBe('Laptop (999 €)');

      // @ts-expect-error — properties are readonly
      laptop.price = 1;
    });

    it('still exists at runtime, unlike type and interface', () => {
      const laptop = new Product('PROD-1', 'Laptop', 999);
      expect(laptop).toBeInstanceOf(Product); // impossible with an interface
    });
  });

  describe('2. Inheritance: extends', () => {
    class Order {
      constructor(readonly id: string) {}
      describe(): string {
        return `Order ${this.id}`;
      }
    }

    class ShippedOrder extends Order {
      constructor(
        id: string,
        readonly trackingNumber: string,
      ) {
        super(id); // the parent constructor must be called first
      }

      describe(): string {
        return `${super.describe()} – tracking ${this.trackingNumber}`; // override + reuse
      }
    }

    it('a subclass can be used where the parent is expected', () => {
      const order: Order = new ShippedOrder('ORD-1', 'TRK-42'); // ✓ a ShippedOrder IS an Order
      expect(order.describe()).toBe('Order ORD-1 – tracking TRK-42');
    });

    it('but not the other way around', () => {
      // @ts-expect-error — an Order is not necessarily shipped
      const shipped: ShippedOrder = new Order('ORD-2');

      expect(shipped.trackingNumber).toBeUndefined();
    });
  });

  describe('3. Abstract classes and polymorphism', () => {
    abstract class PaymentMethod {
      abstract fees(amount: number): number; // no body: each subclass decides

      total(amount: number): number {
        // shared behaviour, written once
        return amount + this.fees(amount);
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

    it('cannot be instantiated', () => {
      // @ts-expect-error — PaymentMethod is abstract
      expect(() => new PaymentMethod()).not.toThrow(); // 😱 at runtime nothing stops it
    });

    it('lets one piece of code work with every subclass', () => {
      const methods: PaymentMethod[] = [new CreditCard(), new BankTransfer()];

      const totals = methods.map((m) => m.total(100)); // the right fees() is picked at runtime

      expect(totals).toEqual([102, 101]);
    });
  });

  describe('4. implements: a class promises to respect a contract', () => {
    interface Notifier {
      send(to: string, message: string): boolean;
    }

    class EmailNotifier implements Notifier {
      sent: string[] = [];
      send(to: string, message: string): boolean {
        this.sent.push(`${to}: ${message}`);
        return true;
      }
    }

    it('the compiler checks the class against the interface', () => {
      const notifier: Notifier = new EmailNotifier();
      expect(notifier.send('alice@example.com', 'Your order has shipped')).toBe(true);
    });

    it('refuses a class that does not fulfil the contract', () => {
      // @ts-expect-error — `send` is missing
      class BrokenNotifier implements Notifier {}

      expect(new BrokenNotifier()).toBeDefined();
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A4.1 add a `PayPal` payment method (fees: 0.5 € + 3 %) and test `total(100)`');
    it.todo('🫵 A4.2 add a `DeliveredOrder extends ShippedOrder` with a delivery date; override describe()');
    it.todo('🫵 A4.3 write an `SmsNotifier` that implements `Notifier` and refuses messages over 160 characters');
  });
});
