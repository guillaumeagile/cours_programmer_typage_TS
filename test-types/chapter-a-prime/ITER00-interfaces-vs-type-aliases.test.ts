describe('Interfaces vs. Type Aliases', () => {
    describe('1. Basic Definition - Both can define object shapes', () => {
        interface UserInterface {
            id: number;
            name: string;
            email: string;
        }

        type UserType = {
            id: number;
            name: string;
            email: string;
        };

        it('should accept objects matching interface shape', () => {
            const user1: UserInterface = {
                id: 1,
                name: 'Alice',
                email: 'alice@example.com'
            };
            expect(user1.id).toBe(1);
        });

        it('should accept objects matching type alias shape', () => {
            const user2: UserType = {
                id: 2,
                name: 'Bob',
                email: 'bob@example.com'
            };
            expect(user2.id).toBe(2);
        });
    });

    describe('2. Key Difference: Extendability (Re-opening)', () => {
        interface Animal {
            name: string;
        }

        interface Animal {
            age: number;
        }

        it('interface can be re-opened and extended', () => {
            const dog: Animal = {
                name: 'Buddy',
                age: 5
            };
            expect(dog.name).toBe('Buddy');
            expect(dog.age).toBe(5);
        });

        it('type alias CANNOT be re-opened - this would cause a compile error', () => {
            type Vehicle = {
                brand: string;
            };

        /*    type Vehicle = {
                model: string;
            };
*/
            const car: Vehicle = {
                brand: 'Toyota',
           //    model: 'Camry'
            };
            expect(car.brand).toBe('Toyota');
        });
    });

    describe('3. Extension/Inheritance', () => {
        interface Shape {
            color: string;
        }

        interface Circle extends Shape {
            radius: number;
        }

        it('interface can extend another interface', () => {
            const circle: Circle = {
                color: 'red',
                radius: 10
            };
            expect(circle.color).toBe('red');
            expect(circle.radius).toBe(10);
        });

        type Polygon = {
            sides: number;
        };

        type Triangle = Polygon & {
            height: number;
        };

        it('type alias can extend using intersection (&)', () => {
            const tri: Triangle = {
                sides: 3,
                height: 5
            };
            expect(tri.sides).toBe(3);
            expect(tri.height).toBe(5);
        });
    });

    describe('4. Union Types - Only Type Aliases can do it at top level', () => {
        // Type aliases can define a type that IS a union of multiple options
        type Status = 'pending' | 'approved' | 'rejected';

        it('type alias can define union types at top level', () => {
            // Status itself is a union - can be one of three literal values
            const status: Status = 'approved';
            expect(status).toBe('approved');

            // This would fail - 'pending2' is not in the union
            // const status2: Status = 'pending2';
        });

        // Interfaces CANNOT define a union at the top level
        // You cannot write:
    // interface Status = 'pending' | 'approved' | 'rejected';
        // This is a syntax error - interfaces define object shapes, not unions

        it('interface can have union properties, but not be a union itself', () => {
            // This is NOT a union type - it's an interface with a property that can be multiple types
            interface Result {
                value: string | number;  // Union inside property - allowed
            }

            const result: Result = {
                value: 42   // you can assign either a string or a number
            };
            expect(result.value).toBe(42);
        });

        it('to create union of different shapes, must use type alias', () => {
            // This is what you CANNOT do with interfaces:
            // A type that is EITHER shape A OR shape B
            type ApiResponse =
                | { status: 'success'; data: string }
                | { status: 'error'; message: string };

            const success: ApiResponse = { status: 'success', data: 'hello' };
            const error: ApiResponse = { status: 'error', message: 'failed' };

            expect(success.status).toBe('success');
            expect(error.status).toBe('error');
        });
    });

    describe('5. Tuple Types - Only Type Aliases', () => {
        type Coordinate = [number, number];

        it('type alias can define tuple types', () => {
            const point: Coordinate = [10, 20];
            expect(point[0]).toBe(10);
            expect(point[1]).toBe(20);
        });
    });

    describe('6. Primitive Types - Only Type Aliases', () => {
        type ID = string | number;
        type Percentage = number;

        it('type alias can alias primitive types', () => {
            const userId: ID = 'user-123';
            const progress: Percentage = 75;
            expect(userId).toBe('user-123');
            expect(progress).toBe(75);
        });
    });



    describe('8. Practical Example: When to use each', () => {
        interface DatabaseConnection {
            host: string;
            port: number;
            connect(): Promise<void>;
        }

        it('interface is good for contracts/classes', () => {
            class PostgresConnection implements DatabaseConnection {
                host = 'localhost';
                port = 5432;
                async connect() {
                    return Promise.resolve();
                }
            }

            const conn = new PostgresConnection();
            expect(conn.host).toBe('localhost');
        });

        type ApiResponse<T> = {
            status: number;
            data: T;
            timestamp: Date;
        };

        it('type alias is good for data structures and generics', () => {
            const response: ApiResponse<{ id: number }> = {
                status: 200,
                data: { id: 1 },
                timestamp: new Date()
            };
            expect(response.status).toBe(200);
        });
    });

    describe('9. Summary: Key Differences', () => {
        it('interfaces can be re-opened and declaration-merged', () => {
            interface Logger {
                log(msg: string): void;
            }

            interface Logger {
                error(msg: string): void;
            }

            const logger: Logger = {
                log: (msg) => console.log(msg),
                error: (msg) => console.error(msg)
            };

            expect(typeof logger.log).toBe('function');
            expect(typeof logger.error).toBe('function');
        });

        it('type aliases cannot be re-opened', () => {
            type Reader = {
                read(): string;
            };

            const reader: Reader = {
                read: () => 'content'
            };

            expect(reader.read()).toBe('content');
        });

        it('type aliases support unions, tuples, and primitives', () => {
            type Flexible = string | number | boolean;
            type Pair = [string, number];
            type UserId = string;

            const val1: Flexible = 'text';
            const val2: Pair = ['id', 123];
            const val3: UserId = 'user-1';

            expect(val1).toBe('text');
            expect(val2[0]).toBe('id');
            expect(val3).toBe('user-1');
        });
    });
});
