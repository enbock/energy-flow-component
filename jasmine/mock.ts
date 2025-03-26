///<reference path="../src/global.d.ts"/>

function mock<T extends object>(obj?: any): Mocked<T> {
    return buildStub(obj ?? {} as T);
}

function buildStub<T extends object>(target: T): Mocked<T> {
    return new Proxy<T>(target, {
        get: (obj: T, property: string): T[keyof T] => {
            if (property in obj) {
                return obj[<keyof T>property];
            }
            if (property == 'then') {
                // Resolve timeout on data objects that returns over async
                // @ts-ignore
                return undefined;
            }
            (obj as any)[property] = jasmine.createSpy(property);
            return (obj as any)[property];
        }
    }) as Mocked<T>;
}

global.mock = mock;
