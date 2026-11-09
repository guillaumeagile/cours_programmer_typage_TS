/**
 * Chapter E — Section E1: Make illegal states unrepresentable   (~25 min)
 * Theory: ./README.md
 *
 * Goals
 *   - see how booleans and optional fields allow contradictory states
 *   - model each state with its own data: a discriminated union
 *   - let the compiler check that every state is handled (`never`)
 *   - encode the allowed transitions in function signatures
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

describe('E1. Make illegal states unrepresentable', () => {
  describe('1. The problem: flags and optional fields', () => {
    type OrderWithFlags = {
      id: string;
      isPaid: boolean;
      isShipped: boolean;
      isCancelled: boolean;
      trackingNumber?: string;
      cancelReason?: string;
    };

    it('😱 the type accepts orders that cannot exist', () => {
      // shipped but not paid, cancelled and shipped, shipped without tracking number…
      const nonsense: OrderWithFlags = {
        id: 'ORD-1',
        isPaid: false,
        isShipped: true,
        isCancelled: true,
      };

      // 3 booleans = 8 combinations, and only 4 of them make sense.
      expect(nonsense.isShipped && nonsense.isCancelled).toBe(true);
    });
  });

  describe('2. The fix: one type per state, with only the data of that state', () => {
    type Pending = { status: 'pending'; id: string };
    type Paid = { status: 'paid'; id: string; paidAt: Date };
    type Shipped = { status: 'shipped'; id: string; paidAt: Date; trackingNumber: string };
    type Cancelled = { status: 'cancelled'; id: string; reason: string };

    // `status` is the discriminant: a literal type that tells the cases apart.
    type Order = Pending | Paid | Shipped | Cancelled;

    it('a shipped order without tracking number cannot be written', () => {
      const ok: Order = { status: 'shipped', id: 'ORD-1', paidAt: new Date(), trackingNumber: 'TRK-1' };

      // @ts-expect-error — `trackingNumber` is missing for a shipped order
      const broken: Order = { status: 'shipped', id: 'ORD-2', paidAt: new Date() };

      expect(ok.status).toBe('shipped');
      expect(broken.status).toBe('shipped');
    });

    it('checking the discriminant narrows to the right case (see A4)', () => {
      function label(order: Order): string {
        switch (order.status) {
          case 'pending':
            return `${order.id}: waiting for payment`;
          case 'paid':
            return `${order.id}: paid on ${order.paidAt.toISOString().slice(0, 10)}`;
          case 'shipped':
            return `${order.id}: tracking ${order.trackingNumber}`; // only exists here
          case 'cancelled':
            return `${order.id}: cancelled (${order.reason})`;
        }
      }

      expect(label({ status: 'cancelled', id: 'ORD-3', reason: 'out of stock' })).toBe(
        'ORD-3: cancelled (out of stock)',
      );
    });

    it('`never` turns "I forgot a case" into a compile error', () => {
      // If a state is added to Order (say 'refunded'), `order` is no longer `never` in the
      // default branch, and this line stops compiling: the compiler lists the places to update.
      function assertNever(value: never): never {
        throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
      }

      function isActive(order: Order): boolean {
        switch (order.status) {
          case 'pending':
          case 'paid':
          case 'shipped':
            return true;
          case 'cancelled':
            return false;
          default:
            return assertNever(order);
        }
      }

      function isActiveIncomplete(order: Order): boolean {
        switch (order.status) {
          case 'pending':
          case 'paid':
            return true;
          case 'cancelled':
            return false;
          default:
            // @ts-expect-error — 'shipped' is not handled, so `order` is not `never` here
            return assertNever(order);
        }
      }

      expect(isActive({ status: 'pending', id: 'ORD-4' })).toBe(true);
      expect(() =>
        isActiveIncomplete({ status: 'shipped', id: 'ORD-5', paidAt: new Date(), trackingNumber: 'T' }),
      ).toThrow('Unhandled case');
    });
  });

  describe('3. Transitions in the signatures: only legal moves compile', () => {
    type Pending = { status: 'pending'; id: string };
    type Paid = { status: 'paid'; id: string; paidAt: Date };
    type Shipped = { status: 'shipped'; id: string; paidAt: Date; trackingNumber: string };

    const pay = (order: Pending, at: Date): Paid => ({ status: 'paid', id: order.id, paidAt: at });
    const ship = (order: Paid, trackingNumber: string): Shipped => ({ ...order, status: 'shipped', trackingNumber });

    it('the happy path compiles', () => {
      const pending: Pending = { status: 'pending', id: 'ORD-1' };

      const shipped = ship(pay(pending, new Date('2026-11-08')), 'TRK-42');

      expect(shipped.trackingNumber).toBe('TRK-42');
    });

    it('shipping an unpaid order does not compile: no test needed to catch it', () => {
      const pending: Pending = { status: 'pending', id: 'ORD-1' };

      // @ts-expect-error — ship() needs a Paid order
      ship(pending, 'TRK-42');
    });
  });

  describe('🫵 Exercises', () => {
    it.todo("🫵 E1.1 add a 'refunded' state (with `refundedAt`) to Order: follow the compiler errors to update `label` and `isActive`");
    it.todo('🫵 E1.2 model a `Payment` as Pending | Authorized | Captured | Failed(reason), and write `capture(p: Authorized): Captured`');
  });
});
