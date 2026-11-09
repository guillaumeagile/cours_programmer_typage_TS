/**
 * Chapter A — Section A4: Narrowing   (~15 min)
 * Theory: ./README.md#a4-narrowing
 *
 * Goals
 *   - narrow a broad type with typeof, instanceof and `in`
 *   - write a reusable type predicate (`value is T`)
 *   - understand why a cast (`as`) is dangerous
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

class Order {
  constructor(readonly id: string) {}
}

class ShippedOrder extends Order {
  constructor(
    id: string,
    readonly trackingNumber: string,
  ) {
    super(id);
  }
}

describe('A4. Narrowing', () => {
  describe('1. typeof for primitive types', () => {
    function formatPriceUnsafe(price: number | string): string {
      // @ts-expect-error — toFixed() does not exist on string, so not on number | string
      return price.toFixed(2);
    }

    function formatPrice(price: number | string): string {
      if (typeof price === 'number') {
        return price.toFixed(2); // here TypeScript knows: number
      }
      return price; // and here: string
    }

    it('without narrowing, the string case crashes', () => {
      expect(() => formatPriceUnsafe('free')).toThrow(TypeError);
    });

    it('lets you use the methods of each case', () => {
      expect(formatPrice(9.5)).toBe('9.50');
      expect(formatPrice('free')).toBe('free');
    });
  });

  describe('2. instanceof for classes', () => {
    function shippingInfo(order: Order): string {
      if (order instanceof ShippedOrder) {
        return `Tracking: ${order.trackingNumber}`; // narrowed to ShippedOrder
      }
      return 'Not shipped yet';
    }

    it('gives access to the subclass members', () => {
      expect(shippingInfo(new ShippedOrder('ORD-1', 'TRK-42'))).toBe('Tracking: TRK-42');
      expect(shippingInfo(new Order('ORD-2'))).toBe('Not shipped yet');
    });
  });

  describe('3. `in` for plain objects', () => {
    type CardPayment = { cardNumber: string };
    type CashPayment = { amountGiven: number };

    function describePayment(payment: CardPayment | CashPayment): string {
      if ('cardNumber' in payment) {
        return `Card ending ${payment.cardNumber.slice(-4)}`;
      }
      return `Cash: ${payment.amountGiven} €`;
    }

    it('narrows on the presence of a property', () => {
      expect(describePayment({ cardNumber: '4111111111111111' })).toBe('Card ending 1111');
      expect(describePayment({ amountGiven: 20 })).toBe('Cash: 20 €');
    });
  });

  describe('4. Type predicates: your own reusable check', () => {
    // `order is ShippedOrder` tells the compiler what `true` means
    function isShipped(order: Order): order is ShippedOrder {
      return order instanceof ShippedOrder;
    }

    it('narrows wherever it is used', () => {
      const orders: Order[] = [new Order('ORD-1'), new ShippedOrder('ORD-2', 'TRK-42')];

      const shipped = orders.filter(isShipped); // ShippedOrder[], not Order[]

      expect(shipped.map((o) => o.trackingNumber)).toEqual(['TRK-42']);
    });
  });

  describe('5. Casts (as): "trust me, compiler"', () => {
    it('😱 a wrong cast compiles and fails later', () => {
      const order: Order = new Order('ORD-1');

      const shipped = order as ShippedOrder; // no check at all

      expect(shipped.trackingNumber).toBeUndefined(); // the compiler said string…
      expect(() => shipped.trackingNumber.toUpperCase()).toThrow(TypeError);
    });

    it('prefer narrowing: the error case is handled explicitly', () => {
      const order: Order = new Order('ORD-1');

      const tracking = order instanceof ShippedOrder ? order.trackingNumber : 'none';

      expect(tracking).toBe('none');
    });

    it('unknown forces you to check before use (safer than any)', () => {
      const fromApi: unknown = JSON.parse('{"id":"ORD-1"}');

      // @ts-expect-error — cannot use an unknown value without checking it
      fromApi.id;

      if (typeof fromApi === 'object' && fromApi !== null && 'id' in fromApi) {
        expect(fromApi.id).toBe('ORD-1');
      }
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 A4.1 write `parseQuantity(input: string | number): number` that also accepts "3"');
    it.todo('🫵 A4.2 write `isCardPayment(p): p is CardPayment` and use it with Array.filter');
  });
});
