describe('Mapped Types', () => {
    // INTRO: What are Mapped Types?
    // Mapped types allow you to create new types by transforming properties of existing types.
    // Syntax: { [K in keyof T]: ... } iterates over all keys of T and transforms each property.
    //
    // Use cases:
    // - Make all properties readonly or optional
    // - Convert properties to different types (string → number, T → T[])
    // - Create getters/setters for all properties
    // - Build utility types that adapt to any input type
    // - Generate type-safe wrappers around existing types

    describe('1. Basic Mapped Type - Make All Properties Readonly', () => {
        // [K in keyof T] iterates over each key K in T
        // readonly T[K] makes each property readonly
        type Readonly<T> = {
            readonly [K in keyof T]: T[K];
        };

        it('should make properties readonly', () => {
            type User = { name: string; age: number };
            const user0: User = { name: 'Alice', age: 30 };
            user0.name = 'Bob';

            type ReadonlyUser = Readonly<User>;
            const user: ReadonlyUser = { name: 'Alice', age: 30 };
            expect(user.name).toBe('Alice');
         //   user.name = 'Bob';
        });
    });

    describe('2. Make All Properties Optional', () => {
        // ? makes each property optional
        type Partial<T> = {
            [K in keyof T]?: T[K];
        };

        it('should make properties optional', () => {
            type Config = { host: string; port: number; timeout: number };
            type PartialConfig = Partial<Config>;
            const config: PartialConfig = { host: 'localhost' };
            expect(config.host).toBe('localhost');
            expect(config.port).toBeUndefined();
        });
    });

    describe('3. Make All Properties Required', () => {
        // Remove ? from optional properties
        type Required<T> = {
            [K in keyof T]-?: T[K];
        };

        it('should make optional properties required', () => {
            type User = { name?: string; age?: number };
            const user0:  User = { age: 25 };

            type RequiredUser = Required<User>;
            const user: RequiredUser = { name: 'Bob', age: 25 };
          //  const user2: RequiredUser = { age: 25 };
            expect(user.name).toBe('Bob');
            expect(user.age).toBe(25);
        });
    });

    describe('4. Transform Properties to Arrays', () => {
        // T[K][] wraps each property type in array
        type ToArrays<T> = {
            [K in keyof T]: T[K][];
        };

        it('should convert all properties to arrays', () => {
            type Numbers = { x: number; y: number };
            type ArrayNumbers = ToArrays<Numbers>;
            const arrays: ArrayNumbers = { x: [1, 2, 3], y: [4, 5, 6] };
            expect(arrays.x).toEqual([1, 2, 3]);
            expect(arrays.y.length).toBe(3);
        });
    });

    describe('5. Transform Properties to Getters', () => {
        // Create getter function for each property
        type Getters<T> = {
            [K in keyof T]: () => T[K];
        };

        it('should create getter functions', () => {
            type User = { name: string; age: number };
            type UserGetters = Getters<User>;
            const getters: UserGetters = {
                name: () => 'Alice',
                age: () => 30
            };
            expect(getters.name()).toBe('Alice');
            expect(getters.age()).toBe(30);
        });
    });

    describe('6. Transform Properties to Setters', () => {
        // Create setter function for each property
        type Setters<T> = {
            [K in keyof T]: (value: T[K]) => void;
        };

        it('should create setter functions', () => {
            type Config = { timeout: number; debug: boolean };
            type ConfigSetters = Setters<Config>;
            const state = { timeout: 5000, debug: false };
            const setters: ConfigSetters = {
                timeout: (v) => { state.timeout = v; },
                debug: (v) => { state.debug = v; }
            };
            setters.timeout(10000);
            expect(state.timeout).toBe(10000);
        });
    });

    describe('7. Pick Properties by Type', () => {
        // Select only properties matching a specific type
        type PickByType<T, U> = {
            [K in keyof T as T[K] extends U ? K : never]: T[K];
        };

        it('should pick only string properties', () => {
            type User = { name: string; age: number; email: string };
            type StringProps = PickByType<User, string>;
            const strings: StringProps = { name: 'Alice', email: 'alice@example.com' };
            expect(strings.name).toBe('Alice');
        });

        it('should pick only number properties', () => {
            type Stats = { name: string; score: number; level: number };
            type NumberProps = PickByType<Stats, number>;
            const numbers: NumberProps = { score: 100, level: 5 };
            expect(numbers.score).toBe(100);
        });
    });

    describe('8. Rename Properties with As Clause', () => {
        // Use 'as' to rename keys during mapping
        type Getters2<T> = {
            [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
        };

        it('should rename properties to getter methods', () => {
            type User = { name: string; age: number };
            type UserGetters = Getters2<User>;
            const getters: UserGetters = {
                getName: () => 'Alice',
                getAge: () => 30
            };
            expect(getters.getName()).toBe('Alice');
            expect(getters.getAge()).toBe(30);
        });
    });

    describe('9. Filter Out Properties', () => {
        // Use 'never' to exclude properties
        type Omit<T, K extends keyof T> = {
            [P in keyof T as P extends K ? never : P]: T[P];
        };

        it('should omit specified properties', () => {
            type User = { id: number; name: string; password: string };
            type PublicUser = Omit<User, 'password'>;
            const user: PublicUser = { id: 1, name: 'Alice' };
            expect(user.name).toBe('Alice');
        });
    });

    describe('10. Add Prefix to All Keys', () => {
        // Template literal to add prefix
        type WithPrefix<T, P extends string> = {
            [K in keyof T as `${P}${string & K}`]: T[K];
        };

        it('should add prefix to property names', () => {
            type User = { name: string; age: number };
            type PrefixedUser = WithPrefix<User, 'user_'>;
            const user: PrefixedUser = { user_name: 'Alice', user_age: 30 };
            expect(user.user_name).toBe('Alice');
        });
    });

    describe('11. Create Nullable Version', () => {
        // Make all properties nullable
        type Nullable<T> = {
            [K in keyof T]: T[K] | null;
        };

        it('should make all properties nullable', () => {
            type User = { name: string; age: number };
            type NullableUser = Nullable<User>;
            const user: NullableUser = { name: 'Alice', age: null };
            expect(user.name).toBe('Alice');
            expect(user.age).toBeNull();
        });
    });

    describe('12. Practical: API Response Wrapper', () => {
        // Wrap all properties in Promise
        type Async<T> = {
            [K in keyof T]: Promise<T[K]>;
        };

        it('should wrap properties in Promise', () => {
            type User = { id: number; name: string };
            type AsyncUser = Async<User>;
            const asyncUser: AsyncUser = {
                id: Promise.resolve(1),
                name: Promise.resolve('Alice')
            };
            expect(asyncUser.id).toBeInstanceOf(Promise);
        });
    });

    describe('13. Practical: Validation Schema', () => {
        // Create validator for each property
        type Validators<T> = {
            [K in keyof T]: (value: T[K]) => boolean;
        };

        it('should create validators for each property', () => {
            type User = { name: string; age: number };
            type UserValidators = Validators<User>;
            const validators: UserValidators = {
                name: (v) => v.length > 0,
                age: (v) => v >= 0 && v <= 150
            };
            expect(validators.name('Alice')).toBe(true);
            expect(validators.age(30)).toBe(true);
            expect(validators.age(200)).toBe(false);
        });
    });

    describe('14. Practical: Database Model to API Response', () => {
        // Transform database model to API response
        type ToResponse<T> = {
            [K in keyof T]: {
                value: T[K];
                updated: Date;
            };
        };

        it('should wrap properties with metadata', () => {
            type Product = { name: string; price: number };
            type ProductResponse = ToResponse<Product>;
            const response: ProductResponse = {
                name: { value: 'Laptop', updated: new Date() },
                price: { value: 999.99, updated: new Date() }
            };
            expect(response.name.value).toBe('Laptop');
            expect(response.price.value).toBe(999.99);
        });
    });

    describe('15. Combining Mapped Types', () => {
        // Chain multiple transformations
        type ReadonlyPartial<T> = {
            readonly [K in keyof T]?: T[K];
        };

        it('should apply multiple transformations', () => {
            type Config = { host: string; port: number };
            type ReadonlyPartialConfig = ReadonlyPartial<Config>;
            const config: ReadonlyPartialConfig = { host: 'localhost' };
            expect(config.host).toBe('localhost');
            expect(config.port).toBeUndefined();
        });
    });
});
