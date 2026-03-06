// Domain Model: E-Commerce System
// Entities: Product, Order, OrderItem
// Relationships: Order contains OrderItems, OrderItem references Product

describe('Chapter A Section 02: Classes and Inheritance as Types', () => {
  describe('1. Classes as Types', () => {
    it('should use classes to define types and group behavior', () => {
      class Product {  //data class,  record
        constructor(readonly id: string, readonly name: string, readonly price: number) {}
        getDisplayName(): string {
          return `${this.name} ($${this.price})`;
        }
      }
    // lombok Java
      const product: Product = new Product('PROD-1', 'Laptop', 999.99);
      expect(product.id).toBe('PROD-1');
    //  product.name = "dlodldl"  //immutable by default
      expect(product.getDisplayName()).toBe('Laptop ($999.99)');
      expect(product instanceof Product).toBe(true);
    });
  });

  describe('2. Inheritance and Type Hierarchies', () => {
    it('should create inheritance hierarchies with abstract classes', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      //let orderStatus = new OrderStatus('Pending')

      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Awaiting payment'; }
      }

      class ShippedStatus extends OrderStatus {
        getDescription(): string { return 'In transit'; }
      }

      // Subtype can be assigned to parent type
      const status: OrderStatus = new ShippedStatus('Shipped');
      expect(status.getDescription()).toBe('In transit');
      expect(status.name).toBe('Shipped');
    });

    it('should support method overriding and super calls', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        describe(): string { return `Status: ${this.name}`; }
      }

      class ShippedStatus extends OrderStatus {
        describe(): string {
          return super.describe() + ' (In Transit)';
        }
      }

      const status = new ShippedStatus('Shipped');
      expect(status.describe()).toBe('Status: Shipped (In Transit)');
    });
  });

  describe('3. Liskov Substitution Principle', () => {
    it('should allow subtypes to be used where parent types are expected', () => {
      abstract class PaymentProcessor {
        abstract process(amount: number): boolean;
      }

      class CreditCardProcessor extends PaymentProcessor {
        process(amount: number): boolean { return amount > 0 && amount < 10000; }
      }

      class PayPalProcessor extends PaymentProcessor {
        process(amount: number): boolean { return amount > 0; }
      }

      function chargeOrder(processor: PaymentProcessor, amount: number): boolean {
        return processor.process(amount);
      }

      expect(chargeOrder(new CreditCardProcessor(), 100)).toBe(true);
      expect(chargeOrder(new PayPalProcessor(), 100)).toBe(true);
      expect(chargeOrder(new CreditCardProcessor(), 20000)).toBe(false);
    });
  });

  describe('4. Type Narrowing with instanceof', () => {
    it('should narrow types with instanceof to access subtype properties', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
      }

      class ShippedStatus extends OrderStatus {
        getTrackingNumber(): string { return 'TRACK-123'; }
      }

      class PendingStatus extends OrderStatus {}

      function getShippingInfo(status: OrderStatus): string {
        if (status instanceof ShippedStatus) {
          return `Tracking: ${status.getTrackingNumber()}`;
        }
        return 'Not shipped yet';
      }

      expect(getShippingInfo(new ShippedStatus('Shipped'))).toBe('Tracking: TRACK-123');
      expect(getShippingInfo(new PendingStatus('Pending'))).toBe('Not shipped yet');
    });
  });

  describe('5. Type Assertions (Casts)', () => {
    it('should use as to cast types when you know better than TypeScript', () => {
      const value: unknown = 'PROD-001';
      const productId: string = value as string;
      expect(productId).toBe('PROD-001');
    });

    it('should use as const for literal types', () => {
      const status = 'pending' as const;
      expect(status).toBe('pending');
    });
  });

  describe('6. Type Predicates', () => {
    it('should use type predicates to safely narrow types', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
      }

      class ShippedStatus extends OrderStatus {
        trackingNumber: string = 'TRACK-123';
      }

      function isShipped(status: OrderStatus): status is ShippedStatus {
        return status instanceof ShippedStatus;
      }

      const shipped = new ShippedStatus('Shipped');

      if (isShipped(shipped)) {
        expect(shipped.trackingNumber).toBe('TRACK-123');
      }
    });
  });

  describe('7. Abstract Classes', () => {
    it('should define abstract classes with abstract and concrete methods', () => {
      abstract class OrderProcessor {
        constructor(readonly name: string) {}
        abstract process(orderId: string): boolean;
        describe(): string {
          return `${this.name} processor`;
        }
      }

      class StandardProcessor extends OrderProcessor {
        process(orderId: string): boolean {
          return orderId.length > 0;
        }
      }

      const processor: OrderProcessor = new StandardProcessor('Standard');
      expect(processor.process('ORD-001')).toBe(true);
      expect(processor.describe()).toBe('Standard processor');
    });
  });

  describe('8. Polymorphism', () => {
    it('should use polymorphism to write generic code that works with any subtype', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Awaiting payment'; }
      }

      class ShippedStatus extends OrderStatus {
        getDescription(): string { return 'In transit'; }
      }

      function statusReport(statuses: OrderStatus[]): string[] {
        return statuses.map(status => `${status.name}: ${status.getDescription()}`);
      }

      const report = statusReport([
        new PendingStatus('Pending'),
        new ShippedStatus('Shipped')
      ]);

      expect(report).toEqual([
        'Pending: Awaiting payment',
        'Shipped: In transit'
      ]);
    });
  });

  describe('9. Classes vs. Interfaces', () => {
    it('should understand that classes create instances while interfaces define contracts', () => {
      interface OrderStatus {
        name: string;
        getDescription(): string;
      }

      class ShippedStatus implements OrderStatus {
        constructor(readonly name: string) {}
        getDescription(): string { return 'In transit'; }
      }

      const status: OrderStatus = new ShippedStatus('Shipped');
      expect(status.getDescription()).toBe('In transit');
      expect(status instanceof ShippedStatus).toBe(true);
   //   expect(status instanceof OrderStatus).toBe(true);
    });
  });

  describe('10. Duck Typing: Structural vs. Nominal', () => {
    it('should use structural typing - shape matters, not name', () => {
      interface Logger {
        log(message: string): void;
      }

      // This class doesn't explicitly implement Logger
      class ConsoleLogger {
        log(message: string) { /* log */ }
      }

      // But it's assignable to Logger because it has the same shape
      const logger: Logger = new ConsoleLogger();
      expect(logger).toBeDefined();
    });

    it('should show the problem of accidental compatibility', () => {
      type UserId = string;
      type Email = string;

      const userId: UserId = 'user123';
      const email: Email = userId; // ✓ Works but semantically wrong!

      expect(email).toBe('user123');
    });

    it('should use branded types to prevent accidental mixing', () => {
      type UserId = string & { readonly __brand: 'UserId' };
      type Email = string & { readonly __brand: 'Email' };

      function createUserId(value: string): UserId {
        return value as UserId;
      }

      function createEmail(value: string): Email {
        return value as Email;
      }

      const userId = createUserId('user123');
      const email = createEmail('alice@example.com');

      expect(userId).toBe('user123');
      expect(email).toBe('alice@example.com');
    });
  });

  describe('11. Checkpoint 🫵', () => {
    it('A2.1: Explain why classes are types', () => {
      // Write your answer:
      // Classes are types because they:
      // 1. Define a set of valid values (instances)
      // 2. Define a set of valid operations (methods)
      // 3. Define a contract that instances must fulfill
      // 4. Can be used in type annotations
      // 5. Can be checked with instanceof

      expect(true).toBe(true);
    });

    it('A2.2: Design an inheritance hierarchy for vehicles', () => {
      // Write your implementation:
      abstract class Vehicle {
        constructor(readonly brand: string, readonly year: number) {}
        abstract getMaxSpeed(): number;
      }

      class Car extends Vehicle {
        getMaxSpeed(): number { return 200; }
      }

      class Truck extends Vehicle {
        getMaxSpeed(): number { return 150; }
      }

      class Motorcycle extends Vehicle {
        getMaxSpeed(): number { return 250; }
      }

      const vehicles: Vehicle[] = [
        new Car('Toyota', 2020),
        new Truck('Volvo', 2019),
        new Motorcycle('Harley', 2021)
      ];

      expect(vehicles).toHaveLength(3);
      expect(vehicles[0].getMaxSpeed()).toBe(200);
    });

    it('A2.3: Identify when to use casts vs. type guards', () => {
      // Casts (as):
      // - Use when you have information TypeScript doesn't
      // - Use with DOM elements
      // - Use rarely - they bypass type safety
      //
      // Type Guards (instanceof, type predicates):
      // - Use to narrow types safely
      // - Use in conditional logic
      // - Preferred over casts

      class User {
        constructor(readonly name: string) {}
      }

      function isUser(value: unknown): value is User {
        return value instanceof User;
      }

      const user = new User('Alice');
      if (isUser(user)) {
        expect(user.name).toBe('Alice');
      }
    });

    it('A2.4: Implement polymorphism with abstract classes', () => {
      // Write your implementation:
      abstract class Shape {
        abstract getArea(): number;
        abstract getPerimeter(): number;
      }

      class Circle extends Shape {
        constructor(readonly radius: number) { super(); }
        getArea(): number { return Math.PI * this.radius * this.radius; }
        getPerimeter(): number { return 2 * Math.PI * this.radius; }
      }

      class Square extends Shape {
        constructor(readonly side: number) { super(); }
        getArea(): number { return this.side * this.side; }
        getPerimeter(): number { return 4 * this.side; }
      }

      function describeShape(shape: Shape): string {
        return `Area: ${shape.getArea().toFixed(2)}, Perimeter: ${shape.getPerimeter().toFixed(2)}`;
      }

      const circle = new Circle(5);
      const square = new Square(4);

      expect(describeShape(circle)).toContain('78.54');
      expect(describeShape(square)).toContain('16.00');
    });

    it('A2.5: Explain structural vs. nominal typing', () => {
      // Structural Typing (TypeScript):
      // - Types are determined by shape
      // - Any object with the right shape works
      // - No explicit implements needed
      // - Flexible but can cause accidental compatibility
      //
      // Nominal Typing (Java, C#):
      // - Types are determined by name
      // - Must explicitly implement interface
      // - More explicit but requires more boilerplate
      // - Prevents accidental type mixing

      interface Logger {
        log(msg: string): void;
      }

      // Works without explicit implements (structural)
      class ConsoleLogger {
        log(msg: string) { /* log */ }
      }

      const logger: Logger = new ConsoleLogger();
      expect(logger).toBeDefined();
    });

    it('A2.6: Use branded types to prevent accidental mixing', () => {
      // Branded types add nominal-like safety to structural typing
      type UserId = string & { readonly __brand: 'UserId' };
      type Email = string & { readonly __brand: 'Email' };

      function createUserId(value: string): UserId {
        return value as UserId;
      }

      function createEmail(value: string): Email {
        return value as Email;
      }

      const userId = createUserId('123');
      const email = createEmail('alice@example.com');

      // Prevents accidental mixing
      expect(userId).toBe('123');
      expect(email).toBe('alice@example.com');
    });
  });
});
