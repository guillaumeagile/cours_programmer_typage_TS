import { Order } from './domain/order';
import { OrderStatus, PendingStatus, ShippedStatus, DeliveredStatus } from './domain/order-status';
import { PaymentProcessor, CreditCardProcessor, PayPalProcessor } from './domain/payment-processor';
import { Product, PhysicalProduct, DigitalProduct } from './domain/product';
import { Notifier, EmailNotifier, SMSNotifier } from './domain/notifier';

// Domain Model: E-Commerce Order System
// This chapter demonstrates type importation, reuse, and clean object hierarchies
// Types are defined in separate files and imported where needed

describe("Chapter A': Type Importation and Reuse", () => {
  describe('1. Importing and Using Types from Separate Files', () => {
    it('should import types that are defined in other files', () => {
      // OrderStatus interface and implementations are defined in domain/order-status.ts
      // Type is inferred from the constructor call
      const status = new PendingStatus('Pending');

      expect(status.name).toBe('Pending');
      expect(status.getDescription()).toBe('Awaiting payment');
    });

    it('should allow multiple implementations of the same interface', () => {
      // All these classes implement OrderStatus from domain/order-status.ts
      // Array type is explicitly annotated for clarity
      const statuses: OrderStatus[] = [
        new PendingStatus('Pending'),
        new ShippedStatus('Shipped'),
        new DeliveredStatus('Delivered')
      ];

      expect(statuses).toHaveLength(3);
      expect(statuses[0].getDescription()).toBe('Awaiting payment');
      expect(statuses[1].getDescription()).toBe('In transit');
      expect(statuses[2].getDescription()).toBe('Delivered');
    });
  });

  describe('2. Separation of Abstraction and Implementation', () => {
    it('should separate interface (what) from class (how)', () => {
      // PaymentProcessor interface is defined in domain/payment-processor.ts
      // CreditCardProcessor and PayPalProcessor are separate implementations

      function processOrderPayment(processor: PaymentProcessor, amount: number): string {
        if (processor.process(amount)) {
          return `Payment processed via ${processor.getProviderName()}`;
        }
        return 'Payment failed';
      }

      expect(processOrderPayment(new CreditCardProcessor(), 100)).toBe('Payment processed via Credit Card');
      expect(processOrderPayment(new PayPalProcessor(), 100)).toBe('Payment processed via PayPal');
      expect(processOrderPayment(new CreditCardProcessor(), 20000)).toBe('Payment failed');
    });

    it('should allow swapping implementations without changing code', () => {
      // This function works with ANY PaymentProcessor implementation
      function chargeOrder(processor: PaymentProcessor, amount: number): boolean {
        return processor.process(amount);
      }

      // Easy to swap implementations - they're defined in separate files
      const creditCard: PaymentProcessor = new CreditCardProcessor();
      const paypal: PaymentProcessor = new PayPalProcessor();

      expect(chargeOrder(creditCard, 100)).toBe(true);
      expect(chargeOrder(paypal, 100)).toBe(true);
    });
  });

  describe('3. Composing Types from Different Modules', () => {
    it('should compose types from different files', () => {
      // Order class (from domain/order.ts) uses OrderStatus and PaymentProcessor
      // Type is inferred from constructor
      const order = new Order('ORD-001', new PendingStatus('Pending'));

      expect(order.orderId).toBe('ORD-001');
      expect(order.getStatus().getDescription()).toBe('Awaiting payment');
    });

    it('should update composed types', () => {
      // Type inferred from constructor
      const order = new Order('ORD-001', new PendingStatus('Pending'));

      expect(order.getStatus().getDescription()).toBe('Awaiting payment');

      order.updateStatus(new ShippedStatus('Shipped'));
      expect(order.getStatus().getDescription()).toBe('In transit');
    });

    it('should use multiple abstractions together', () => {
      // Types inferred from constructors
      const order = new Order('ORD-001', new PendingStatus('Pending'));
      const processor = new CreditCardProcessor();

      // Order uses both OrderStatus and PaymentProcessor
      expect(order.chargePayment(processor, 100)).toBe(true);
      expect(order.chargePayment(processor, 20000)).toBe(false);
    });
  });

  describe('4. Reusing Types Across Multiple Modules', () => {
    it('should use Product interface in different contexts', () => {
      // Product interface is defined in domain/product.ts
      // Can be used anywhere we need to work with products
      // Array type explicitly annotated for clarity

      const products: Product[] = [
        new PhysicalProduct('PROD-1', 'Laptop', 999.99),
        new DigitalProduct('PROD-2', 'eBook', 9.99)
      ];

      expect(products).toHaveLength(2);
     // expect(products[0].getPrice()).toBe(999.99); // fails because DigitalProduct  have a overriden getPrice method (TRANSPORT_FEES_RATE are added)
      expect(products[1].getPrice()).toBe(9.99);
    });

    it('should use Notifier interface in different contexts', () => {
      // Notifier interface is defined in domain/notifier.ts
      // Can be used anywhere we need to send notifications
      // Array type explicitly annotated for clarity

      const notifiers: Notifier[] = [
        new EmailNotifier(),
        new SMSNotifier()
      ];

      // All notifiers implement the same interface
      notifiers.forEach(notifier => {
        notifier.notify('Order confirmed');
      });

      expect(notifiers).toHaveLength(2);
    });
  });

  describe('5. Benefits of Type Importation and Reuse', () => {
    it('should enable code reuse across the codebase', () => {
      // OrderStatus is defined once in domain/order-status.ts
      // But can be used in many places

      function getStatusInfo(status: OrderStatus): string {
        return `${status.name}: ${status.getDescription()}`;
      }

      function validateStatus(status: OrderStatus): boolean {
        return status.name.length > 0;
      }

      // Type inferred from constructor
      const status = new PendingStatus('Pending');

      expect(getStatusInfo(status)).toBe('Pending: Awaiting payment');
      expect(validateStatus(status)).toBe(true);
    });

    it('should make it easy to add new implementations', () => {
      // All these implementations use the same OrderStatus interface
      // Adding a new status type is easy - just create a new class

      class CancelledStatus implements OrderStatus {
        constructor(readonly name: string) {}
        getDescription(): string { return 'Order cancelled'; }
      }

      // Array type explicitly annotated for clarity
      const statuses: OrderStatus[] = [
        new PendingStatus('Pending'),
        new ShippedStatus('Shipped'),
        new DeliveredStatus('Delivered'),
        new CancelledStatus('Cancelled')
      ];

      expect(statuses).toHaveLength(4);
      expect(statuses[3].getDescription()).toBe('Order cancelled');
    });
  });

  describe('6. Checkpoint 🫵', () => {
    it("A'.1: Use imported types from different modules", () => {
      // All these types are imported from domain/ files
      const order = new Order('ORD-001', new PendingStatus('Pending'));
      const processor = new CreditCardProcessor();

      expect(order.orderId).toBe('ORD-001');
      expect(order.chargePayment(processor, 100)).toBe(true);
    });

    it("A'.2: Compose multiple imported types", () => {
      // Compose Order (from domain/order.ts) with:
      // - OrderStatus (from domain/order-status.ts)
      // - PaymentProcessor (from domain/payment-processor.ts)

      const order = new Order('ORD-001', new PendingStatus('Pending'));

      order.updateStatus(new ShippedStatus('Shipped'));
      expect(order.getStatus().getDescription()).toBe('In transit');

      const paypal = new PayPalProcessor();
      expect(order.chargePayment(paypal, 100)).toBe(true);
    });

    it("A'.3: Create new implementations of imported interfaces", () => {
      // Create a new OrderStatus implementation
      class RefundedStatus implements OrderStatus {
        constructor(readonly name: string) {}
        getDescription(): string { return 'Refund processed'; }
      }

      // Use it with the imported Order class
      const order = new Order('ORD-001', new RefundedStatus('Refunded'));

      expect(order.getStatus().getDescription()).toBe('Refund processed');
    });
  });
});
