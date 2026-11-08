import { describe, it, expect } from 'vitest';

/**
 * Going further (after Chapter B): Internal State Coupling (VITEST VERSION)
 * 
 * This test file demonstrates:
 * 1. How functions become coupled to internal state
 * 2. Temporal coupling through state dependencies
 * 3. How to reduce coupling through pure functions and immutability
 * 
 * NOTE: This is the VITEST version. Compare with internal-state-coupling.test.ts (Jest version)
 * Both work identically - the only difference is the import statement.
 */

// ============================================================================
// PART 1: STATE COUPLING IN CLASSES
// ============================================================================

describe('Part 1: State Coupling in Classes', () => {
  /**
   * ❌ TIGHTLY COUPLED: increment() is coupled to the 'count' field
   * 
   * Problems:
   * - increment() can't work without the count field
   * - If we rename 'count' to 'value', increment() breaks
   * - increment() has side effects (modifies state)
   * - Hard to test - must create instance and check state
   */
  class TightlyCouple_Counter {
    private count = 0;

    increment() {
      this.count++;  // ← Tightly coupled to 'count' field
    }

    getCount(): number {
      return this.count;
    }
  }

  it('tightly coupled counter works but is hard to test', () => {
    const counter = new TightlyCouple_Counter();
    counter.increment();
    counter.increment();
    
    expect(counter.getCount()).toBe(2);
    
    // Problem: We can only test the final state
    // We can't test what increment() returns
    // We can't test increment() in isolation
  });

  /**
   * ✅ LOOSELY COUPLED: Pure function approach
   * 
   * Benefits:
   * - increment() is independent of any state
   * - increment() can be called in any order
   * - increment() is easy to test
   * - No side effects
   */
  function increment(count: number): number {
    return count + 1;  // ← Pure function, no coupling
  }

  it('pure function is easy to test', () => {
    expect(increment(0)).toBe(1);
    expect(increment(5)).toBe(6);
    expect(increment(-1)).toBe(0);
    
    // Benefits:
    // - No setup needed
    // - No state to manage
    // - Can test all cases easily
    // - Same input always gives same output
  });

  /**
   * ✅ LOOSELY COUPLED: Immutable class approach
   * 
   * Benefits:
   * - increment() returns a new instance
   * - No state mutation
   * - Each instance is independent
   * - Easy to test
   */
  class Immutable_Counter {
    constructor(private count: number) {}

    increment(): Immutable_Counter {
      return new Immutable_Counter(this.count + 1);  // ← Returns new instance
    }

    getCount(): number {
      return this.count;
    }
  }

  it('immutable counter is composable and testable', () => {
    const counter0 = new Immutable_Counter(0);
    const counter1 = counter0.increment();
    const counter2 = counter1.increment();
    
    // Each instance is independent
    expect(counter0.getCount()).toBe(0);
    expect(counter1.getCount()).toBe(1);
    expect(counter2.getCount()).toBe(2);
    
    // Can chain operations
    const result = new Immutable_Counter(0)
      .increment()
      .increment()
      .increment();
    
    expect(result.getCount()).toBe(3);
  });
});

// ============================================================================
// PART 2: TEMPORAL COUPLING
// ============================================================================

describe('Part 2: Temporal Coupling - Order Matters', () => {
  /**
   * ❌ TEMPORAL COUPLING: Methods must be called in specific order
   * 
   * Problems:
   * - verify() must be called AFTER setUser()
   * - getUser() must be called AFTER verify()
   * - If you call them in wrong order, it fails
   * - Easy to use incorrectly
   */
  class TemporalCoupling_Account {
    private user: { id: string; name: string } | null = null;
    private isVerified = false;

    setUser(user: { id: string; name: string }) {
      this.user = user;
    }

    verify() {
      if (!this.user) {
        throw new Error('User not set! Call setUser() first');  // ✗ Temporal coupling
      }
      this.isVerified = true;
    }

    getUser(): { id: string; name: string } {
      if (!this.isVerified) {
        throw new Error('User not verified! Call verify() first');  // ✗ Temporal coupling
      }
      return this.user!;
    }
  }

  it('temporal coupling - correct order works', () => {
    const account = new TemporalCoupling_Account();
    account.setUser({ id: '1', name: 'Alice' });
    account.verify();
    const user = account.getUser();
    
    expect(user.name).toBe('Alice');
  });

  it('temporal coupling - wrong order fails', () => {
    const account = new TemporalCoupling_Account();
    
    // Calling verify() before setUser() fails
    expect(() => account.verify()).toThrow('User not set!');
  });

  it('temporal coupling - calling getUser() before verify() fails', () => {
    const account = new TemporalCoupling_Account();
    account.setUser({ id: '1', name: 'Alice' });
    
    // Calling getUser() before verify() fails
    expect(() => account.getUser()).toThrow('User not verified!');
  });

  /**
   * ✅ NO TEMPORAL COUPLING: All data provided upfront
   * 
   * Benefits:
   * - No required order
   * - Can't be used incorrectly
   * - All dependencies explicit
   * - Easy to test
   */
  class NoCoupling_Account {
    constructor(
      private user: { id: string; name: string },
      private isVerified: boolean
    ) {}

    getUser(): { id: string; name: string } {
      if (!this.isVerified) {
        throw new Error('User not verified');
      }
      return this.user;
    }

    static create(user: { id: string; name: string }): NoCoupling_Account {
      return new NoCoupling_Account(user, false);
    }

    static createVerified(user: { id: string; name: string }): NoCoupling_Account {
      return new NoCoupling_Account(user, true);
    }
  }

  it('no temporal coupling - state is explicit', () => {
    // Can't create invalid state
    const account = NoCoupling_Account.createVerified({ id: '1', name: 'Alice' });
    const user = account.getUser();
    
    expect(user.name).toBe('Alice');
  });

  it('no temporal coupling - unverified account fails immediately', () => {
    const account = NoCoupling_Account.create({ id: '1', name: 'Alice' });
    
    // Fails immediately - no hidden state
    expect(() => account.getUser()).toThrow('User not verified');
  });
});

// ============================================================================
// PART 3: METHOD COUPLING - METHODS DEPEND ON EACH OTHER'S SIDE EFFECTS
// ============================================================================

describe('Part 3: Method Coupling - Interdependent Side Effects', () => {
  /**
   * ❌ METHOD COUPLING: Methods depend on each other's side effects
   * 
   * Problems:
   * - addItem() and removeItem() both modify the same internal list
   * - getTotal() depends on the current state of the list
   * - Can't call methods independently
   * - Hard to test individual methods
   * - Changing one method breaks others
   */
  class ShoppingCart_Coupled {
    private items: { name: string; price: number }[] = [];

    addItem(name: string, price: number) {
      this.items.push({ name, price });  // ← Modifies shared state
    }

    removeItem(name: string) {
      this.items = this.items.filter(item => item.name !== name);  // ← Modifies shared state
    }

    getTotal(): number {
      return this.items.reduce((sum, item) => sum + item.price, 0);  // ← Depends on items state
    }

    getItemCount(): number {
      return this.items.length;  // ← Depends on items state
    }
  }

  it('method coupling - works but is tightly bound', () => {
    const cart = new ShoppingCart_Coupled();
    cart.addItem('Apple', 1.5);
    cart.addItem('Banana', 0.5);
    
    expect(cart.getTotal()).toBe(2.0);
    expect(cart.getItemCount()).toBe(2);
    
    cart.removeItem('Apple');
    expect(cart.getTotal()).toBe(0.5);
    expect(cart.getItemCount()).toBe(1);
    
    // Problem: Can't test getTotal() without calling addItem() first
    // Problem: Can't test removeItem() independently
    // Problem: All methods depend on the internal items list
  });

  /**
   * ✅ DECOUPLED: Methods return new state instead of modifying
   * 
   * Benefits:
   * - Each method is independent
   * - No shared mutable state
   * - Easy to test each method in isolation
   * - No hidden dependencies
   * - Composable operations
   */
  class ShoppingCart_Decoupled {
    constructor(private items: readonly { name: string; price: number }[] = []) {}

    addItem(name: string, price: number): ShoppingCart_Decoupled {
      return new ShoppingCart_Decoupled([...this.items, { name, price }]);  // ← Returns new instance
    }

    removeItem(name: string): ShoppingCart_Decoupled {
      const filtered = this.items.filter(item => item.name !== name);
      return new ShoppingCart_Decoupled(filtered);  // ← Returns new instance
    }

    getTotal(): number {
      return this.items.reduce((sum, item) => sum + item.price, 0);  // ← Pure calculation
    }

    getItemCount(): number {
      return this.items.length;  // ← Pure calculation
    }
  }

  it('decoupled methods - independent and testable', () => {
    // Can test each method independently
    const cart0 = new ShoppingCart_Decoupled();
    expect(cart0.getTotal()).toBe(0);
    expect(cart0.getItemCount()).toBe(0);

    const cart1 = cart0.addItem('Apple', 1.5);
    expect(cart1.getTotal()).toBe(1.5);
    expect(cart1.getItemCount()).toBe(1);

    const cart2 = cart1.addItem('Banana', 0.5);
    expect(cart2.getTotal()).toBe(2.0);
    expect(cart2.getItemCount()).toBe(2);

    const cart3 = cart2.removeItem('Apple');
    expect(cart3.getTotal()).toBe(0.5);
    expect(cart3.getItemCount()).toBe(1);

    // Original carts are unchanged
    expect(cart0.getTotal()).toBe(0);
    expect(cart1.getTotal()).toBe(1.5);
    expect(cart2.getTotal()).toBe(2.0);
  });

  it('decoupled methods - can be composed', () => {
    const result = new ShoppingCart_Decoupled()
      .addItem('Apple', 1.5)
      .addItem('Banana', 0.5)
      .addItem('Orange', 2.0)
      .removeItem('Banana');

    expect(result.getTotal()).toBe(3.5);
    expect(result.getItemCount()).toBe(2);
  });

  it('decoupled methods - each operation is independent', () => {
    // Can test getTotal() without any prior state
    const emptyCart = new ShoppingCart_Decoupled();
    expect(emptyCart.getTotal()).toBe(0);

    // Can test removeItem() on empty cart
    const stillEmpty = emptyCart.removeItem('NonExistent');
    expect(stillEmpty.getItemCount()).toBe(0);

    // No errors, no hidden state
  });
});

// ============================================================================
// PART 4: PRACTICAL EXAMPLE - BUILDING A BETTER COUNTER
// ============================================================================

describe('Part 4: Practical Example - Building a Better Counter', () => {
  /**
   * ❌ TIGHTLY COUPLED: Multiple internal dependencies
   * 
   * Problems:
   * - increment() and decrement() both depend on history
   * - Can't change how history is stored without breaking both
   * - Hard to test - must verify both count and history
   * - Temporal coupling - history must be maintained
   */
  class BadCounter {
    private count = 0;
    private history: number[] = [];

    increment() {
      this.count++;
      this.history.push(this.count);  // ← Coupled to history field
    }

    decrement() {
      this.count--;
      this.history.push(this.count);  // ← Coupled to history field
    }

    getCount(): number {
      return this.count;  // ← Coupled to count field
    }

    getHistory(): number[] {
      return this.history;  // ← Coupled to history field
    }
  }

  it('bad counter - tightly coupled', () => {
    const counter = new BadCounter();
    counter.increment();
    counter.increment();
    counter.decrement();
    
    expect(counter.getCount()).toBe(1);
    expect(counter.getHistory()).toEqual([1, 2, 1]);
    
    // Problems:
    // - Must test both count and history together
    // - Can't test increment() without affecting history
    // - Hard to understand dependencies
  });

  /**
   * ✅ LOOSELY COUPLED: Pure functions + Immutability
   * 
   * Benefits:
   * - Each method is independent
   * - No shared mutable state
   * - Easy to test - just check return values
   * - No temporal coupling
   * - Can chain operations safely
   */
  class BetterCounter {
    constructor(
      private count: number,
      private history: readonly number[] = []
    ) {}

    increment(): BetterCounter {
      const newCount = this.count + 1;
      return new BetterCounter(newCount, [...this.history, newCount]);
    }

    decrement(): BetterCounter {
      const newCount = this.count - 1;
      return new BetterCounter(newCount, [...this.history, newCount]);
    }

    getCount(): number {
      return this.count;
    }

    getHistory(): readonly number[] {
      return this.history;
    }
  }

  it('better counter - loosely coupled and composable', () => {
    const result = new BetterCounter(0)
      .increment()
      .increment()
      .decrement();
    
    expect(result.getCount()).toBe(1);
    expect(result.getHistory()).toEqual([1, 2, 1]);
  });

  it('better counter - each operation is independent', () => {
    const counter0 = new BetterCounter(0);
    const counter1 = counter0.increment();
    const counter2 = counter1.increment();
    const counter3 = counter2.decrement();
    
    // Each instance is independent
    expect(counter0.getCount()).toBe(0);
    expect(counter1.getCount()).toBe(1);
    expect(counter2.getCount()).toBe(2);
    expect(counter3.getCount()).toBe(1);
    
    // History is preserved separately
    expect(counter0.getHistory()).toEqual([]);
    expect(counter1.getHistory()).toEqual([1]);
    expect(counter2.getHistory()).toEqual([1, 2]);
    expect(counter3.getHistory()).toEqual([1, 2, 1]);
  });

  it('better counter - no temporal coupling', () => {
    // Can call operations in any order
    const counter1 = new BetterCounter(5).decrement();
    const counter2 = new BetterCounter(0).increment().increment();
    
    expect(counter1.getCount()).toBe(4);
    expect(counter2.getCount()).toBe(2);
    
    // No errors, no hidden state
  });
});

// ============================================================================
// PART 5: EXPLICIT DEPENDENCIES - DEPENDENCY INJECTION
// ============================================================================

describe('Part 5: Explicit Dependencies - Dependency Injection', () => {
  interface Database {
    insert(table: string, data: any): any;
  }

  /**
   * ❌ HIDDEN DEPENDENCY: Database is created internally
   * 
   * Problems:
   * - createUser() depends on a specific Database implementation
   * - Can't test with a mock database
   * - Hard to understand what createUser() needs
   */
  class HiddenDependency_UserService {
    private db = new (class implements Database {
      insert(table: string, data: any) {
        return { id: '1', ...data };
      }
    })();

    createUser(name: string) {
      return this.db.insert('users', { name });
    }
  }

  it('hidden dependency - works but hard to test', () => {
    const service = new HiddenDependency_UserService();
    const user = service.createUser('Alice');
    
    expect(user.name).toBe('Alice');
    
    // Problem: Can't inject a mock database for testing
  });

  /**
   * ✅ EXPLICIT DEPENDENCY: Database is injected
   * 
   * Benefits:
   * - Dependencies are visible
   * - Easy to test - inject mock database
   * - Easy to understand what the method needs
   * - Not coupled to specific Database implementation
   */
  class ExplicitDependency_UserService {
    constructor(private db: Database) {}

    createUser(name: string) {
      return this.db.insert('users', { name });
    }
  }

  it('explicit dependency - easy to test with mock', () => {
    // Create a mock database
    const mockDb: Database = {
      insert: (table: string, data: any) => {
        return { id: 'mock-1', ...data };
      }
    };

    const service = new ExplicitDependency_UserService(mockDb);
    const user = service.createUser('Alice');
    
    expect(user.name).toBe('Alice');
    expect(user.id).toBe('mock-1');
    
    // Benefits:
    // - No setup needed
    // - Can control the database behavior
    // - Easy to test different scenarios
  });

  it('explicit dependency - can inject different implementations', () => {
    // Mock 1: Returns specific ID
    const mockDb1: Database = {
      insert: () => ({ id: 'user-1', name: 'Alice' })
    };

    // Mock 2: Returns different ID
    const mockDb2: Database = {
      insert: () => ({ id: 'user-2', name: 'Bob' })
    };

    const service1 = new ExplicitDependency_UserService(mockDb1);
    const service2 = new ExplicitDependency_UserService(mockDb2);
    
    expect(service1.createUser('Alice').id).toBe('user-1');
    expect(service2.createUser('Bob').id).toBe('user-2');
  });
});

// ============================================================================
// PART 6: SUMMARY - KEY PRINCIPLES
// ============================================================================

describe('Part 6: Summary - Key Principles', () => {
  it('principle 1: minimize internal state', () => {
    // Less state = less coupling
    
    // ❌ Multiple internal states
    class ManyStates {
      private state1 = 0;
      private state2 = '';
      private state3: any[] = [];
      
      method1() { this.state1++; }
      method2() { this.state2 += 'x'; }
      method3() { this.state3.push(this.state1); }
    }
    
    // ✅ Minimal state
    class FewStates {
      constructor(private value: number) {}
      
      increment(): FewStates {
        return new FewStates(this.value + 1);
      }
      
      getValue(): number {
        return this.value;
      }
    }
    
    expect(new FewStates(0).increment().getValue()).toBe(1);
  });

  it('principle 2: use pure functions', () => {
    // Functions without side effects are easier to test and compose
    
    // ❌ Side effects
    let counter = 0;
    function impure() {
      counter++;  // ← Side effect
      return counter;
    }
    
    // ✅ Pure function
    function pure(count: number): number {
      return count + 1;  // ← No side effects
    }
    
    expect(pure(0)).toBe(1);
    expect(pure(0)).toBe(1);  // Same input, same output
  });

  it('principle 3: prefer immutability', () => {
    // Immutable objects can't have temporal coupling
    
    class Immutable {
      constructor(private value: number) {}
      
      add(n: number): Immutable {
        return new Immutable(this.value + n);
      }
      
      getValue(): number {
        return this.value;
      }
    }
    
    const a = new Immutable(0);
    const b = a.add(5);
    const c = b.add(3);
    
    // Each instance is independent
    expect(a.getValue()).toBe(0);
    expect(b.getValue()).toBe(5);
    expect(c.getValue()).toBe(8);
  });

  it('principle 4: make dependencies explicit', () => {
    // Pass state as parameters, not hidden in fields
    
    // ❌ Hidden dependency
    let globalState = 0;
    function hidden() {
      return globalState;
    }
    
    // ✅ Explicit dependency
    function explicit(state: number): number {
      return state;
    }
    
    expect(explicit(42)).toBe(42);
  });

  it('principle 5: reduce surface of dependencies', () => {
    // Fewer things depending on each other = less coupling
    
    // ❌ Many dependencies
    class TightlyCoupled {
      private a = 0;
      private b = 0;
      private c = 0;
      
      method1() { this.a++; this.b++; this.c++; }
      method2() { this.a--; this.b--; this.c--; }
    }
    
    // ✅ Few dependencies
    function looselyDecoupled(value: number): number {
      return value + 1;
    }
    
    expect(looselyDecoupled(5)).toBe(6);
  });
});
