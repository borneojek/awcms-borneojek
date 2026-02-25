declare module "vitest" {
    export function describe(name: string, fn: () => void): void;
    export function it(name: string, fn: () => void): void;
    export function expect(actual: any): {
        toBe(expected: any): void;
        toEqual(expected: any): void;
        toContain(expected: any): void;
        toBeTruthy(): void;
        toBeFalsy(): void;
        not: {
            toBe(expected: any): void;
            toEqual(expected: any): void;
            toContain(expected: any): void;
            toBeTruthy(): void;
            toBeFalsy(): void;
        };
    };
}
