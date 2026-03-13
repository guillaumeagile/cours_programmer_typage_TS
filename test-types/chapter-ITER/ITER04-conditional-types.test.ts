describe('Conditional Types', () => {
    // INTRO: What are Conditional Types?
    // Conditional types allow you to select one of two possible types based on a condition.
    // They enable writing type-level logic that adapts based on input types.
    // 
    // Use cases:
    // - Extract types from generics (e.g., get element type from array)
    // - Filter union types (e.g., keep only functions from a union)
    // - Transform types based on conditions (e.g., unwrap Promise)
    // - Create flexible generic utilities that behave differently for different inputs
    // - Build type inference systems that automatically deduce types
    //
    // Syntax: T extends U ? X : Y
    // If type T is assignable to type U, resolve to X, otherwise resolve to Y

    describe('1. Basic Conditional Type - ternary for types', () => {
        // Syntax: T extends U ? X : Y
        // If T is assignable to U, resolve to X, otherwise Y
        type IsString<T> = T extends string ? true : false;

        it('should resolve to true when type extends condition', () => {
            type Result = IsString<'hello'>;
            const value: Result = true;
            expect(value).toBe(true);
        });

        it('should resolve to false when type does not extend condition', () => {
            type Result = IsString<number>;
            const value: Result = false;
            expect(value).toBe(false);
        });
    });

    describe('1.bis Type-Oriented Conditionals - Transform Types Based on Input', () => {
        // Conditional types can transform to completely different types
        // based on what type T is, not just boolean values
        type Red = { color: 'red'; hue: 0 };
        type Blue = { color: 'blue'; hue: 240 };
        type StringIsRedOtherwiseBlue<T> = T extends string ? Red : Blue;

        it('should resolve to Red type when T is string', () => {
            type Result = StringIsRedOtherwiseBlue<'hello'>;
            const value: Result = { color: 'red', hue: 0 };
            expect(value.color).toBe('red');
            expect(value.hue).toBe(0);
        });

        it('should resolve to Blue type when T is not string', () => {
            type Result = StringIsRedOtherwiseBlue<number>;
            const value: Result = { color: 'blue', hue: 240 };
            expect(value.color).toBe('blue');
            expect(value.hue).toBe(240);
        });

        // More complex type transformation
        type Success<T> = { status: 'ok'; data: T };
        type Failure = { status: 'error'; message: string };
        type IsValidEmail<T> = T extends `${string}@${string}` ? Success<T> : Failure;

        it('should transform to Success when email format matches', () => {
            type Result = IsValidEmail<'alice@example.com'>;
            const value: Result = { status: 'ok', data: 'alice@example.com' };
            expect(value.status).toBe('ok');
        });

        it('should transform to Failure when email format does not match', () => {
            type Result = IsValidEmail<'invalid-email'>;
            const value: Result = { status: 'error', message: 'Invalid email' };
            expect(value.status).toBe('error');
        });
    });

    describe('2. Conditional with Union Types', () => {
        // Distributes over union members
        type Flatten<T> = T extends Array<infer U> ? U : T;

        it('should extract array element type', () => {
            type Result = Flatten<string[]>;
            const value: Result = 'hello';
            expect(typeof value).toBe('string');
        });

        it('should return non-array type as-is', () => {
            type Result = Flatten<number>;
            const value: Result = 42;
            expect(typeof value).toBe('number');
        });
    });

    describe('3. Inferring Types in Conditionals', () => {
        // Use 'infer' keyword to capture types
        type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

        it('should extract function return type', () => {
            type Result = GetReturnType<() => string>;
            const value: Result = 'test';
            expect(typeof value).toBe('string');
        });

        it('should return never for non-function types', () => {
            type Result = GetReturnType<string>;
            // Result is 'never' - no valid value can be assigned
        });
    });

    describe('4. Extracting Generic Parameters', () => {
        // Extract the generic parameter from a type
        type GetArrayElement<T> = T extends (infer U)[] ? U : never;

        it('should extract element type from array', () => {
            type Result = GetArrayElement<number[]>;
            const value: Result = 42;
            expect(typeof value).toBe('number');
        });

        it('should extract from Promise', () => {
            type GetPromiseValue<T> = T extends Promise<infer U> ? U : never;
            type Result = GetPromiseValue<Promise<string>>;
            const value: Result = 'resolved';
            expect(typeof value).toBe('string');
        });
    });

    describe('5. Conditional Type Constraints', () => {
        // Combine extends with conditionals for validation
        type IsNumeric<T> = T extends number | bigint ? true : false;

        it('should identify numeric types', () => {
            type R1 = IsNumeric<42>;
            type R2 = IsNumeric<'text'>;
            const n: R1 = true;
            const s: R2 = false;
            expect(n).toBe(true);
            expect(s).toBe(false);
        });
    });

    describe('6. Nested Conditionals', () => {
        // Chain multiple conditions
        type TypeName<T> = 
            T extends string ? 'string' :
            T extends number ? 'number' :
            T extends boolean ? 'boolean' :
            'other';

        it('should resolve nested conditions', () => {
            type R1 = TypeName<'hello'>;
            type R2 = TypeName<42>;
            type R3 = TypeName<true>;
            type R4 = TypeName<[]>;

            const s: R1 = 'string';
            const n: R2 = 'number';
            const b: R3 = 'boolean';
            const o: R4 = 'other';

            expect(s).toBe('string');
            expect(n).toBe('number');
            expect(b).toBe('boolean');
            expect(o).toBe('other');
        });
    });

    describe('7. Conditional with Union Distribution', () => {
        // Conditionals distribute over union members
        type ToArray<T> = T extends any ? T[] : never;

        it('should distribute over union types', () => {
            type Result = ToArray<string | number>;
            const s: Result = ['hello'];
            const n: Result = [42];
            expect(Array.isArray(s)).toBe(true);
            expect(Array.isArray(n)).toBe(true);
        });
    });

    describe('8. Preventing Distribution with Tuple Wrapping', () => {
        // Wrap in tuple to prevent distribution
        type ToArrayNoDistribute<T> = [T] extends [any] ? T[] : never;

        it('should not distribute when wrapped', () => {
            type Result = ToArrayNoDistribute<string | number>;
            const value: Result = ['hello', 42];
            expect(value.length).toBe(2);
        });
    });

    describe('9. Practical: Extract Function Parameters', () => {
        // Get function parameter types
        type Parameters<T> = T extends (...args: infer P) => any ? P : never;

        it('should extract function parameters', () => {
            type Params = Parameters<(a: string, b: number) => void>;
            const params: Params = ['hello', 42];
            expect(params[0]).toBe('hello');
            expect(params[1]).toBe(42);
        });
    });

    describe('10. Practical: Unwrap Promise', () => {
        // Recursively unwrap Promise types
        type Awaited<T> = 
            T extends Promise<infer U> ? Awaited<U> :
            T extends (...args: any[]) => infer R ? Awaited<R> :
            T;

        it('should unwrap single Promise', () => {
            type Result = Awaited<Promise<string>>;
            const value: Result = 'resolved';
            expect(typeof value).toBe('string');
        });

        it('should unwrap nested Promises', () => {
            type Result = Awaited<Promise<Promise<number>>>;
            const value: Result = 42;
            expect(typeof value).toBe('number');
        });
    });

    describe('11. Practical: Filter Union Types', () => {
        // Extract only types matching a condition
        type FilterByType<T, U> = T extends U ? T : never;

        it('should filter union to matching types', () => {
            type StringsOnly = FilterByType<string | number | boolean, string>;
            const value: StringsOnly = 'hello';
            expect(typeof value).toBe('string');
        });

        it('should filter to functions only', () => {
            type FunctionsOnly = FilterByType<string | (() => void) | number, Function>;
            const fn: FunctionsOnly = () => {};
            expect(typeof fn).toBe('function');
        });
    });

    describe('12. Practical: Flatten Nested Arrays', () => {
        // Recursively flatten array types
        type DeepFlatten<T> = 
            T extends Array<infer U> ? DeepFlatten<U> :
            T;

        it('should flatten single level', () => {
            type Result = DeepFlatten<string[]>;
            const value: Result = 'hello';
            expect(typeof value).toBe('string');
        });

        it('should flatten multiple levels', () => {
            type Result = DeepFlatten<number[][][]>;
            const value: Result = 42;
            expect(typeof value).toBe('number');
        });
    });
});
