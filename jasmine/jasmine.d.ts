import SpyObj = jasmine.SpyObj;

type MockedObject<T = any> = SpyObj<T>;
type Mocked<ClassToSpyOn> = AddAutoSpies<ClassToSpyOn> &
    AddAccessorsSpies<ClassToSpyOn, jasmine.Spy>;

type AddAutoSpies<ClassToSpyOn> = {
    [Key in keyof ClassToSpyOn]:
    ClassToSpyOn[Key] extends (...args: any[]) => any
        ? jasmine.Spy<ClassToSpyOn[Key]>
        : ClassToSpyOn[Key];
};
type AddAccessorsSpies<T, LibSpecificFunctionSpy> = T & {
    accessorSpies: {
        setters: {
            [k in keyof T]: LibSpecificFunctionSpy;
        };
        getters: {
            [k in keyof T]: LibSpecificFunctionSpy;
        };
    };
};

declare function mockModule(path: string, factory: (origModule: any) => Object): void;

declare function restoreModules(): void;

declare function mock<T extends object>(obj?: any): Mocked<T>;
