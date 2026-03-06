import {PerformanceMark} from "node:perf_hooks";

describe('Chapter A: Cohesion - Type Basics', () => {
  describe('1. What is a Type?', () => {
    it('should understand types as constraints on values', () => {

     let count = 33;
     //count = "edd";

     const cost : number = 55;
     let name : string = 'Alice';


      // A type defines what values are valid
      type Age = number;
      type Email2 = string;

      const validAge : any = 25;
      const validEmail: Email2 = 'alice@example.com';

      expect(validAge).toBe(25);
     // expect( validAge === "25").toBeTruthy();
      expect(validEmail).toBe('alice@example.com');
    });

    it('should understand that types define allowed operations', () => {
      type Count = number;
      type Name = string;
      type Vérité = boolean;

      let count: Count = 5;
      var name: Name = 'Alice';
      const vrai : Vérité = true;
     // count ++;

      // Numbers support arithmetic
      expect(count + 3).toBe(8);

      // Strings support concatenation
      expect(name + ' Smith').toBe('Alice Smith');

      // But not mixed operations
       const result = 5 + name ; // ✗ Type error
      expect(result).toEqual('5Alice');

      const result2 = vrai + name;
      expect(result2).toEqual('trueAlice');

     // const result3: number = vrai && vrai;

    });
  });

  describe('2. Type Inference', () => {
    it('should infer types from initial values', () => {
      const name =  '12345';        // Inferred as string
      const age = 30;              // Inferred as number
      const active = true;         // Inferred as boolean

      expect(typeof name).toBe('string');
      expect(typeof age).toBe('number');
      expect(typeof active).toBe('boolean');
    });

    it('should use explicit annotations for clarity', () => {
      // Explicit annotation makes intent clear
      const userId: string = '12345';
      const userAge: number = 30;
      const isActive: boolean = true;

      expect(userId).toBe('12345');
      expect(userAge).toBe(30);
      expect(isActive).toBe(true);
    });

    it('should catch type errors with explicit annotations', () => {
      // This would be a type error:
      // const age: number = "thirty"; // ✗ Type error

      // But inference NEVER miss it:
      const age = "thirty"; // Inferred as string, not number
      expect(typeof age).toBe('string');
    });
  });

  describe('3. Structural Typing', () => {
    it('should check type compatibility by shape', () => {
      type Point = { x: number; y: number };
      type Coordinate = { x: number; y: number }; //try add z, z: number


      const point: Point  = { x: 1, y: 2 };
      const coord: Coordinate = point; // ✓ Same shape = compatible

      expect(typeof point).toBe('object');
      expect(point).toBeInstanceOf(Object );

      expect(coord.x).toBe(1);
      expect(coord.y).toBe(2);

      // structural typing is not nominal (remove the comments below to see the error)
     // expect(typeof point ).toBe('Point');
     // expect(typeof coord).toBe('Point');

     // expect( point).toBeInstanceOf(Point);


      /*
      Structural Typing (TypeScript):

        Types are determined by shape (what properties/methods they have)
        Two types are compatible if they have the same shape
        The name doesn't matter
       */

    });

    it('should allow assignment when shapes match', () => {
      type User = { id: string; name: string };
      type Person = { id: string; name: string };

      const user: User = { id: '1', name: 'Alice' };
      const person: Person = user; // ✓ Compatible

      expect(person.name).toBe('Alice');
    });

    it('should reject assignment when shapes differ', () => {
      type User = { id: string; name: string };
      type Person = { id: string; name: string; email: string };

      const user: User = { id: '1', name: 'Alice' };
      // const person: Person = user; // ✗ Type error - missing email
    });
  });

  describe('4. Object Member Checking', () => {


    it('should enforce required properties', () => {
      type User = {
        id: string;
        name: string;
      };

      // This would be a type error:
      // const user: User = { id: '1' }; // ✗ Missing name

      const user: User = { id: '1', name: 'Alice' };
      expect(user.name).toBe('Alice');
    });

    it('should support optional properties', () => {
      type User = {
        id: string;
        name: string;
        phone?: string; // Optional property
      };

      const user1: User = { id: '1', name: 'Alice' };
      const user2: User = { id: '2', name: 'Bob', phone: '555-1234' };

      expect(user1.phone ).toBeUndefined();
      expect(user2.phone).toBe('555-1234');
    });
  });

  describe('5. Type Aliases vs. Interfaces', () => {
    it('should use type aliases for simple types', () => {
      type UserId = string;
      type Email = string;

      type User = {
        id: UserId;
        email: Email;
      };

      type frenchUser = User & { language: 'French' };
      const guillaume = { id: '1', name: 'Guillaume', email: 'guillaume@example.com', language: 'French' };

      const id: UserId = '12345';
      const email: Email = 'alice@example.com';
      const user : User = {  id,  email }


      expect(id).toBe('12345');
      expect(email).toBe('alice@example.com');
      expect(guillaume.language).toBe('French');
    });

    it('should use interfaces for object contracts', () => {
      interface IUser {
        id: string;
        name: string;
        email: string;
      }

      const user: IUser = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com'
      };

      expect(user.name).toBe('Alice');
     // expect(typeof user ).toBe('IUser');
      expect(user ).toBeInstanceOf(Object);


      /*
      If You Want Nominal Typing (Explicit Names)
          Use classes with explicit implements:
       */

      class UserClass implements IUser {
        id!: string;
          name!: string;
          email!: string;
    }

    const userInstance = new UserClass();
      expect(userInstance).toBeInstanceOf(UserClass);
  //   expect(userInstance).toBeInstanceOf( IUser)
      expect(typeof userInstance ).toBe('object');

      /*
      Why This Happens ?
            TypeScript interfaces are erased at runtime:
              Interfaces only exist in the type system (compile-time)
              At runtime, they don't exist - JavaScript just sees plain objects
              typeof checks the runtime type, which is always "object"
       */

    });

    it('should understand that interfaces are extensible', () => {
      interface User {
        id: string;
        name: string;
      }

      interface UserWithRole  {
        role: string ;
      }

      interface AdminUser extends User, UserWithRole {
        role : 'admin'
        permissions: string[];
      }

      const admin: AdminUser = {
        id: '1',
        name: 'Alice',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      };

      expect(admin.role).toBe('admin');
      expect(admin.permissions).toContain('write');
    });
  });

  describe('6. Type Errors vs. Syntax Errors', () => {
    it('should understand type errors are semantic, not syntactic', () => {
      // Syntax error - won't even parse:
      // const x = 5 +;

      // Type error - parses but violates type rules:
      // const Y: string = 5; // ✗ Type error

      // Valid code:
      const y: string = '5';
      expect(y).toBe('5');
    });

    it('should catch type errors at compile-time', () => {
      const age: number = 30;
      const name: string = 'Alice';

      // This works:
      expect(age + 5).toBe(35);

      // This should be a type error (but it's not):
       const result = age + name; // ✗ Can't add number and string
    });
  });

  describe('7. Cohesion Through Types', () => {
    it('should group related data with types', () => {
      type User = {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
      };

      const user: User = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date('2024-01-01')
      };

      // All user data is grouped together (encapsulation in object)
      expect(user.id).toBe('1');
      expect(user.email).toBe('alice@example.com');
    });

    it('would prevent mixing unrelated types :-/', () => {
      type UserId = string;
      type Email = string;

      let email = "d"
      let userId = "123"

      // Without distinct types, easy to mix up:
      // function createUser(a: string, b: string) { }
       createUser(userId, userId); // ✗ Wrong order, hard to catch

      // With distinct types, should be impossible to mix:
      function createUser(id: UserId, email: Email) {
        return { id, email };
      }
    // PROBLEM HERE !!!!! 😰 😰 😰 😰
      const user = createUser( 'alice@example.com', '123');       // This should be a type error:
    //   createUser('alice@example.com', '123'); // ✗ Wrong order

     // only the tests can prove you wrong here:
      expect(user.id).toBe('123');
      expect(user.email).toBe('alice@example.com');


    });

    it('branded types should prevent mixing unrelated data', () => {
      type UserId = string & { readonly __brand: 'UserId' };
      type Email = string & { readonly __brand: 'Email' };

      let email = "d"
      let userId = "123"

      let stronglyTypedEmail: Email = "alice@example.com" as Email
      let stronglyTypedUserId: UserId = "123" as UserId

      // with branded types, impossible to mix up 💪
      // createUser(stronglyTypedEmail, stronglyTypedUserId); // ✗ Wrong order, does not compile


      function createUser(id: UserId, email: Email) {
        return { id, email };
      }

      //@ts-ignore  // SUPPRESS ME 👽
      const user = createUser('123', 'alice@iter.org');
      expect(user.id).toBe('123');
      expect(user.email).toBe('alice@iter.org');

      // This would be a type error:
      // createUser('alice@example.com', '123'); // ✗ Wrong order
    });





  });

  describe('8. Checkpoint 🫵', () => {
    it('A.1: Explain why explicit type annotations are better than inference', () => {
      // Write your answer here:
      // Explicit annotations:
      // 1. Make intent clear to readers
      // 2. Catch mistakes immediately
      // 3. Serve as documentation
      // 4. Enable better IDE support

      const userId: string = '123'; // Clear this is a user ID
      expect(userId).toBe('123');
    });

    it('A.2: Design a type for a Product with id, name, price, and inStock status', () => {
      // Write your type here:
      type Product = {
        id: string;
        name: string;
        price: number;
        inStock: boolean;
      };

      const product: Product = {
        id: '1',
        name: 'Laptop',
        price: 999.99,
        inStock: true
      };

      expect(product.name).toBe('Laptop');
      expect(product.inStock).toBe(true);
    });

    it('A.3: Identify what would be type errors in this code', () => {
      type User = { id: string; name: string };

      const user: User = { id: '1', name: 'Alice' };

      // Valid operations:
      expect(user.id).toBe('1');

      // Type errors (commented out):
      // user.email; // ✗ Property doesn't exist
      // const u: User = { id: '1' }; // ✗ Missing name
      // const x: string = user; // ✗ Can't assign object to string
    });
  });
});
