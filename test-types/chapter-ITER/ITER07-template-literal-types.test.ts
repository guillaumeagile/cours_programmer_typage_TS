describe('Template Literal Types', () => {
    // INTRO: What are Template Literal Types?
    // Template Literal Types allow you to manipulate string types using template literal syntax.
    // They enable string pattern matching, validation, and transformation at the type level.
    //
    // Use cases:
    // - Validate string patterns (email format, URL format)
    // - Generate related type names (getUser, setUser from 'user')
    // - Create type-safe string builders
    // - Extract parts of strings (domain from email)
    // - Enforce naming conventions (camelCase, snake_case)

    describe('1. Basic Template Literal Type', () => {
        // Template literal syntax: `prefix${T}suffix` creates a string type
        // T is replaced with the actual type passed in
        type Greeting<T extends string> = `Hello, ${T}!`;

        it('should create greeting strings', () => {
            type AliceGreeting = Greeting<'Alice'>;
            const greeting: AliceGreeting = 'Hello, Alice!';
            expect(greeting).toBe('Hello, Alice!');
        });

        it('should work with different names', () => {
            type BobGreeting = Greeting<'Bob'>;
            type WorldGreeting = Greeting<'World'>;
            const bob: BobGreeting = 'Hello, Bob!';
            const world: WorldGreeting = 'Hello, World!';
            expect(bob).toBe('Hello, Bob!');
            expect(world).toBe('Hello, World!');
        });
    });

    describe('2. Template Literals with Union Types', () => {
        // Union distribution: ColorClass<'red' | 'blue'> expands to 'color-red' | 'color-blue'
        // Each union member gets the template applied separately
        type Color = 'red' | 'blue' | 'green';
        type ColorClass<C extends Color> = `color-${C}`;

        it('should generate CSS class names', () => {
            type RedClass = ColorClass<'red'>;
            type BlueClass = ColorClass<'blue'>;
            const red: RedClass = 'color-red';
            const blue: BlueClass = 'color-blue';
            expect(red).toBe('color-red');
            expect(blue).toBe('color-blue');
        });

        it('should distribute over union', () => {
            // ColorClass<'red' | 'blue'> = 'color-red' | 'color-blue'
            type AllClasses = ColorClass<Color>;
            const cls1: AllClasses = 'color-red';
            const cls2: AllClasses = 'color-blue';
            const cls3: AllClasses = 'color-green';
            expect(cls1).toBe('color-red');
        });
    });

    describe('3. Email Validation with Template Literals', () => {
        // Pattern matching: `${string}@${string}.${string}` matches 'something@something.something'
        // Returns T if matches, never if doesn't (never = no valid value)
        type ValidEmail<T extends string> = 
            T extends `${string}@${string}.${string}` ? T : never;

        it('should accept valid email format', () => {
            type Email = ValidEmail<'alice@example.com'>;
            const email: Email = 'alice@example.com';
            expect(email).toBe('alice@example.com');
        });

        it('should reject invalid email format', () => {
            // ValidEmail<'invalid'> = never
            // Cannot assign any value to never type
        });
    });

    describe('4. URL Validation with Template Literals', () => {
        // Union patterns: matches EITHER http:// OR https:// prefix
        // Ensures type-safe URLs at compile time
        type HttpUrl<T extends string> = 
            T extends `http://${string}` | `https://${string}` ? T : never;

        it('should accept http URLs', () => {
            type Url = HttpUrl<'http://example.com'>;
            const url: Url = 'http://example.com';
            expect(url).toBe('http://example.com');
        });

        it('should accept https URLs', () => {
            type Url = HttpUrl<'https://example.com'>;
            const url: Url = 'https://example.com';
            expect(url).toBe('https://example.com');
        });
    });

    describe('5. Extract Parts from String', () => {
        // infer keyword: captures the matched part into a variable
        // `${string}@${infer Domain}` extracts everything after @
        type ExtractDomain<T extends string> = 
            T extends `${string}@${infer Domain}` ? Domain : never;

        it('should extract domain from email', () => {
            type Domain = ExtractDomain<'alice@example.com'>;
            const domain: Domain = 'example.com';
            expect(domain).toBe('example.com');
        });

        it('should extract multiple domains', () => {
            type D1 = ExtractDomain<'user@gmail.com'>;
            type D2 = ExtractDomain<'admin@company.org'>;
            const d1: D1 = 'gmail.com';
            const d2: D2 = 'company.org';
            expect(d1).toBe('gmail.com');
            expect(d2).toBe('company.org');
        });
    });

    describe('6. Generate Getter/Setter Names', () => {
        // Capitalize<T> converts first letter to uppercase
        // Useful for generating method names from property names
        type Getter<T extends string> = `get${Capitalize<T>}`;
        type Setter<T extends string> = `set${Capitalize<T>}`;

        it('should generate getter names', () => {
            type GetName = Getter<'name'>;
            type GetAge = Getter<'age'>;
            const fn1: GetName = 'getName';
            const fn2: GetAge = 'getAge';
            expect(fn1).toBe('getName');
            expect(fn2).toBe('getAge');
        });

        it('should generate setter names', () => {
            type SetEmail = Setter<'email'>;
            type SetPassword = Setter<'password'>;
            const fn1: SetEmail = 'setEmail';
            const fn2: SetPassword = 'setPassword';
            expect(fn1).toBe('setEmail');
            expect(fn2).toBe('setPassword');
        });
    });

    describe('7. Snake Case to Camel Case', () => {
        // Recursive type: ToCamelCase calls itself on the Rest
        // Finds underscore, capitalizes next part, repeats until no underscore
        type ToCamelCase<T extends string> = 
            T extends `${infer First}_${infer Rest}` 
                ? `${First}${ToCamelCase<Capitalize<Rest>>}`
                : T;

        it('should convert simple snake_case', () => {
            type Result = ToCamelCase<'user_name'>;
            const value: Result = 'userName';
            expect(value).toBe('userName');
        });

        it('should convert multiple underscores', () => {
            type Result = ToCamelCase<'first_last_name'>;
            const value: Result = 'firstLastName';
            expect(value).toBe('firstLastName');
        });
    });

    describe('8. API Endpoint Builder', () => {
        // Multiple parameters: each gets interpolated into the template
        // Ensures endpoints follow the pattern /resource/action
        type ApiEndpoint<Resource extends string, Action extends string> = 
            `/${Resource}/${Action}`;

        it('should build endpoint paths', () => {
            type UserList = ApiEndpoint<'users', 'list'>;
            type UserCreate = ApiEndpoint<'users', 'create'>;
            const list: UserList = '/users/list';
            const create: UserCreate = '/users/create';
            expect(list).toBe('/users/list');
            expect(create).toBe('/users/create');
        });
    });

    describe('9. Event Name Validation', () => {
        // Enforce naming convention: must start with 'on' followed by capital letter
        // Ensures consistency (onClick, onChange, etc.)
        type EventName<T extends string> = 
            T extends `on${Capitalize<string>}` ? T : never;

        it('should accept valid event names', () => {
            type ClickEvent = EventName<'onClick'>;
            type ChangeEvent = EventName<'onChange'>;
            const click: ClickEvent = 'onClick';
            const change: ChangeEvent = 'onChange';
            expect(click).toBe('onClick');
            expect(change).toBe('onChange');
        });
    });

    describe('10. Extract Query Parameters from URL', () => {
        // Extract query string from URL
        type ExtractQuery<T extends string> = 
            T extends `${string}?${infer Query}` ? Query : never;

        it('should extract query string', () => {
            type Query = ExtractQuery<'/users?id=123&name=alice'>;
            const query: Query = 'id=123&name=alice';
            expect(query).toBe('id=123&name=alice');
        });
    });

    describe('11. Practical: Database Column Names', () => {
        // Purpose: Convert camelCase property names to snake_case database column names
        // Example: 'firstName' → 'first_name', 'createdAt' → 'created_at'
        // This is a common pattern when mapping TypeScript objects to database schemas
        
        // Simple version: just lowercase everything
        // This works for already snake_case names but loses word boundaries
        type DbColumnSimple<T extends string> = Lowercase<T>;

        it('should convert to lowercase', () => {
            // For simple lowercase conversion
            type UserName = DbColumnSimple<'UserName'>;
            type CreatedAt = DbColumnSimple<'CreatedAt'>;
            const col1: UserName = 'username';
            const col2: CreatedAt = 'createdat';
            expect(col1).toBe('username');
            expect(col2).toBe('createdat');
        });

        // Advanced version: convert camelCase to snake_case
        // Handles specific patterns: firstName → first_name, createdAt → created_at
        type DbColumn<T extends string> = 
            T extends `${infer First}Name` ? `${Uppercase<First>}_name` :
            T extends `${infer First}At` ? `${Lowercase<First>}_at` :
            T extends `${infer First}Time` ? `${Lowercase<First>}_time` :
            Lowercase<T>;

        it('should convert camelCase to snake_case', () => {
            // For practical camelCase → snake_case conversion
            // Handles common suffixes: Name, At, Time
            type FirstName = DbColumn<'firstName'>;
            type CreatedAt = DbColumn<'createdAt'>;
            type UpdatedTime = DbColumn<'updatedTime'>;
            const col1: FirstName = 'FIRST_name';
            const col2: CreatedAt = 'created_at';
            const col3: UpdatedTime = 'updated_time';
            expect(col1).toBe('first_name');
            expect(col2).toBe('created_at');
            expect(col3).toBe('updated_time');
        });
    });

    describe('12. Practical: Type-Safe HTML Attributes', () => {
        // Validate HTML attribute names
        type HtmlAttribute<T extends string> = 
            T extends `data-${string}` | `aria-${string}` | `on${Capitalize<string>}` 
                ? T 
                : never;

        it('should accept data attributes', () => {
            type DataId = HtmlAttribute<'data-id'>;
            const attr: DataId = 'data-id';
            expect(attr).toBe('data-id');
        });

        it('should accept aria attributes', () => {
            type AriaLabel = HtmlAttribute<'aria-label'>;
            const attr: AriaLabel = 'aria-label';
            expect(attr).toBe('aria-label');
        });

        it('should accept event handlers', () => {
            type OnClick = HtmlAttribute<'onClick'>;
            const attr: OnClick = 'onClick';
            expect(attr).toBe('onClick');
        });
    });

    describe('13. Combining with Conditional Types', () => {
        // Use template literals with conditionals
        type ApiResponse<T extends string> = 
            T extends `success` 
                ? `{ status: "ok", data: any }`
                : T extends `error`
                ? `{ status: "error", message: string }`
                : never;

        it('should generate response types', () => {
            type SuccessResponse = ApiResponse<'success'>;
            type ErrorResponse = ApiResponse<'error'>;
            const success: SuccessResponse = '{ status: "ok", data: any }';
            const error: ErrorResponse = '{ status: "error", message: string }';
            expect(success).toContain('ok');
            expect(error).toContain('error');
        });
    });
});
