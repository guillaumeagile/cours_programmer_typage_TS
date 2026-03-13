describe('ITER11: Practical Patterns for Daily Work', () => {
    // ============================================================================
    // PATTERN 1: Result Type - Error Handling Without Exceptions
    // ============================================================================
    // Problem: Exceptions break control flow and are hard to compose
    // Solution: Represent success/failure as data using Result<T, E>
    // Benefits: Explicit error handling, composable, no hidden exceptions

    describe('Pattern 1: Result Type (Error Handling Without Exceptions)', () => {
        type Result<T, E> = 
            | { kind: 'success'; value: T }
            | { kind: 'failure'; error: E };

        // Helper functions for Result
        const Success = <T, E>(value: T): Result<T, E> => ({ kind: 'success', value });
        const Failure = <T, E>(error: E): Result<T, E> => ({ kind: 'failure', error });

        // Example: Parse user input
        function parseEmail(input: string): Result<string, string> {
            if (!input.includes('@')) {
                return Failure('Email must contain @');
            }
            if (input.length < 5) {
                return Failure('Email too short');
            }
            return Success(input.toLowerCase());
        }

        it('should return success for valid email', () => {
            const result = parseEmail('alice@example.com');
            expect(result.kind).toBe('success');
            if (result.kind === 'success') {
                expect(result.value).toBe('alice@example.com');
            }
        });

        it('should return failure for invalid email', () => {
            const result = parseEmail('invalid');
            expect(result.kind).toBe('failure');
            if (result.kind === 'failure') {
                expect(result.error).toContain('@');
            }
        });

        it('should compose multiple validations', () => {
            function validateUser(email: string, age: number): Result<{ email: string; age: number }, string> {
                const emailResult = parseEmail(email);
                if (emailResult.kind === 'failure') {
                    return emailResult;
                }

                if (age < 18) {
                    return Failure('Must be 18 or older');
                }

                return Success({ email: emailResult.value, age });
            }

            const valid = validateUser('alice@example.com', 25);
            expect(valid.kind).toBe('success');

            const invalid = validateUser('bob@example.com', 15);
            expect(invalid.kind).toBe('failure');
        });
    });

    // ============================================================================
    // PATTERN 2: State Machine - Explicit State Transitions
    // ============================================================================
    // Problem: Complex state logic scattered across code, hard to reason about
    // Solution: Model states explicitly, define valid transitions
    // Benefits: Clear state flow, impossible states prevented at compile time

    describe('Pattern 2: State Machine (Explicit State Transitions)', () => {
        // Define all possible states
        type OrderState = 
            | { kind: 'pending' }
            | { kind: 'processing'; startedAt: Date }
            | { kind: 'shipped'; trackingNumber: string }
            | { kind: 'delivered'; deliveredAt: Date }
            | { kind: 'cancelled'; reason: string };

        // State machine with valid transitions
        type OrderTransition = 
            | { from: 'pending'; to: 'processing'; startedAt: Date }
            | { from: 'processing'; to: 'shipped'; trackingNumber: string }
            | { from: 'shipped'; to: 'delivered'; deliveredAt: Date }
            | { from: 'pending' | 'processing'; to: 'cancelled'; reason: string };

        function applyTransition(state: OrderState, transition: OrderTransition): OrderState {
            // Type system ensures only valid transitions
            switch (true) {
                case state.kind === 'pending' && transition.to === 'processing':
                    return { kind: 'processing', startedAt: (transition as any).startedAt };
                case state.kind === 'processing' && transition.to === 'shipped':
                    return { kind: 'shipped', trackingNumber: (transition as any).trackingNumber };
                case state.kind === 'shipped' && transition.to === 'delivered':
                    return { kind: 'delivered', deliveredAt: (transition as any).deliveredAt };
                case (state.kind === 'pending' || state.kind === 'processing') && transition.to === 'cancelled':
                    return { kind: 'cancelled', reason: (transition as any).reason };
                default:
                    return state;
            }
        }

        it('should transition through valid order states', () => {
            let state: OrderState = { kind: 'pending' };
            expect(state.kind).toBe('pending');

            state = applyTransition(state, { from: 'pending', to: 'processing', startedAt: new Date() });
            expect(state.kind).toBe('processing');

            state = applyTransition(state, { from: 'processing', to: 'shipped', trackingNumber: 'TRACK123' });
            expect(state.kind).toBe('shipped');
            if (state.kind === 'shipped') {
                expect(state.trackingNumber).toBe('TRACK123');
            }

            state = applyTransition(state, { from: 'shipped', to: 'delivered', deliveredAt: new Date() });
            expect(state.kind).toBe('delivered');
        });

        it('should allow cancellation from processing state', () => {
            let state: OrderState = { kind: 'processing', startedAt: new Date() };
            state = applyTransition(state, { from: 'processing', to: 'cancelled', reason: 'Out of stock' });
            expect(state.kind).toBe('cancelled');
            if (state.kind === 'cancelled') {
                expect(state.reason).toBe('Out of stock');
            }
        });
    });

    // ============================================================================
    // PATTERN 3: Form Validation - Template Literal Types for Field Patterns
    // ============================================================================
    // Problem: Form field names and error messages scattered, hard to maintain consistency
    // Solution: Use Template Literal Types to generate type-safe field names and error messages
    // Benefits: Compile-time validation of field naming conventions, type-safe error reporting

    describe('Pattern 3: Form Validation (Template Literal Types for Field Patterns)', () => {
        // Template Literal Type: Generate field error message names
        // Pattern: `${fieldName}:error` ensures consistent error naming
        type FieldErrorKey<Field extends string> = `${Field}:error`;
        type FieldWarningKey<Field extends string> = `${Field}:warning`;

        // Template Literal Type: Validate email format at compile time
        type ValidEmail<T extends string> = 
            T extends `${string}@${string}.${string}` ? T : never;

        // Template Literal Type: Validate API token format
        // Must start with 'token_' prefix (practical use case for Template Literal Types)
        type ApiToken<T extends string> = 
            T extends `token_${string}` ? T : never;

        // Template Literal Type: Validate username follows naming convention
        // Must be lowercase with optional underscores and numbers
        type ValidUsername<T extends string> = 
            T extends `${Lowercase<string>}${string}` ? T : never;

        // Template Literal Type: Generate field names with prefix
        // Useful for creating consistent field identifiers
        type FormFieldId<Field extends string> = `form_${Lowercase<Field>}_field`;

        // Runtime validation with Template Literal Type error keys
        type ValidationError<Field extends string> = {
            key: FieldErrorKey<Field>;
            message: string;
        };

        type FormErrors = 
            | ValidationError<'email'>
            | ValidationError<'password'>
            | ValidationError<'username'>
            | ValidationError<'age'>;

        // Practical example: Validate and collect errors with type-safe keys
        function validateEmail(email: string): ValidationError<'email'>[] {
            const errors: ValidationError<'email'>[] = [];
            
            if (!email.includes('@') || !email.includes('.')) {
                errors.push({
                    key: 'email:error',
                    message: 'Must be valid email format'
                });
            }
            if (email.length < 5) {
                errors.push({
                    key: 'email:error',
                    message: 'Email too short'
                });
            }
            return errors;
        }

        function validatePassword(password: string): ValidationError<'password'>[] {
            const errors: ValidationError<'password'>[] = [];
            
            if (password.length < 8) {
                errors.push({
                    key: 'password:error',
                    message: 'Must be at least 8 characters'
                });
            }
            if (!/[A-Z]/.test(password)) {
                errors.push({
                    key: 'password:error',
                    message: 'Must contain uppercase letter'
                });
            }
            if (!/[0-9]/.test(password)) {
                errors.push({
                    key: 'password:error',
                    message: 'Must contain digit'
                });
            }
            return errors;
        }

        function validateUsername(username: string): ValidationError<'username'>[] {
            const errors: ValidationError<'username'>[] = [];
            
            if (username.length < 3 || username.length > 20) {
                errors.push({
                    key: 'username:error',
                    message: 'Must be 3-20 characters'
                });
            }
            if (!/^[a-z0-9_]+$/.test(username)) {
                errors.push({
                    key: 'username:error',
                    message: 'Only lowercase, numbers, and underscore allowed'
                });
            }
            return errors;
        }

        function validateAge(age: number): ValidationError<'age'>[] {
            const errors: ValidationError<'age'>[] = [];
            
            if (age < 18 || age > 120) {
                errors.push({
                    key: 'age:error',
                    message: 'Must be between 18 and 120'
                });
            }
            return errors;
        }

        it('should validate email with template literal error keys', () => {
            const errors = validateEmail('invalid');
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].key).toBe('email:error');
        });

        it('should validate password with strong pattern', () => {
            const errors = validatePassword('weak');
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e.key === 'password:error')).toBe(true);
        });

        it('should validate username with naming convention', () => {
            const errors = validateUsername('INVALID');
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].key).toBe('username:error');
        });

        it('should collect all form errors with type-safe keys', () => {
            const allErrors: FormErrors[] = [
                ...validateEmail('bad'),
                ...validatePassword('weak'),
                ...validateUsername('INVALID'),
                ...validateAge(15)
            ];
            
            expect(allErrors.length).toBeGreaterThan(0);
            expect(allErrors.every(e => e.key.endsWith(':error'))).toBe(true);
        });

        it('should use template literal types to generate field IDs', () => {
            // Template Literal Types generate consistent field identifiers
            type EmailFieldId = FormFieldId<'Email'>;
            type PasswordFieldId = FormFieldId<'Password'>;
            
            const emailId: EmailFieldId = 'form_email_field';
            const passwordId: PasswordFieldId = 'form_password_field';
            
            expect(emailId).toBe('form_email_field');
            expect(passwordId).toBe('form_password_field');
        });

        it('should enforce valid email at type level', () => {
            // This demonstrates compile-time validation
            type ValidEmailType = ValidEmail<'alice@example.com'>;
            const email: ValidEmailType = 'alice@example.com';
            expect(email).toBe('alice@example.com');
        });

        it('should enforce API token format at type level', () => {
            // Token must start with 'token_' prefix
            type TokenType = ApiToken<'token_abc123xyz'>;
            const token: TokenType = 'token_abc123xyz';
            expect(token).toBe('token_abc123xyz');
        });

        it('should enforce username convention at type level', () => {
            // Username must start with lowercase
            type UsernameType = ValidUsername<'alice_123'>;
            const username: UsernameType = 'alice_123';
            expect(username).toBe('alice_123');
        });
    });

    // ============================================================================
    // PATTERN 4: Option/Maybe Type - Handle Absence Explicitly
    // ============================================================================
    // Problem: null/undefined scattered everywhere, null reference errors
    // Solution: Use Option<T> to explicitly represent presence/absence
    // Benefits: Compile-time safety, no null reference errors

    describe('Pattern 4: Option/Maybe Type (Handle Absence Explicitly)', () => {
        type Option<T> = 
            | { kind: 'some'; value: T }
            | { kind: 'none' };

        const Some = <T>(value: T): Option<T> => ({ kind: 'some', value });
        const None = <T>(): Option<T> => ({ kind: 'none' });

        // Example: Find user by ID
        type User = { id: number; name: string };
        const users: User[] = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ];

        function findUser(id: number): Option<User> {
            const user = users.find(u => u.id === id);
            return user ? Some(user) : None();
        }

        it('should return Some for existing user', () => {
            const result = findUser(1);
            expect(result.kind).toBe('some');
            if (result.kind === 'some') {
                expect(result.value.name).toBe('Alice');
            }
        });

        it('should return None for non-existing user', () => {
            const result = findUser(999);
            expect(result.kind).toBe('none');
        });

        it('should chain operations safely', () => {
            function getUserEmail(id: number): Option<string> {
                const userOpt = findUser(id);
                if (userOpt.kind === 'none') {
                    return None();
                }
                // Safe to use userOpt.value here
                return Some(`${userOpt.value.name.toLowerCase()}@example.com`);
            }

            const email = getUserEmail(1);
            expect(email.kind).toBe('some');
            if (email.kind === 'some') {
                expect(email.value).toBe('alice@example.com');
            }

            const noEmail = getUserEmail(999);
            expect(noEmail.kind).toBe('none');
        });
    });

    // ============================================================================
    // PATTERN 5: RemoteData - Handle Async Operations Explicitly
    // ============================================================================
    // Problem: Loading/error/success states mixed with business logic
    // Solution: Model async data as RemoteData with explicit states
    // Benefits: Clear async flow, handle all states, composable

    describe('Pattern 5: RemoteData (Handle Async Operations Explicitly)', () => {
        type RemoteData<T, E> = 
            | { kind: 'notAsked' }
            | { kind: 'loading' }
            | { kind: 'success'; data: T }
            | { kind: 'failure'; error: E };

        // Example: Fetch user from API
        type ApiUser = { id: number; name: string; email: string };

        async function fetchUser(id: number): Promise<RemoteData<ApiUser, string>> {
            // Simulate API call
            return new Promise((resolve) => {
                setTimeout(() => {
                    if (id === 1) {
                        resolve({
                            kind: 'success',
                            data: { id: 1, name: 'Alice', email: 'alice@example.com' }
                        });
                    } else {
                        resolve({
                            kind: 'failure',
                            error: 'User not found'
                        });
                    }
                }, 10);
            });
        }

        it('should handle loading state', async () => {
            let state: RemoteData<ApiUser, string> = { kind: 'loading' };
            expect(state.kind).toBe('loading');
        });

        it('should handle success state', async () => {
            const result = await fetchUser(1);
            expect(result.kind).toBe('success');
            if (result.kind === 'success') {
                expect(result.data.name).toBe('Alice');
            }
        });

        it('should handle failure state', async () => {
            const result = await fetchUser(999);
            expect(result.kind).toBe('failure');
            if (result.kind === 'failure') {
                expect(result.error).toContain('not found');
            }
        });

        it('should render UI based on state', async () => {
            function renderUserUI(state: RemoteData<ApiUser, string>): string {
                switch (state.kind) {
                    case 'notAsked':
                        return 'Click to load user';
                    case 'loading':
                        return 'Loading...';
                    case 'success':
                        return `User: ${state.data.name} (${state.data.email})`;
                    case 'failure':
                        return `Error: ${state.error}`;
                }
            }

            expect(renderUserUI({ kind: 'notAsked' })).toBe('Click to load user');
            expect(renderUserUI({ kind: 'loading' })).toBe('Loading...');
            expect(renderUserUI({
                kind: 'success',
                data: { id: 1, name: 'Alice', email: 'alice@example.com' }
            })).toContain('Alice');
            expect(renderUserUI({
                kind: 'failure',
                error: 'Network error'
            })).toContain('Network error');
        });
    });

    // ============================================================================
    // BONUS: Combining Patterns - Real-World Example
    // ============================================================================
    // Show how patterns work together in a realistic scenario

    describe('Bonus: Combining Patterns (Real-World Example)', () => {
        // Use Result for validation
        type Result<T, E> = 
            | { kind: 'success'; value: T }
            | { kind: 'failure'; error: E };

        // Use Option for optional data
        type Option<T> = 
            | { kind: 'some'; value: T }
            | { kind: 'none' };

        // Use RemoteData for async operations
        type RemoteData<T, E> = 
            | { kind: 'notAsked' }
            | { kind: 'loading' }
            | { kind: 'success'; data: T }
            | { kind: 'failure'; error: E };

        // Use State Machine for workflow
        type RegistrationState = 
            | { kind: 'idle' }
            | { kind: 'validating' }
            | { kind: 'submitting' }
            | { kind: 'success'; userId: number }
            | { kind: 'error'; message: string };

        type RegistrationForm = {
            email: string;
            password: string;
            age: number;
        };

        // Validation with Result
        function validateRegistration(form: RegistrationForm): Result<RegistrationForm, string[]> {
            const errors: string[] = [];
            if (!form.email.includes('@')) errors.push('Invalid email');
            if (form.password.length < 8) errors.push('Password too short');
            if (form.age < 18) errors.push('Must be 18+');
            return errors.length === 0 
                ? { kind: 'success', value: form }
                : { kind: 'failure', error: errors };
        }

        // Async submission with RemoteData
        async function submitRegistration(form: RegistrationForm): Promise<RemoteData<number, string>> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        kind: 'success',
                        data: Math.floor(Math.random() * 10000)
                    });
                }, 10);
            });
        }

        it('should validate and submit registration', async () => {
            const form: RegistrationForm = {
                email: 'alice@example.com',
                password: 'SecurePass123',
                age: 25
            };

            // Step 1: Validate with Result
            const validation = validateRegistration(form);
            expect(validation.kind).toBe('success');

            if (validation.kind === 'success') {
                // Step 2: Submit with RemoteData
                const submission = await submitRegistration(validation.value);
                expect(submission.kind).toBe('success');
                if (submission.kind === 'success') {
                    expect(submission.data).toBeGreaterThan(0);
                }
            }
        });

        it('should handle validation errors', () => {
            const form: RegistrationForm = {
                email: 'invalid',
                password: 'weak',
                age: 15
            };

            const validation = validateRegistration(form);
            expect(validation.kind).toBe('failure');
            if (validation.kind === 'failure') {
                expect(validation.error.length).toBeGreaterThan(1);
            }
        });

        it('should track registration workflow state', () => {
            let state: RegistrationState = { kind: 'idle' };
            expect(state.kind).toBe('idle');

            state = { kind: 'validating' };
            expect(state.kind).toBe('validating');

            state = { kind: 'submitting' };
            expect(state.kind).toBe('submitting');

            state = { kind: 'success', userId: 123 };
            expect(state.kind).toBe('success');
            if (state.kind === 'success') {
                expect(state.userId).toBe(123);
            }
        });
    });
});
