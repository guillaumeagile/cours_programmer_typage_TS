# Chapter A': Type Importation and Reuse

## Overview

In this chapter, we learn how to **organize types across files** and build a **clean object hierarchy** with clear separation between abstraction (interfaces) and implementation (classes).

This is where we transition from isolated examples to real-world code organization.

## Learning Outcomes

After this chapter, you should understand:

- **Type Importation** - How to export and import types across files
- **Separation of Concerns** - Interfaces define contracts, classes implement them
- **Object Hierarchies** - Building inheritance chains with clear responsibilities
- **Module Organization** - Organizing related types in logical modules
- **Reusability** - Creating types that can be reused across your codebase

## Key Concepts

### 1. Type Importation and Reuse

Types (interfaces, classes, type aliases) can be defined once and reused everywhere:

```typescript
// types/order.ts
export interface OrderStatus {
  name: string;
  getDescription(): string;
}

// domain/order-status.ts
import { OrderStatus } from '../types/order';

export class PendingStatus implements OrderStatus {
  constructor(readonly name: string) {}
  getDescription(): string { return 'Awaiting payment'; }
}
```

### 2. Abstraction vs. Implementation

**Interfaces** define what something does (the contract).
**Classes** define how it does it (the implementation).

```typescript
// Abstraction (interface)
interface PaymentProcessor {
  process(amount: number): boolean;
}

// Implementation (class)
class CreditCardProcessor implements PaymentProcessor {
  process(amount: number): boolean {
    return amount > 0 && amount < 10000;
  }
}
```

### 3. Object Hierarchies

Build inheritance chains where each level adds responsibility:

```typescript
// Base abstraction
abstract class OrderStatus {
  constructor(readonly name: string) {}
  abstract getDescription(): string;
}

// Intermediate abstraction
abstract class ShippableStatus extends OrderStatus {
  abstract getTrackingNumber(): string;
}

// Concrete implementation
class ShippedStatus extends ShippableStatus {
  getDescription(): string { return 'In transit'; }
  getTrackingNumber(): string { return 'TRACK-123'; }
}
```

### 4. Module Organization

Organize your types logically:

```
domain/
  ├── order/
  │   ├── order.ts          (Order class)
  │   ├── order-status.ts   (OrderStatus hierarchy)
  │   └── order-processor.ts (OrderProcessor interface)
  ├── product/
  │   └── product.ts        (Product class)
  └── payment/
      └── payment-processor.ts (PaymentProcessor interface)
```



## Practical Example

The working examples demonstrate:

1. **Importing types** from separate domain files
2. **Using interfaces** as contracts (OrderStatus, PaymentProcessor, Product, Notifier)
3. **Multiple implementations** of the same interface
4. **Composing types** - Order uses OrderStatus and PaymentProcessor
5. **Separating abstraction from implementation** - interfaces in one place, classes in another
6. **Reusing types** - same interface can be used in multiple contexts

## Key Takeaways

- **Export types** so they can be reused across your codebase
- **Use interfaces** to define contracts that multiple implementations can satisfy
- **Use abstract classes** to define partial implementations that subclasses extend
- **Use concrete classes** to provide full implementations
- **Organize by domain** - group related types together
- **Keep hierarchies shallow** - avoid deep inheritance chains
- **Prefer composition** - use interfaces and dependency injection over inheritance

---

**Next: [Working Examples](./01-type-reuse.test.ts)**
