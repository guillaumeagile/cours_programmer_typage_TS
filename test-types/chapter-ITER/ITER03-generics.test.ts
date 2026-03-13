describe('Generics', () => {
    // INTRO: What are Generics?
    // Generics allow you to write reusable code that works with any type.
    // Instead of hardcoding a specific type, you use a type variable (T, U, etc.)
    // that gets filled in when the code is used.
    //
    // Use cases:
    // - Create flexible data structures (Box<T>, Array<T>)
    // - Write functions that work with any type
    // - Maintain type safety while avoiding duplication
    // - Build libraries that adapt to user-provided types
    //
    // Syntax: <T> declares a type variable, T can be any name

    describe('1. Basic Generic Type', () => {
        // T is a type variable that gets replaced with actual type
        type Box<T> = {
            value: T;
        };

        it('should work with string type', () => {
            const box: Box<string> = { value: 'hello' };
            expect(box.value).toBe('hello');
        });

        it('should work with number type', () => {
            const box: Box<number> = { value: 42 };
            expect(box.value).toBe(42);
        });

        it('should work with any type', () => {
            const box: Box<{ id: number }> = { value: { id: 1 } };
            expect(box.value.id).toBe(1);
        });
    });

    describe('2. Generic Functions', () => {
        // Function that works with any type
        function identity<T>(value: T): T {
            return value;
        }

        it('should preserve type for strings', () => {
            const result = identity('hello');
            expect(result).toBe('hello');
        });

        it('should preserve type for numbers', () => {
            const result = identity(42);
            expect(result).toBe(42);
        });

        it('should infer type from argument', () => {
            const result = identity({ name: 'Alice' });
            expect(result.name).toBe('Alice');
        });
    });

    describe('3. Multiple Type Variables', () => {
        // Use multiple type variables for different parts
        type Pair<T, U> = {
            first: T;
            second: U;
        };

        it('should support different types for each variable', () => {
            const pair: Pair<string, number> = {
                first: 'Alice',
                second: 30
            };
            expect(pair.first).toBe('Alice');
            expect(pair.second).toBe(30);
        });

        function swap<T, U>(pair: Pair<T, U>): Pair<U, T> {
            return {
                first: pair.second,
                second: pair.first
            };
        }

        it('should swap types in function', () => {
            const original: Pair<string, number> = { first: 'test', second: 42 };
            const swapped = swap(original);
            expect(swapped.first).toBe(42);
            expect(swapped.second).toBe('test');
        });
    });

    describe('4. Generic Constraints', () => {
        // Restrict what types T can be
        type HasLength<T extends { length: number }> = {
            value: T;
            getLength(): number;
        };

        //because string already has length property !!!
        it('should work with string (has length)', () => {
            const obj: HasLength<string> = {
                value: 'hello',
                getLength() { return this.value.length; }
            };
            expect(obj.getLength()).toBe(5);
        });

        //should not work with some object that does not have length property
        type noLength = {
            value: string;
        };


        it('should work with array (has length)', () => {
            const obj: HasLength<number[]> = {
                value: [1, 2, 3],
                getLength() { return this.value.length; }
            };
            expect(obj.getLength()).toBe(3);
        });

        // Constraint with extends keyword
        function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
            return obj[key];
        }

        it('should enforce key exists on object', () => {
            const user = { name: 'Alice', age: 30 };
            const name = getProperty(user, 'name');
            expect(name).toBe('Alice');
        });
    });

    describe('5. Generic Defaults', () => {
        // Provide default type if not specified
        type Container<T = string> = {      //replace string by number
            value: T;
        };

        it('should use default type when not specified', () => {
            const container: Container = { value: 'default' };
            expect(container.value).toBe('default');
        });

        it('should use provided type when specified', () => {
            const container: Container<number> = { value: 42 };
            expect(container.value).toBe(42);
        });
    });

    describe('6. Generic Arrays', () => {
        // Array<T> is a generic type
        type Collection<T> = {
            items: T[];
            add(item: T): void;
            getFirst(): T | undefined;
        };

        it('should work with string array', () => {
            const collection: Collection<string> = {
                items: [],
                add(item) { this.items.push(item); },
                getFirst() { return this.items[0]; }
            };
            collection.add('hello');
            expect(collection.getFirst()).toBe('hello');
        });

        it('should work with object array', () => {
            const collection: Collection<{ id: number }> = {
                items: [],
                add(item) { this.items.push(item); },
                getFirst() { return this.items[0]; }
            };
            collection.add({ id: 1 });
            expect(collection.getFirst()?.id).toBe(1);
        });
    });

    describe('7. Generic Extends with Union', () => {
        // Constrain to specific types
        type Numeric<T extends number | bigint> = {
            value: T;
        };

        it('should accept number', () => {
            const num: Numeric<number> = { value: 42 };
            expect(num.value).toBe(42);
        });

        it('should accept bigint', () => {
            const big: Numeric<bigint> = { value: 100n };
            expect(big.value).toBe(100n);
        });
    });

    describe('8.intro Indexed Access Types - Access property types by key', () => {
        // Indexed Access Type: T[K] gets the type of property K in type T
        // Similar to accessing object properties at runtime, but at the type level
        
        it('should access property type by key', () => {
            type User = { name: string; age: number };
            
            // T[K] syntax: get the type of property K from type T
            type NameType = User['name'];      // resolves to: string
            type AgeType = User['age'];        // resolves to: number
            
            const name: NameType = 'Alice';
            const age: AgeType = 30;
            
            expect(typeof name).toBe('string');
            expect(typeof age).toBe('number');
        });

        it('should work with union of keys', () => {
            type Product = { id: number; title: string; price: number };
            
            // Access multiple properties at once
            type ProductValue = Product['id' | 'price'];  // number | number = number
            
            const value1: ProductValue = 123;
            const value2: ProductValue = 99.99;
            
            expect(typeof value1).toBe('number');
            expect(typeof value2).toBe('number');
        });

        it('should work with keyof to get all property types', () => {
            type Settings = { theme: 'light' | 'dark'; fontSize: number };
            
            // T[keyof T] gets union of all property types
            type SettingValue = Settings[keyof Settings];  // 'light' | 'dark' | number
            
            const val1: SettingValue = 'light';
            const val2: SettingValue = 16;
            
            expect(val1).toBe('light');
            expect(val2).toBe(16);
        });

        it('should work with generic constraints', () => {
            // Get type of a specific property from generic type T
            function getPropertyType<T, K extends keyof T>(obj: T, key: K): T[K] {
                return obj[key];
            }
            
            const user = { name: 'Alice', age: 30 };
            const name = getPropertyType(user, 'name');  // type: string
            const age = getPropertyType(user, 'age');    // type: number
            
            expect(name).toBe('Alice');
            expect(age).toBe(30);
        });

        it('should work with array element types', () => {
            type StringArray = string[];
            
            // Get element type of array
            type ElementType = StringArray[number];  // resolves to: string
            
            const element: ElementType = 'hello';
            expect(typeof element).toBe('string');
        });

        it('should chain indexed access', () => {
            type Nested = {
                user: { name: string; profile: { bio: string } }
            };
            
            // Chain multiple indexed accesses
            type UserType = Nested['user'];                    // { name: string; profile: { bio: string } }
            type ProfileType = Nested['user']['profile'];      // { bio: string }
            type BioType = Nested['user']['profile']['bio'];   // string
            
            const bio: BioType = 'Software engineer';
            expect(typeof bio).toBe('string');
        });
    });

    describe('8. Generic with Keyof', () => {
        // keyof T gets all keys of type T
        // K extends keyof T ensures K is a valid key of T
        type Getter<T, K extends keyof T> = {
            get(): T[K];
        };

        it('should access property by key', () => {
            type User = { name: string; age: number };
            const getter: Getter<User, 'name'> = {
                get() { return 'Alice'; }
            };
            expect(getter.get()).toBe('Alice');
        });

        it('should work with different type of keys', () => {
            type Product = { id: number; title: string; price: number };
            const idGetter: Getter<Product, 'id'> = {
                get() { return 123; }
            };
            const priceGetter: Getter<Product, 'price'> = {
                get() { return 29.99; }
            };
            expect(idGetter.get()).toBe(123);
            expect(priceGetter.get()).toBe(29.99);
            // returned type adapts itself to the type of the property
            const titleGetter: Getter<Product, 'title'> = {
                get() { return "test"; }
            };
            //should not work with a key that is not a valid key of T

        });

        // Practical: Get and Set with type safety
        type GetterSetter<T, K extends keyof T> = {
            get(): T[K];
            set(value: T[K]): void;
        };
/*
        it('should enforce type safety on set', () => {
            type Config = { timeout: number; debug: boolean };
            const setter: GetterSetter<Config, 'timeout'> = {
                value: 5000,
                get() { return this.value; },
                set(v) { this.value = v; }
            };
            setter.set(10000);
            expect(setter.get()).toBe(10000);
        });
*/
        // Practical: Pick specific properties
        type Pick<T, K extends keyof T> = {
            [P in K]: T[P];
        };

        it('should pick subset of properties', () => {
            type User = { id: number; name: string; email: string; password: string };
            type PublicUser = Pick<User, 'id' | 'name' | 'email'>;
            const user: PublicUser = {
                id: 1,
                name: 'Alice',
                email: 'alice@example.com'
            };
            expect(user.name).toBe('Alice');
        });

        // Practical: Record - map keys to values
        type Record<K extends string | number | symbol, T> = {
            [P in K]: T;
        };

        it('should create record from keys', () => {
            type Status = 'pending' | 'approved' | 'rejected';
            type StatusMessages = Record<Status, string>;
            const messages: StatusMessages = {
                pending: 'Waiting for review',
                approved: 'Request approved',
                rejected: 'Request denied'
            };
            expect(messages.approved).toBe('Request approved');
        });

        // Practical: Extract value types
        type ValueOf<T> = T[keyof T];

        it('should extract all value types from object', () => {
            type Settings = { theme: 'light' | 'dark'; fontSize: number };
            type SettingValue = ValueOf<Settings>;
            const value1: SettingValue = 'light';
            const value2: SettingValue = 16;
            expect(value1).toBe('light');
            expect(value2).toBe(16);
        });

        // Practical: Ensure all keys are handled
        function handleAllKeys<T>(obj: T, handler: (key: keyof T, value: T[keyof T]) => void) {
            for (const key in obj) {
                handler(key as keyof T, obj[key]);
            }
        }

        it('should iterate all keys with type safety', () => {
            const user = { name: 'Alice', age: 30 };
            const results: string[] = [];
            handleAllKeys(user, (key, value) => {
                results.push(`${String(key)}: ${value}`);
            });
            expect(results).toContain('name: Alice');
            expect(results).toContain('age: 30');
        });
    });

    describe('9. Generic Classes', () => {
        // Classes can be generic
        class Stack<T> {
            private items: T[] = [];

            push(item: T) {
                this.items.push(item);
            }

            pop(): T | undefined {
                return this.items.pop();
            }

            peek(): T | undefined {
                return this.items[this.items.length - 1];
            }
        }

        it('should work with string stack', () => {
            const stack = new Stack<string>();
            stack.push('a');
            stack.push('b');
            expect(stack.peek()).toBe('b');
            expect(stack.pop()).toBe('b');
        });

        it('should work with number stack', () => {
            const stack = new Stack<number>();
            stack.push(1);
            stack.push(2);
            expect(stack.peek()).toBe(2);
        });
    });

    describe('10. Generic Recursive Types', () => {
        // Generics can reference themselves
        type Tree<T> = {
            value: T;
            children: Tree<T>[];
        };

        it('should create tree structure', () => {
            const tree: Tree<number> = {
                value: 1,
                children: [
                    { value: 2, children: [] },
                    { value: 3, children: [] }
                ]
            };
            expect(tree.value).toBe(1);
            expect(tree.children[0].value).toBe(2);
        });
    });

    describe('11. Practical: Generic API Response', () => {
        // Common pattern: generic response wrapper
        type ApiResponse<T> = {
            status: number;
            data: T;
            timestamp: Date;
        };

        it('should wrap different data types', () => {
            const userResponse: ApiResponse<{ id: number; name: string }> = {
                status: 200,
                data: { id: 1, name: 'Alice' },
                timestamp: new Date()
            };
            expect(userResponse.data.name).toBe('Alice');

            const listResponse: ApiResponse<string[]> = {
                status: 200,
                data: ['a', 'b', 'c'],
                timestamp: new Date()
            };
            expect(listResponse.data.length).toBe(3);
        });
    });

    describe('12. Practical: Generic Mapper Function', () => {
        // Transform from one type to another
        function map<T, U>(value: T, transform: (t: T) => U): U {
            return transform(value);
        }

        it('should transform types', () => {
            const result = map(42, (n) => n.toString());
            expect(result).toBe('42');

            const result2 = map('hello', (s) => s.length);
            expect(result2).toBe(5);
        });
    });
});
