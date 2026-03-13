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
        // Define a type that matches a string pattern
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
        // Template literals distribute over unions
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
        // Validate email format at type level
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
        // Validate URL protocol
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
        // Extract domain from email
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
        // Create getter/setter method names from property names
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
        // Convert snake_case to camelCase
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
        // Build type-safe API endpoints
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
        // Validate event names follow convention
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
        // Enforce database naming convention
        type DbColumn<T extends string> = 
            T extends `${infer First}_${infer Rest}` 
                ? `${Lowercase<First>}_${Lowercase<Rest>}`
                : Lowercase<T>;

        it('should format column names', () => {
            type UserName = DbColumn<'UserName'>;
            type CreatedAt = DbColumn<'CreatedAt'>;
            const col1: UserName = 'user_name';
            const col2: CreatedAt = 'created_at';
            expect(col1).toBe('user_name');
            expect(col2).toBe('created_at');
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
