describe('Tuple Types', () => {
    describe('1. Basic Tuple - Fixed length and types', () => {
        type Coordinate = [number, number];

        it('should accept tuple with exact types and length', () => {
            const point: Coordinate = [10, 20];
            expect(point[0]).toBe(10);
            expect(point[1]).toBe(20);
        });

        it('should enforce type checking on each position', () => {
            const point: Coordinate = [5, 15];
            const x: number = point[0];
            const y: number = point[1];
            expect(x + y).toBe(20);
        });

        it('should reject wrong types at positions', () => {
            const point: Coordinate = [10, 20];
            expect(point.length).toBe(2);
        });
    });

    describe('2. Tuples with Different Types', () => {
        type UserRecord = [string, number, boolean];

        it('should support different types at each position', () => {
            const user: UserRecord = ['Alice', 30, true];
            expect(user[0]).toBe('Alice');
            expect(user[1]).toBe(30);
            expect(user[2]).toBe(true);
        });

        it('should enforce type at each position', () => {
            const user: UserRecord = ['Bob', 25, false];
            const name: string = user[0];
            const age: number = user[1];
            const active: boolean = user[2];
            expect(name).toBe('Bob');
            expect(age).toBe(25);
            expect(active).toBe(false);
        });
    });

    describe('3. Optional Elements in Tuples', () => {
        type Response = [number, string?];

        it('should allow omitting optional elements', () => {
            const success: Response = [200];
            expect(success[0]).toBe(200);
            expect(success[1]).toBeUndefined();
        });

        it('should allow including optional elements', () => {
            const error: Response = [404, 'Not Found'];
            expect(error[0]).toBe(404);
            expect(error[1]).toBe('Not Found');
        });
    });

    describe('4. Rest Elements in Tuples', () => {
        type StringNumberBooleans = [string, number, ...boolean[]];

        it('should support rest elements for variable length', () => {
            const data1: StringNumberBooleans = ['test', 42];
            expect(data1[0]).toBe('test');
            expect(data1[1]).toBe(42);
        });

        it('should allow multiple rest elements', () => {
            const data2: StringNumberBooleans = ['test', 42, true, false, true];
            expect(data2[0]).toBe('test');
            expect(data2[1]).toBe(42);
            expect(data2[2]).toBe(true);
            expect(data2[3]).toBe(false);
            expect(data2[4]).toBe(true);
        });
    });

    describe('5. Labeled Tuples', () => {
        type Range = [start: number, end: number];

        it('should provide semantic meaning with labels', () => {
            const range: Range = [1, 100];
            expect(range[0]).toBe(1);
            expect(range[1]).toBe(100);
        });

        type ApiCall = [method: string, url: string, status: number];

        it('should support multiple labeled elements', () => {
            const call: ApiCall = ['GET', 'https://api.example.com', 200];
            expect(call[0]).toBe('GET');
            expect(call[1]).toBe('https://api.example.com');
            expect(call[2]).toBe(200);
        });
    });



    describe('7. Readonly Tuples', () => {
        type ReadonlyCoordinate = readonly [number, number];

        it('should prevent modification of readonly tuple', () => {
            const point: ReadonlyCoordinate = [10, 20];
            expect(point[0]).toBe(10);
            expect(point[1]).toBe(20);
        });

        it('should be assignable from mutable tuple', () => {
            const mutable: [number, number] = [5, 15];
            const readonly: ReadonlyCoordinate = mutable;
            expect(readonly[0]).toBe(5);
        });
    });

    describe('8. Tuple Destructuring', () => {
        type Point = [x: number, y: number];

        it('should support destructuring assignment', () => {
            const point: Point = [10, 20];
            const [x, y] = point;
            expect(x).toBe(10);
            expect(y).toBe(20);
        });

        it('should support partial destructuring', () => {
            const point: Point = [5, 15];
            const [x] = point;
            expect(x).toBe(5);
        });

        it('should support rest in destructuring', () => {
            type Data = [string, ...number[]];
            const data: Data = ['values', 1, 2, 3];
            const [label, ...numbers] = data;
            expect(label).toBe('values');
            expect(numbers).toEqual([1, 2, 3]);
        });
    });

    describe('9. Tuple in Function Parameters', () => {
        type RGB = [red: number, green: number, blue: number];

        function setColor(color: RGB): string {
            const [r, g, b] = color;
            return `rgb(${r}, ${g}, ${b})`;
        }

        it('should accept tuple as function parameter', () => {
            const result = setColor([255, 128, 0]);
            expect(result).toBe('rgb(255, 128, 0)');
        });

        it('should enforce tuple structure in function calls', () => {
            const color: RGB = [100, 150, 200];
            const result = setColor(color);
            expect(result).toBe('rgb(100, 150, 200)');
        });
    });

    describe('10. Tuple Return Types', () => {
        function parseCoordinate(input: string): [number, number] {
            const parts = input.split(',');
            return [parseInt(parts[0]), parseInt(parts[1])];
        }

        it('should return tuple from function', () => {
            const [x, y] = parseCoordinate('10,20');
            expect(x).toBe(10);
            expect(y).toBe(20);
        });

        function divideWithRemainder(a: number, b: number): [quotient: number, remainder: number] {
            return [Math.floor(a / b), a % b];
        }

        it('should support labeled tuple return types', () => {
            const [q, r] = divideWithRemainder(17, 5);
            expect(q).toBe(3);
            expect(r).toBe(2);
        });
    });

    describe('11. Practical Examples', () => {
        type HttpResponse = [status: number, data: unknown, headers?: Record<string, string>];

        it('should model HTTP responses with optional headers', () => {
            const response1: HttpResponse = [200, { id: 1, name: 'Alice' }];
            expect(response1[0]).toBe(200);
            expect(response1[2]).toBeUndefined();

            const response2: HttpResponse = [404, null, { 'content-type': 'application/json' }];
            expect(response2[0]).toBe(404);
            expect(response2[2]).toEqual({ 'content-type': 'application/json' });
        });

        type ValidationError = [field: string, message: string, code: number];

        it('should model validation errors', () => {
            const error: ValidationError = ['email', 'Invalid email format', 400];
            expect(error[0]).toBe('email');
            expect(error[1]).toBe('Invalid email format');
            expect(error[2]).toBe(400);
        });

        type Queue = [head: unknown, ...rest: unknown[]];

        it('should model queue-like structures', () => {
            const queue: Queue = [1, 2, 3, 4];
            const [head, ...rest] = queue;
            expect(head).toBe(1);
            expect(rest).toEqual([2, 3, 4]);
        });
    });

    describe('12. Tuple vs Array', () => {
        it('tuple has fixed length and specific types', () => {
            type Pair = [string, number];
            const pair: Pair = ['key', 42];
            expect(pair.length).toBe(2);
        });

        it('array has variable length and homogeneous types', () => {
            const arr: string[] = ['a', 'b', 'c', 'd'];
            expect(arr.length).toBeGreaterThan(0);
        });

        it('tuple enforces structure, array does not', () => {
            type Point = [number, number];
            const point: Point = [10, 20];
            const x: number = point[0];
            const y: number = point[1];
            expect(x + y).toBe(30);
        });
    });
});
