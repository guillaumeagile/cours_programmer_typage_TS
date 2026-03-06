describe('Chapter E: Intersection Types', () => {
  describe('1. Understanding Intersection Types', () => {
    it('should combine multiple types with intersection', () => {
      // ✓ Intersection combines types
      interface Named {
        name: string;
      }

      interface Aged {
        age: number;
      }

      type Person = Named & Aged;

      const person: Person = {
        name: 'Alice',
        age: 30
      };

      expect(person.name).toBe('Alice');
      expect(person.age).toBe(30);
    });

    it('should show intersection with multiple interfaces', () => {
      // ✓ Intersection with 3+ types
      interface HasId {
        id: string;
      }

      interface HasTimestamp {
        createdAt: Date;
        updatedAt: Date;
      }

      interface HasStatus {
        status: 'active' | 'inactive';
      }

      type Entity = HasId & HasTimestamp & HasStatus;

      const entity: Entity = {
        id: '123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        status: 'active'
      };

      expect(entity.id).toBe('123');
      expect(entity.status).toBe('active');
    });

    it('should show difference between intersection and union', () => {
      // Union: one OR the other
      interface Dog {
        bark(): string;
      }

      interface Cat {
        meow(): string;
      }

      type DogOrCat = Dog | Cat;

      const dog: DogOrCat = {
        bark: () => 'Woof!'
      };

      expect(dog.bark()).toBe('Woof!');

      // Intersection: both AND the other
      type DogAndCat = Dog & Cat;

      const dogAndCat: DogAndCat = {
        bark: () => 'Woof!',
        meow: () => 'Meow!'
      };

      expect(dogAndCat.bark()).toBe('Woof!');
      expect(dogAndCat.meow()).toBe('Meow!');
    });

    it('should handle intersection with object types', () => {
      // ✓ Intersection with object literals
      type Coordinates = { x: number; y: number };
      type Dimensions = { width: number; height: number };

      type Rectangle = Coordinates & Dimensions;

      const rect: Rectangle = {
        x: 10,
        y: 20,
        width: 100,
        height: 50
      };

      expect(rect.x).toBe(10);
      expect(rect.width).toBe(100);
    });
  });

  describe('2. Intersection with Generics', () => {
    it('should use intersection with generic types', () => {
      // ✓ Generic intersection
      interface Identifiable<T> {
        id: T;
      }

      interface Timestamped {
        createdAt: Date;
      }

      type IdentifiedEntity<T> = Identifiable<T> & Timestamped;

      const user: IdentifiedEntity<string> = {
        id: 'user-123',
        createdAt: new Date()
      };

      expect(user.id).toBe('user-123');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should combine multiple generic constraints', () => {
      // ✓ Multiple generic intersections
      interface Serializable {
        toJSON(): string;
      }

      interface Comparable<T> {
        equals(other: T): boolean;
      }

      type SerializableComparable<T> = Serializable & Comparable<T>;

      class User implements SerializableComparable<User> {
        constructor(readonly id: string, readonly name: string) {}

        toJSON(): string {
          return JSON.stringify({ id: this.id, name: this.name });
        }

        equals(other: User): boolean {
          return this.id === other.id;
        }
      }

      const user1 = new User('1', 'Alice');
      const user2 = new User('1', 'Alice');

      expect(user1.equals(user2)).toBe(true);
      expect(user1.toJSON()).toContain('Alice');
    });
  });

  describe('3. Intersection with Function Types', () => {
    it('should create function types with intersection', () => {
      // ✓ Function intersection - combining callable with properties
      interface Metadata {
        name: string;
        version: string;
      }

      type NamedFunction = {
        (): string;
        metadata: Metadata;
      };

      const metadata: Metadata = { name: 'greeting', version: '1.0' };
      const fn = (() => 'Hello') as NamedFunction;
      fn.metadata = metadata;

      expect(fn()).toBe('Hello');
      expect(fn.metadata.name).toBe('greeting');
      expect(fn.metadata.version).toBe('1.0');
    });

    it('should use intersection for function overloading patterns', () => {
      // ✓ Function with additional methods
      interface Logger {
        (message: string): void;
      }

      interface LoggerWithLevels {
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
      }

      type EnhancedLogger = Logger & LoggerWithLevels;

      const logs: string[] = [];

      const logger: EnhancedLogger = Object.assign(
        (message: string) => logs.push(`LOG: ${message}`),
        {
          info: (message: string) => logs.push(`INFO: ${message}`),
          warn: (message: string) => logs.push(`WARN: ${message}`),
          error: (message: string) => logs.push(`ERROR: ${message}`)
        }
      );

      logger('test');
      logger.info('info message');
      logger.error('error message');

      expect(logs).toContain('LOG: test');
      expect(logs).toContain('INFO: info message');
      expect(logs).toContain('ERROR: error message');
    });
  });

  describe('4. Practical Patterns with Intersection', () => {
    it('should use intersection for mixins', () => {
      // ✓ Mixin pattern with intersection
      interface Timestamped {
        createdAt: Date;
        updatedAt: Date;
      }

      interface Authored {
        author: string;
        editor?: string;
      }

      interface Versioned {
        version: number;
      }

      type Document = Timestamped & Authored & Versioned;

      const doc: Document = {
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        author: 'Alice',
        editor: 'Bob',
        version: 3
      };

      expect(doc.author).toBe('Alice');
      expect(doc.version).toBe(3);
    });

    it('should use intersection for composable configurations', () => {
      // ✓ Configuration composition
      interface DatabaseConfig {
        host: string;
        port: number;
        database: string;
      }

      interface SecurityConfig {
        username: string;
        password: string;
        ssl: boolean;
      }

      interface PoolConfig {
        maxConnections: number;
        timeout: number;
      }

      type FullConfig = DatabaseConfig & SecurityConfig & PoolConfig;

      const config: FullConfig = {
        host: 'localhost',
        port: 5432,
        database: 'myapp',
        username: 'admin',
        password: 'secret',
        ssl: true,
        maxConnections: 10,
        timeout: 5000
      };

      expect(config.host).toBe('localhost');
      expect(config.maxConnections).toBe(10);
    });

    it('should use intersection for plugin systems', () => {
      // ✓ Plugin composition
      interface Plugin {
        name: string;
        version: string;
      }

      interface Installable {
        install(): void;
        uninstall(): void;
      }

      interface Configurable {
        configure(options: Record<string, any>): void;
      }

      type FullPlugin = Plugin & Installable & Configurable;

      const plugin: FullPlugin = {
        name: 'MyPlugin',
        version: '1.0.0',
        install: () => {},
        uninstall: () => {},
        configure: (options) => {}
      };

      expect(plugin.name).toBe('MyPlugin');
      expect(typeof plugin.install).toBe('function');
    });
  });

  describe('5. Intersection with Conditional Types', () => {
    it('should use intersection with conditional type narrowing', () => {
      // ✓ Conditional intersection
      interface Animal {
        name: string;
      }

      interface Mammal extends Animal {
        warmBlooded: true;
      }

      interface Bird extends Animal {
        canFly: boolean;
      }

      type MammalAndBird = Mammal & Bird;

      const creature: MammalAndBird = {
        name: 'Bat',
        warmBlooded: true,
        canFly: true
      };

      expect(creature.warmBlooded).toBe(true);
      expect(creature.canFly).toBe(true);
    });

    it('should handle intersection with discriminated unions', () => {
      // ✓ Intersection with discriminated unions
      interface Base {
        id: string;
      }

      type Status = { status: 'pending' } | { status: 'completed'; result: string };

      type Task = Base & Status;

      const pending: Task = {
        id: '1',
        status: 'pending'
      };

      const completed: Task = {
        id: '2',
        status: 'completed',
        result: 'Success'
      };

      expect(pending.status).toBe('pending');
      expect(completed.status).toBe('completed');
      if (completed.status === 'completed') {
        expect(completed.result).toBe('Success');
      }
    });
  });

  describe('6. Advanced Intersection Patterns', () => {
    it('should use intersection for type-safe builders', () => {
      // ✓ Builder with intersection
      interface BuilderStep1 {
        withName(name: string): BuilderStep2;
      }

      interface BuilderStep2 {
        withEmail(email: string): BuilderStep3;
      }

      interface BuilderStep3 {
        build(): User;
      }

      interface User {
        name: string;
        email: string;
      }

      class UserBuilder implements BuilderStep1 {
        private name: string = '';
        private email: string = '';

        withName(name: string): BuilderStep2 {
          this.name = name;
          return this as any;
        }

        withEmail(email: string): BuilderStep3 {
          this.email = email;
          return this as any;
        }

        build(): User {
          return { name: this.name, email: this.email };
        }
      }

      const user = new UserBuilder()
        .withName('Alice')
        .withEmail('alice@example.com')
        .build();

      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
    });

    it('should use intersection for middleware composition', () => {
      // ✓ Middleware with intersection
      interface Request {
        url: string;
        method: string;
      }

      interface AuthenticatedRequest extends Request {
        userId: string;
      }

      interface LoggedRequest extends Request {
        requestId: string;
        timestamp: Date;
      }

      type FullRequest = AuthenticatedRequest & LoggedRequest;

      const request: FullRequest = {
        url: '/api/users',
        method: 'GET',
        userId: 'user-123',
        requestId: 'req-456',
        timestamp: new Date()
      };

      expect(request.userId).toBe('user-123');
      expect(request.requestId).toBe('req-456');
    });

    it('should use intersection for capability-based types', () => {
      // ✓ Capability composition
      interface Readable {
        read(): string;
      }

      interface Writable {
        write(data: string): void;
      }

      interface Seekable {
        seek(position: number): void;
      }

      type FileHandle = Readable & Writable & Seekable;

      const data: string[] = [];

      const file: FileHandle = {
        read: () => data[0] || '',
        write: (d) => data.push(d),
        seek: (pos) => {}
      };

      file.write('Hello');
      expect(file.read()).toBe('Hello');
    });
  });

  describe('7. Intersection Edge Cases', () => {
    it('should handle intersection with conflicting properties', () => {
      // ⚠ Conflicting types become never
      interface A {
        value: string;
      }

      interface B {
        value: number;
      }

      type Conflict = A & B;

      // value is never because it can't be both string and number
      const obj: Conflict = {
        value: 'test' as never
      };

      expect(obj.value).toBe('test');
    });

    it('should use intersection to narrow types', () => {
      // ✓ Intersection narrows to more specific type
      interface Vehicle {
        wheels: number;
      }

      interface Car extends Vehicle {
        doors: number;
      }

      type SpecificCar = Vehicle & Car;

      const car: SpecificCar = {
        wheels: 4,
        doors: 4
      };

      expect(car.wheels).toBe(4);
      expect(car.doors).toBe(4);
    });

    it('should handle intersection with optional properties', () => {
      // ✓ Optional properties in intersection
      interface Base {
        id: string;
      }

      interface Optional {
        description?: string;
        tags?: string[];
      }

      type Item = Base & Optional;

      const item1: Item = { id: '1' };
      const item2: Item = { id: '2', description: 'Test', tags: ['a', 'b'] };

      expect(item1.id).toBe('1');
      expect(item2.description).toBe('Test');
    });
  });

  describe('8. Checkpoint 🫵', () => {
    it('E.1: Explain when to use intersection vs union', () => {
      // Write your answer:
      // Intersection (A & B): Use when you need BOTH types
      // - Combining multiple interfaces into one
      // - Mixins and composition
      // - Adding capabilities to existing types
      // - Plugin systems
      //
      // Union (A | B): Use when you need ONE of the types
      // - Discriminated unions for state machines
      // - Optional alternatives
      // - Polymorphic behavior

      expect(true).toBe(true);
    });

    it('E.2: Design a type system for a rich text editor', () => {
      // Write your implementation:
      interface Selectable {
        isSelected: boolean;
        select(): void;
      }

      interface Editable {
        content: string;
        edit(newContent: string): void;
      }

      interface Deletable {
        delete(): void;
      }

      interface Copyable {
        copy(): string;
      }

      type RichElement = Selectable & Editable & Deletable & Copyable;

      const element: RichElement = {
        isSelected: true,
        content: 'Hello',
        select: () => {},
        edit: (c) => {},
        delete: () => {},
        copy: () => 'Hello'
      };

      expect(element.content).toBe('Hello');
      expect(element.copy()).toBe('Hello');
    });

    it('E.3: Create a type-safe API response handler', () => {
      // Write your implementation:
      interface ApiResponse {
        status: number;
        timestamp: Date;
      }

      interface SuccessResponse {
        ok: true;
        data: any;
      }

      interface ErrorResponse {
        ok: false;
        error: string;
      }

      type FullResponse = ApiResponse & (SuccessResponse | ErrorResponse);

      const success: FullResponse = {
        status: 200,
        timestamp: new Date(),
        ok: true,
        data: { id: '1' }
      };

      const error: FullResponse = {
        status: 400,
        timestamp: new Date(),
        ok: false,
        error: 'Invalid request'
      };

      expect(success.ok).toBe(true);
      expect(error.ok).toBe(false);
    });

    it('E.4: Implement a composable validation system', () => {
      // Write your implementation:
      interface Validator<T> {
        validate(value: T): boolean;
      }

      interface Reporter {
        report(message: string): void;
      }

      interface Logger {
        log(message: string): void;
      }

      type FullValidator<T> = Validator<T> & Reporter & Logger;

      const messages: string[] = [];
      const logs: string[] = [];

      const validator: FullValidator<string> = {
        validate: (value) => value.length > 0,
        report: (msg) => messages.push(msg),
        log: (msg) => logs.push(msg)
      };

      validator.validate('test');
      validator.report('Validation passed');
      validator.log('Processing complete');

      expect(messages).toContain('Validation passed');
      expect(logs).toContain('Processing complete');
    });
  });
});
