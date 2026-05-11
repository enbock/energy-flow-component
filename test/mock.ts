type MockedObject<T = any> = T;

type Mocked<ClassToSpyOn> = {
    [Key in keyof ClassToSpyOn]:
    ClassToSpyOn[Key] extends (...args: any[]) => any
        ? MockFunction<ClassToSpyOn[Key]>
        : ClassToSpyOn[Key];
} & ClassToSpyOn;

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

function createMockFunction<T extends (...args: any[]) => any>(): MockFunction<T> {
    const calls: Array<{arguments: Parameters<T>; result: ReturnType<T> | undefined}> = [];
    let returnValue: ReturnType<T> | undefined = undefined;
    let fakeFn: T | undefined = undefined;

    const mockFn: MockFunction<T> = function (...args: Parameters<T>): ReturnType<T> {
        const call = {arguments: args as Parameters<T>, result: undefined as ReturnType<T> | undefined};
        calls.push(call);

        if (fakeFn) {
            const result: ReturnType<T> = fakeFn(...args);
            call.result = result;
            return result;
        }

        call.result = returnValue;
        return returnValue as ReturnType<T>;
    } as MockFunction<T>;

    mockFn.mock = {calls};
    mockFn.and = {
        returnValue: (value: ReturnType<T>): void => {
            returnValue = value;
        },
        resolveTo: (value: Awaited<ReturnType<T>>): void => {
            returnValue = Promise.resolve(value) as ReturnType<T>;
        },
        callFake: (fn: T): void => {
            fakeFn = fn;
        }
    };

    return mockFn;
}

function mock<T extends object>(obj?: any): Mocked<T> {
    return buildStub(obj ?? {});
}

function buildStub<T extends object>(target: any): Mocked<T> {
    return new Proxy(target, {
        get: (obj: any, property: string | symbol): any => {
            if (property in obj) {
                return obj[property];
            }
            if (property === 'then') {
                return undefined;
            }
            obj[property] = createMockFunction();
            return obj[property];
        }
    }) as Mocked<T>;
}

function createSpy<T extends (...args: any[]) => any = () => void>(): MockFunction<T> {
    return createMockFunction<T>();
}

export {mock, createSpy};
