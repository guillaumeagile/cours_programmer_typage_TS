---
description: Understanding and implementing the ValueObject pattern in Domain-Driven Design
---

# Workshop: The ValueObject Pattern 🎯

## Introduction

Welcome! In this workshop, you'll learn about **ValueObjects**, a fundamental pattern in Domain-Driven Design (DDD). By the end, you'll understand what they are, why they matter, how to test them, and how to improve them.

---

## Part 1: Do You Understand This Pattern?

### What is a ValueObject?

A **ValueObject** is an immutable object that represents a value in your domain. Unlike entities (which have unique identities), value objects are defined by their content.

**Real-world analogy:**
- **Entity**: A person (has a unique ID, can change over time)
- **ValueObject**: A price of $50 (defined only by its value, never changes)

### The Base Pattern

Here's the abstract base class from your project:

```typescript
export abstract class ValueObject<T> {
  protected readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  public getValue(): T {
    return this.value;
  }

  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}
```

### Key Characteristics

| Characteristic | Why It Matters |
|---|---|
| **Immutable** | Once created, it never changes. Prevents bugs from accidental mutations. |
| **Value-based equality** | Two ValueObjects are equal if their values are equal, not their identity. |
| **Self-validating** | Validation happens in the constructor. Invalid states are impossible. |
| **No side effects** | Creating a ValueObject doesn't modify anything else. |

### Example: Email ValueObject

```typescript
export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(email: string) {
    const trimmedEmail = email.trim();
    if (!Email.isValid(trimmedEmail)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    super(trimmedEmail.toLowerCase());
  }

  public static isValid(email: string): boolean {
    return typeof email === 'string' && 
           email.length > 0 && 
           email.length <= 254 && 
           Email.EMAIL_REGEX.test(email);
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public getLocalPart(): string {
    return this.value.split('@')[0];
  }
}
```

---

## Part 2: What Is It Good For?

### Problem Without ValueObjects

```typescript
// ❌ Without ValueObjects - Dangerous!
const user = {
  id: 1,
  email: 'invalid-email', // Oops! No validation
  name: '', // Empty name allowed
  age: -5 // Negative age?
};

// Later in your code...
if (user.email.includes('@')) { // Defensive programming everywhere
  sendEmail(user.email);
}
```

### Solution With ValueObjects

```typescript
// ✅ With ValueObjects - Safe!
const user = {
  id: new UserId(1),
  email: new Email('test@example.com'), // Validated at creation
  name: new UserName('John Doe'), // Validated at creation
  age: new Age(25) // Validated at creation
};

// Later in your code...
sendEmail(user.email.getValue()); // You know it's valid!
```

### Benefits

1. **Prevents Invalid States**
   - Validation happens once at construction
   - Impossible to create an invalid Email
   - No defensive checks scattered throughout your code

2. **Self-Documenting Code**
   ```typescript
   // Clear intent - this is an email, not just a string
   sendNotification(email: Email): void { ... }
   
   // vs
   
   // Ambiguous - is this a string? An email? A name?
   sendNotification(value: string): void { ... }
   ```

3. **Type Safety**
   ```typescript
   // TypeScript prevents mixing up values
   const email = new Email('test@example.com');
   const name = new UserName('John');
   
   // ❌ Compiler error! Can't pass Email where UserName is expected
   validateName(email);
   ```

4. **Business Logic Encapsulation**
   ```typescript
   const email = new Email('john.doe@example.com');
   
   // Domain logic lives in the ValueObject
   email.getDomain(); // 'example.com'
   email.getLocalPart(); // 'john.doe'
   ```

5. **Immutability = Fewer Bugs**
   ```typescript
   const email = new Email('test@example.com');
   
   // ✅ Can't accidentally modify it
   email.value = 'hacked@evil.com'; // TypeScript error!
   ```

---

## Part 3: Can You Unit Test It?

### Test Structure

ValueObjects should have comprehensive unit tests covering:
- Valid construction
- Invalid construction (error cases)
- Equality comparison
- Domain-specific methods
- Edge cases

### Example: Testing Email ValueObject

```typescript
describe('Email Value Object', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = new Email('TEST@EXAMPLE.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = new Email('  test@example.com  ');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
      expect(() => new Email('')).toThrow('Invalid email format');
      expect(() => new Email('test@')).toThrow('Invalid email format');
    });
  });

  describe('isValid', () => {
    it('should return true for valid emails', () => {
      expect(Email.isValid('test@example.com')).toBe(true);
      expect(Email.isValid('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(Email.isValid('')).toBe(false);
      expect(Email.isValid('invalid')).toBe(false);
      expect(Email.isValid('test..test@example.com')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('TEST@EXAMPLE.COM'); // Different case
      expect(email1.equals(email2)).toBe(true); // Both normalized to lowercase
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('getDomain', () => {
    it('should return the domain part of email', () => {
      const email = new Email('test@example.com');
      expect(email.getDomain()).toBe('example.com');
    });
  });

  describe('getLocalPart', () => {
    it('should return the local part of email', () => {
      const email = new Email('test@example.com');
      expect(email.getLocalPart()).toBe('test');
    });
  });
});
```

### Test Pyramid for ValueObjects

```
         ▲
        ╱ ╲
       ╱   ╲  Edge Cases & Complex Scenarios
      ╱─────╲
     ╱       ╲  Domain Methods (getDomain, getLocalPart, etc.)
    ╱─────────╲
   ╱           ╲  Equality & Immutability
  ╱─────────────╲
 ╱               ╲  Valid Construction & Validation
╱─────────────────╲
```

### Running the Tests

```bash
pnpm test tests/unit/domain/value-objects/email.test.ts
```

---

## Part 3: Exercises - Testing in Practice

Now let's apply what you've learned! You have a real `Email` ValueObject implementation with tests. Your job is to identify issues, fix them, and improve test coverage.

### Exercise 3.a: Find, Explain, and Fix Failing Tests

**Your Task:**
1. Run the tests for the Email ValueObject
2. Identify which tests are failing
3. Explain WHY they're failing
4. Fix the implementation or tests to make them pass

**Hints:**
- Look at the constructor in `Email.ts` - what does it do?
- Look at the test expectations - what do they expect?
- Compare the actual implementation with what the tests assume

**Run the tests:**
```bash
pnpm test tests/unit/domain/value-objects/email.test.ts
```

**Expected Issues to Find:**

| Issue | Location | Problem | Solution |
|-------|----------|---------|----------|
| **Issue #1** | ??? | ??? | ??? |
| **Issue #2** | ??? | ??? | ??? |
| **Issue #3** | ??? | ??? | ??? |

> 🫵 **CHECKPOINT 3.a.1**: Before looking at the solution, write down the 3 issues you found and explain WHY each test fails. What's the mismatch between the code and the test?
>
> Your answer:
> ```
> Issue #1: 
> Issue #2: 
> Issue #3: 
> ```



---

### Exercise 3.b: Test Coverage - Find Untested Code Paths

**Your Task:**
Look at the `Email.isValid()` method:

```typescript
public static isValid(email: string): boolean {
  return typeof email === 'string' && 
         email.length > 0 && 
         email.length <= 254 && 
         !Email.hasConsecutiveDots(email) &&
         Email.EMAIL_REGEX.test(email);
}
```

**Questions:**
1. Which conditions are NOT tested?
2. What test cases are missing?

**Untested Code Paths:**

| Line    | Condition                  | Current Test Coverage   | Missing Test or Existing ?                  |
|---------|----------------------------|-------------------------|---------------------------------------------|
| Line 19 | `typeof email === 'string'` | ✅ ❌  tested or not ?    | What if you pass   ? `Email.isValid( ????)` |
| Line ?? | ???                        | ✅ ❌  tested or not ?  | -                                           |
| Line ?? | ???                        | ✅ ❌  tested or not ?        | What if email is .... (DO WE NEED IT ???)   |
| Line ?? | ???                        | ✅ ❌  tested or not ?                 | -                                           |
| Line ?? | ???                        | ✅ ❌  tested or not ?                | -                                           |

> 🫵 **CHECKPOINT 3.b.1**: Fill in the missing line numbers and conditions in the table above. Look at the `isValid()` method and map each condition to its line number.

**Your Task:**
Add tests for the missing cases:

```typescript
describe('isValid - Edge Cases', () => {
  // 🫵 CHECKPOINT 3.b.2: Write 3 test cases for untested conditions
  // Hint: Think about the 3 conditions that aren't covered
  
  it('should return false if ???', () => {
    // TODO: Test case #1
  });

  it('should return false if ???', () => {
    // TODO: Test case #2
  });

  it('should return false if ???', () => {
    // TODO: Test case #3
  });
});
```

> 🫵 **CHECKPOINT 3.b.3**: After writing the tests, explain:
> - Which line of `isValid()` does each test cover?
> - Why is this edge case important?
> - What would happen if this check was removed?

---

### Exercise 3.c: Missing Method Tests - Write Tests for Domain Methods

**Your Task:**
The `Email` class has two important domain methods that are NOT tested:

```typescript
  // 🫵 CHECKPOINT 3.c.1: Find these two methods in Email.ts
  // Write their names and signatures below:
  // Method 1: ???
  // Method 2: ???
```

> 🫵 **CHECKPOINT 3.c.2**: Before writing tests, answer:
> - What does each method do?
> - What are the inputs and outputs?
> - What edge cases could break them?

**Your Job:**
Write comprehensive tests for these methods. Consider:
- Normal cases (simple email)
- Edge cases (email with dots, plus signs, numbers)
- What happens with invalid emails?

```typescript
// 🫵 CHECKPOINT 3.c.3: Write at least 5 test cases total
// (combine both methods)
// Your tests here:
```

> 🫵 **CHECKPOINT 3.c.4**: After writing tests, verify:
> - Do your tests pass? ✅
> - Did you test both happy path AND edge cases?
> - What edge case was hardest to think of?



**Bonus Challenge:**

> 🫵 **CHECKPOINT 3.c.5 (Bonus)**: 
> What happens if you call `getDomain()` or `getLocalPart()` on an invalid email? 
> - Can this even happen? Why or why not?
> - Should you add error handling? 
> - Write a test case that explores this scenario

---

### Summary of Exercises

| Exercise | Focus | Difficulty | Time |
|----------|-------|-----------|------|
| **3.a** | Debug failing tests | ⭐⭐ Medium | 15 min |
| **3.b** | Identify untested code paths | ⭐⭐⭐ Hard | 20 min |
| **3.c** | Write missing tests | ⭐ Easy | 15 min |

**Total Workshop Time: ~50 minutes**

---

## Part 4: Can You Improve It?

### Current Implementation Analysis

Your current `ValueObject` base class is good, but here are potential improvements:

### Improvement 1: Stronger Immutability

**Current:**
```typescript
protected readonly value: T;
```

**Problem:** `readonly` only prevents reassignment. If `T` is an object, it can still be mutated.

**Improved:**
```typescript
protected readonly value: T;

constructor(value: T) {
  // Freeze the value to prevent mutations
  this.value = Object.freeze(value) as T;
}
```

**When to use:** If your ValueObjects contain complex objects (arrays, nested objects).

---

### Improvement 2: Better Equality Comparison

**Current:**
```typescript
public equals(other: ValueObject<T>): boolean {
  return JSON.stringify(this.value) === JSON.stringify(other.value);
}
```

**Problems:**
- JSON.stringify has edge cases (object key order, circular references)
- Doesn't work well with complex objects
- Performance overhead for large objects

**Improved (for simple types):**
```typescript
public equals(other: ValueObject<T>): boolean {
  if (!(other instanceof this.constructor)) {
    return false;
  }
  return this.value === other.value;
}
```

**Improved (for complex types):**
```typescript
public equals(other: ValueObject<T>): boolean {
  if (!(other instanceof this.constructor)) {
    return false;
  }
  
  // For objects, implement custom comparison
  if (typeof this.value === 'object' && this.value !== null) {
    return this.equalsValue(other.value);
  }
  
  return this.value === other.value;
}

protected equalsValue(other: T): boolean {
  // Override in subclasses for complex comparison logic
  return JSON.stringify(this.value) === JSON.stringify(other);
}
```

---

### Improvement 3: Add a toString() Method

**Current:** No string representation

**Improved:**
```typescript
public toString(): string {
  return String(this.value);
}
```

**Why:** Useful for debugging and logging.

```typescript
const email = new Email('test@example.com');
console.log(email.toString()); // 'test@example.com'
```

> 🫵 **CHECKPOINT 4.3.1**: Write tests for the `toString()` method:
> ```typescript
> describe('toString', () => {
>   it('should return the string representation of the value', () => {
>     // TODO: Test
>   });
>
>   it('should be useful for debugging', () => {
>     // TODO: Test that console.log works with it
>   });
> });
> ```
>
> **Questions to answer:**
> - What should `toString()` return for an Email?
> - How is it different from `getValue()`?
> - When would you use `toString()` vs `getValue()`?


---

### Improvement 4: Add a hashCode() Method

**Current:** No hash support

**Improved:**
```typescript
public hashCode(): number {
  // Simple hash function for primitives
  if (typeof this.value === 'string') {
    let hash = 0;
    for (let i = 0; i < this.value.length; i++) {
      const char = this.value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  return 0;  // Default value for non-primitive types
}
```

**Why:** Useful for using ValueObjects in Sets or Maps.

```typescript
const emailSet = new Set<Email>();
emailSet.add(new Email('test@example.com'));
emailSet.add(new Email('test@example.com')); // Should be deduplicated
```

> 🫵 **CHECKPOINT 4.4.1**: Write tests for the `hashCode()` method:
> ```typescript
> describe('hashCode', () => {
>   it('should return the same hash for equal values', () => {
>     // TODO: Test that two equal ValueObjects have same hash
>   });
>
>   it('should return different hashes for different values', () => {
>     // TODO: Test that different ValueObjects have different hashes
>   });
>
>   it('should be useful in Sets', () => {
>     // TODO: Test deduplication in a Set
>   });
> });
> ```
>
> **Questions to answer:**
> - Why is `hashCode()` important for Sets and Maps?
> - What's the relationship between `equals()` and `hashCode()`?
> - What would happen if two equal objects had different hash codes?

---

## Part 4: Exercises - Improving the ValueObject

### Exercise 4.a: Implement toString() and hashCode()

> 🫵 **CHECKPOINT 4.a.1**: Before implementing, answer:
> - What should `toString()` return for an Email?
> - Why is `hashCode()` useful?
> - What's the contract between `equals()` and `hashCode()`?

Implement both methods in the `ValueObject` base class and write tests for them.

---

### Exercise 4.b: Implement Improvement 2 - Better Equality

> 🫵 **CHECKPOINT 4.b.1**: Analyze the current `equals()` implementation:
> ```typescript
> public equals(other: ValueObject<T>): boolean {
>   return JSON.stringify(this.value) === JSON.stringify(other.value);
> }
> ```
> 
> **Questions:**
> - What are the problems with this approach?
> - When would this fail?
> - Write a test case that breaks this implementation

Implement the improved version for string-based ValueObjects.

---

## Challenge: Create Your Own ValueObject

Now it's your turn! Create a new ValueObject following the pattern.

### Task: Create a `PhoneNumber` ValueObject

**Requirements:**
1. Extend `ValueObject<string>`
2. Validate phone numbers (at least 10 digits, only digits and common separators)
3. Normalize the format (remove spaces, dashes, parentheses)
4. Add a method `getCountryCode()` that extracts the country code (first 1-3 digits)
5. Write comprehensive unit tests

> 🫵 **CHECKPOINT Challenge.1**: Before coding, design your solution:
> - What regex pattern will you use for validation?
> - How will you normalize the phone number?
> - What edge cases should you test?
> 
> Write your design here:
> ```
> Validation regex: ???
> Normalization steps: ???
> Edge cases: ???
> ```

### Starter Template

```typescript
import { ValueObject } from '../../shared/types/common.js';

export class PhoneNumber extends ValueObject<string> {
  // TODO: Add regex and validation logic
  
  constructor(phoneNumber: string) {
    // TODO: Validate and normalize
    super(phoneNumber);
  }

  public static isValid(phoneNumber: string): boolean {
    // TODO: Implement validation
    return false;
  }

  public getCountryCode(): string {
    // TODO: Extract country code
    return '';
  }
}
```

### Test Template

```typescript
describe('PhoneNumber Value Object', () => {
  describe('constructor', () => {
    it('should create a valid phone number', () => {
      // TODO: Test
    });

    it('should normalize phone number format', () => {
      // TODO: Test
    });

    it('should throw error for invalid phone numbers', () => {
      // TODO: Test
    });
  });

  describe('getCountryCode', () => {
    it('should extract country code', () => {
      // TODO: Test
    });
  });

  describe('equals', () => {
    it('should return true for equal phone numbers', () => {
      // TODO: Test
    });
  });
});
```

> 🫵 **CHECKPOINT Challenge.2**: After implementation, verify:
> - Does your implementation follow the ValueObject pattern?
> - Are all edge cases tested?
> - Can you think of a phone number that would break your code?
> 
> **Self-assessment:**
> - [ ] Constructor validates input
> - [ ] Normalization works correctly
> - [ ] `isValid()` is comprehensive
> - [ ] `getCountryCode()` handles edge cases
> - [ ] Tests cover happy path AND edge cases
> - [ ] Tests would catch an AI-generated solution that doesn't understand the domain

---

## Key Takeaways

✅ **ValueObjects are immutable, self-validating objects that represent domain concepts**

✅ **They prevent invalid states and make code more type-safe**

✅ **They should be thoroughly unit tested**

✅ **They can be improved with better immutability, equality, and utility methods**

✅ **They're a cornerstone of Domain-Driven Design**

---

## Further Reading

- **Domain-Driven Design** by Eric Evans (the original book)
- **Implementing Domain-Driven Design** by Vaughn Vernon
- [ValueObject Pattern](https://martinfowler.com/bliki/ValueObject.html) - Martin Fowler
- [Domain-Driven Design in TypeScript](https://khalilstemmler.com/articles/domain-driven-design-intro/)

---

## Questions to Discuss

1. **When should you use a ValueObject vs. a simple type?**
   - Answer: When you need validation, domain logic, or type safety

2. **Can a ValueObject contain other ValueObjects?**
   - Answer: Yes! Example: `Address` containing `Street`, `City`, `PostalCode`

3. **Should ValueObjects be persisted to a database?**
   - Answer: Yes, but usually as part of an Entity

4. **Can ValueObjects be mutable?**
   - Answer: No, immutability is a core characteristic

5. **How do you handle ValueObject equality in databases?**
   - Answer: Compare all fields or use a hash of the value
