describe('Pattern Matching with Discriminated Unions', () => {
    // INTRO: What is Pattern Matching?
    // Pattern matching uses discriminated unions (tagged unions) to safely handle
    // different cases of a type. Each case has a discriminator property that identifies it.
    //
    // Use cases:
    // - Type-safe error handling (Success | Error)
    // - State machines (Idle | Loading | Success | Error)
    // - API responses with different shapes
    // - Exhaustiveness checking - compiler ensures all cases handled
    // - Replacing exceptions with explicit type-level error handling

    describe('1. Basic Discriminated Union', () => {
        // Discriminator: 'status' property distinguishes the cases
        type Result<T> = 
            | { status: 'success'; data: T }
            | { status: 'error'; message: string };

        it('should handle success case', () => {
            const result: Result<string> = { status: 'success', data: 'hello' };
            if (result.status === 'success') {
                expect(result.data).toBe('hello');
            }
        });

        it('should handle error case', () => {
            const result: Result<string> = { status: 'error', message: 'Something went wrong' };
            if (result.status === 'error') {
                expect(result.message).toBe('Something went wrong');
            }
        });
    });

    describe('2. Pattern Matching with Exhaustiveness', () => {
        // Compiler ensures all cases are handled
        type Response<T> =
            | { kind: 'ok'; value: T }
            | { kind: 'notfound' }
            | { kind: 'error'; code: number };

        function handleResponse<T>(response: Response<T>): string {
            switch (response.kind) {
                case 'ok':
                    return `Success: ${response.value}`;
                case 'notfound':
                    return 'Not found';
                case 'error':
                    return `Error ${response.code}`;
            }
        }

        it('should handle all cases', () => {
            const success: Response<string> = { kind: 'ok', value: 'data' };
            const notfound: Response<string> = { kind: 'notfound' };
            const error: Response<string> = { kind: 'error', code: 404 };

            expect(handleResponse(success)).toBe('Success: data');
            expect(handleResponse(notfound)).toBe('Not found');
            expect(handleResponse(error)).toBe('Error 404');
        });
    });

    describe('3. Multiple Discriminators', () => {
        // Use different discriminators for different unions
        type LoadingState =
            | { type: 'idle' }
            | { type: 'loading' }
            | { type: 'success'; data: string }
            | { type: 'error'; error: Error };

        it('should match on type discriminator', () => {
            const state: LoadingState = { type: 'success', data: 'loaded' };
            if (state.type === 'success') {
                expect(state.data).toBe('loaded');
            }
          //  const invalidState: LoadingState = { type: 'invalid' };
        });

        it('should distinguish between cases', () => {
            const idle: LoadingState = { type: 'idle' };
            const loading: LoadingState = { type: 'loading' };
            const success: LoadingState = { type: 'success', data: 'done' };
            const error: LoadingState = { type: 'error', error: new Error('failed') };

            expect(idle.type).toBe('idle');
            expect(loading.type).toBe('loading');
            expect(success.type).toBe('success');
            expect(error.type).toBe('error');
        });
    });

    describe('4. Nested Pattern Matching', () => {
        // Patterns can be nested
        type ApiResult<T> =
            | { status: 'pending' }
            | { status: 'success'; data: T; cached: boolean }
            | { status: 'error'; code: number; retry: boolean };

        function processResult<T>(result: ApiResult<T>): string {
            if (result.status === 'pending') {
                return 'Loading...';
            }
            if (result.status === 'success') {
                return result.cached ? 'From cache' : 'Fresh data';
            }
            if (result.status === 'error') {
                return result.retry ? 'Retrying...' : 'Failed';
            }
            return 'Unknown';
        }

        it('should handle nested properties', () => {
            const cached: ApiResult<string> = { status: 'success', data: 'test', cached: true };
            const fresh: ApiResult<string> = { status: 'success', data: 'test', cached: false };
            const retryable: ApiResult<string> = { status: 'error', code: 500, retry: true };

            expect(processResult(cached)).toBe('From cache');
            expect(processResult(fresh)).toBe('Fresh data');
            expect(processResult(retryable)).toBe('Retrying...');
        });
    });

    describe('5. Literal Types in Discriminators', () => {
        // Use literal types for precise discrimination
        type HttpResponse =
            | { statusCode: 200; body: string }
            | { statusCode: 404; notFound: true }
            | { statusCode: 500; error: string };

        it('should discriminate by literal status codes', () => {
            const ok: HttpResponse = { statusCode: 200, body: 'OK' };
            const notFound: HttpResponse = { statusCode: 404, notFound: true };
            const error: HttpResponse = { statusCode: 500, error: 'Server error' };

            if (ok.statusCode === 200) {
                expect(ok.body).toBe('OK');
            }
            if (notFound.statusCode === 404) {
                expect(notFound.notFound).toBe(true);
            }
            if (error.statusCode === 500) {
                expect(error.error).toBe('Server error');
            }
        });
    });

    describe('6. Union with Common Properties', () => {
        // All cases share some properties
        type Event =
            | { type: 'click'; x: number; y: number; button: number }
            | { type: 'keydown'; key: string; ctrlKey: boolean }
            | { type: 'scroll'; deltaY: number };

        function logEvent(event: Event): string {
            switch (event.type) {
                case 'click':
                    return `Click at ${event.x}, ${event.y}`;
                case 'keydown':
                    return `Key ${event.key} pressed`;
                case 'scroll':
                    return `Scrolled ${event.deltaY}px`;
            }
        }

        it('should handle events with different properties', () => {
            const click: Event = { type: 'click', x: 100, y: 200, button: 0 };
            const keydown: Event = { type: 'keydown', key: 'Enter', ctrlKey: false };
            const scroll: Event = { type: 'scroll', deltaY: 50 };

            expect(logEvent(click)).toBe('Click at 100, 200');
            expect(logEvent(keydown)).toBe('Key Enter pressed');
            expect(logEvent(scroll)).toBe('Scrolled 50px');
        });
    });

    describe('7. Practical: Result Type for Error Handling', () => {
        // Replace exceptions with explicit Result type
        type Result<T, E> =
            | { ok: true; value: T }
            | { ok: false; error: E };

        function divide(a: number, b: number): Result<number, string> {
            if (b === 0) {
                return { ok: false, error: 'Division by zero' };
            }
            return { ok: true, value: a / b };
        }

        it('should handle success case', () => {
            const result = divide(10, 2);
            if (result.ok) {
                expect(result.value).toBe(5);
            }
        });

        it('should handle error case', () => {
            const result = divide(10, 0);
            if (!result.ok) {
                expect(result.error).toBe('Division by zero');
            }
        });
    });

    describe('8. Practical: State Machine', () => {
        // Model state transitions with discriminated unions
        type TrafficLight =
            | { state: 'red'; waitTime: number }
            | { state: 'yellow'; waitTime: number }
            | { state: 'green'; waitTime: number };

        function nextState(light: TrafficLight): TrafficLight {
            switch (light.state) {
                case 'red':
                    return { state: 'green', waitTime: 25 };
                case 'green':
                    return { state: 'yellow', waitTime: 5 };
                case 'yellow':
                    return { state: 'red', waitTime: 30 };
            }
        }

        it('should transition between states', () => {
            let light: TrafficLight = { state: 'red', waitTime: 30 };
            light = nextState(light);
            expect(light.state).toBe('green');
            light = nextState(light);
            expect(light.state).toBe('yellow');
            light = nextState(light);
            expect(light.state).toBe('red');
        });
    });

    describe('9. Practical: Form Validation', () => {
        // Validation results with detailed error info
        type ValidationResult<T> =
            | { valid: true; data: T }
            | { valid: false; errors: Record<string, string> };

        function validateEmail(email: string): ValidationResult<string> {
            if (!email.includes('@')) {
                return { valid: false, errors: { email: 'Invalid email format' } };
            }
            return { valid: true, data: email };
        }

        it('should validate successfully', () => {
            const result = validateEmail('alice@example.com');
            if (result.valid) {
                expect(result.data).toBe('alice@example.com');
            }
        });

        it('should return validation errors', () => {
            const result = validateEmail('invalid');
            if (!result.valid) {
                expect(result.errors.email).toBe('Invalid email format');
            }
        });
    });

    describe('10. Practical: Option Type (Maybe)', () => {
        // Explicit handling of optional values
        type Option<T> =
            | { kind: 'some'; value: T }
            | { kind: 'none' };

        function find<T>(arr: T[], predicate: (t: T) => boolean): Option<T> {
            const item = arr.find(predicate);
            return item !== undefined ? { kind: 'some', value: item } : { kind: 'none' };
        }

        it('should return some when found', () => {
            const result = find([1, 2, 3, 4], (x) => x > 2);
            if (result.kind === 'some') {
                expect(result.value).toBe(3);
            }
        });

        it('should return none when not found', () => {
            const result = find([1, 2, 3], (x) => x > 10);
            if (result.kind === 'none') {
                expect(result.kind).toBe('none');
            }
        });
    });

    describe('11. Exhaustiveness with Never Type', () => {
        // Compiler error if case is missing
        type Command =
            | { type: 'start' }
            | { type: 'stop' }
            | { type: 'pause' };

        function executeCommand(cmd: Command): void {
            switch (cmd.type) {
                case 'start':
                    break;
                case 'stop':
                    break;
                case 'pause':
                    break;
                default:
                    const _exhaustive: never = cmd;
                    throw new Error(`Unhandled command: ${_exhaustive}`);
            }
        }

        it('should handle all commands', () => {
            expect(() => executeCommand({ type: 'start' })).not.toThrow();
            expect(() => executeCommand({ type: 'stop' })).not.toThrow();
            expect(() => executeCommand({ type: 'pause' })).not.toThrow();
        });
    });

    describe('12. Combining with Generics', () => {
        // Pattern matching with generic types
        type RemoteData<T, E> =
            | { status: 'notasked' }
            | { status: 'loading' }
            | { status: 'success'; data: T }
            | { status: 'failure'; error: E };

        function getDisplayValue<T, E>(data: RemoteData<T, E>): string {
            switch (data.status) {
                case 'notasked':
                    return 'Not asked';
                case 'loading':
                    return 'Loading...';
                case 'success':
                    return `Success: ${JSON.stringify(data.data)}`;
                case 'failure':
                    return `Error: ${data.error}`;
            }
        }

        it('should display different states', () => {
            const notAsked: RemoteData<string, Error> = { status: 'notasked' };
            const loading: RemoteData<string, Error> = { status: 'loading' };
            const success: RemoteData<string, Error> = { status: 'success', data: 'hello' };
            const failure: RemoteData<string, Error> = { status: 'failure', error: new Error('failed') };

            expect(getDisplayValue(notAsked)).toBe('Not asked');
            expect(getDisplayValue(loading)).toBe('Loading...');
            expect(getDisplayValue(success)).toContain('Success');
            expect(getDisplayValue(failure)).toContain('Error');
        });
    });
});
