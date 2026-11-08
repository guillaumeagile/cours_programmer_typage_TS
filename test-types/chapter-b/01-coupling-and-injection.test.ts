/**
 * Chapter B — Section B1: Coupling and dependency injection   (~20 min)
 * Theory: ./README.md#b1-coupling-and-dependency-injection
 *
 * Goals
 *   - spot a hidden dependency (a `new` or a global inside a class)
 *   - depend on an interface (a contract) instead of a concrete class
 *   - inject the dependency through the constructor, and replace it by a fake in tests
 *
 * Markers: `@ts-expect-error` = deliberate type error (delete it to see the message),
 *          😱 = trap, 🫵 = exercise.
 */

type Order = { id: string; total: number };

describe('B1. Coupling and dependency injection', () => {
  describe('1. The problem: a hidden, concrete dependency', () => {
    class SmtpMailer {
      send(to: string, body: string): void {
        throw new Error(`No SMTP server in tests (mail to ${to}: ${body})`);
      }
    }

    class OrderService {
      private mailer = new SmtpMailer(); // 😱 hard-coded: the caller cannot change it

      confirm(order: Order, customerEmail: string): string {
        this.mailer.send(customerEmail, `Order ${order.id} confirmed`);
        return 'confirmed';
      }
    }

    it('😱 cannot be tested without a real mail server', () => {
      const service = new OrderService();

      expect(() => service.confirm({ id: 'ORD-1', total: 50 }, 'alice@example.com')).toThrow(
        'No SMTP server',
      );
    });
  });

  describe('2. The fix: depend on a contract, inject it', () => {
    // The contract: what OrderService needs, nothing more.
    interface Mailer {
      send(to: string, body: string): void;
    }

    class OrderService {
      constructor(private readonly mailer: Mailer) {} // the dependency is now visible

      confirm(order: Order, customerEmail: string): string {
        this.mailer.send(customerEmail, `Order ${order.id} confirmed`);
        return 'confirmed';
      }
    }

    // A fake: a tiny implementation written for the tests
    class FakeMailer implements Mailer {
      sent: { to: string; body: string }[] = [];
      send(to: string, body: string): void {
        this.sent.push({ to, body });
      }
    }

    it('can be tested with a fake', () => {
      const mailer = new FakeMailer();
      const service = new OrderService(mailer);

      service.confirm({ id: 'ORD-1', total: 50 }, 'alice@example.com');

      expect(mailer.sent).toEqual([{ to: 'alice@example.com', body: 'Order ORD-1 confirmed' }]);
    });

    it('the compiler checks that whatever you inject fulfils the contract', () => {
      const brokenMailer = { sendEmail: (_to: string) => {} }; // wrong method name

      // @ts-expect-error — { sendEmail } is not a Mailer
      const service = new OrderService(brokenMailer);

      expect(service).toBeInstanceOf(OrderService);
    });

    it('any object of the right shape is accepted (structural typing, see A2)', () => {
      const bodies: string[] = [];

      const service = new OrderService({ send: (_to, body) => bodies.push(body) });
      service.confirm({ id: 'ORD-2', total: 10 }, 'bob@example.com');

      expect(bodies).toEqual(['Order ORD-2 confirmed']);
    });
  });

  describe('3. Hidden dependencies are not only objects: time, randomness, globals', () => {
    function isLateUnsafe(order: { dueDate: Date }): boolean {
      return new Date() > order.dueDate; // 😱 the result depends on when the test runs
    }

    function isLate(order: { dueDate: Date }, now: Date): boolean {
      return now > order.dueDate; // ✓ "now" is an explicit input
    }

    it('make them parameters, and the code becomes deterministic', () => {
      const order = { dueDate: new Date('2026-01-10') };

      expect(isLateUnsafe(order)).toBe(true); // true today… but what about a test written in 2025?
      expect(isLate(order, new Date('2026-01-09'))).toBe(false);
      expect(isLate(order, new Date('2026-01-11'))).toBe(true);
    });
  });

  describe('🫵 Exercises', () => {
    it.todo('🫵 B1.1 `PriceService` calls `new ExchangeRateApi().rate("EUR","USD")`: extract an `ExchangeRates` interface, inject it, test with a fake');
    it.todo('🫵 B1.2 which dependency of your own code would you inject first, and why?');
  });
});
