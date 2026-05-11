declare global {
    type MockedObject<T = any> = T;

    interface MockFunction<T extends (...args: any[]) => any> {
        mock: {
            calls: Array<{arguments: Parameters<T>; result: ReturnType<T> | undefined}>;
        };
        and: {
            returnValue: (value: ReturnType<T>) => void;
            resolveTo: (value: Awaited<ReturnType<T>>) => void;
            callFake: (fn: T) => void;
        };

        (...args: Parameters<T>): ReturnType<T>;
    }

    type Mocked<ClassToSpyOn> = {
        [Key in keyof ClassToSpyOn]:
        ClassToSpyOn[Key] extends (...args: any[]) => any
            ? MockFunction<ClassToSpyOn[Key]>
            : ClassToSpyOn[Key];
    } & ClassToSpyOn;
}

export {};
