///<reference path="../src/global.d.ts"/>
import m from 'module';

let Module: any = m;
const origLoader: Function = Module._load;
const moduleCache: { [request: string]: any } = {};
const moduleCopy: { [request: string]: any } = {};

// Reference to https://github.com/nodejs/node/blob/main/lib/internal/modules/cjs/loader.js#L950
Module._load = function (request: string, parent: Object, isMain: boolean): Object {
    let module: Object = origLoader(request, parent, isMain);

    moduleCache[request] = module;
    moduleCopy[request] = {...module};

    return module;
};

global.mockModule = function mockModule(path: string, factory: (origModule: any) => Object): void {
    const module: any = moduleCache[path];
    if (module === undefined) throw new TypeError('Module ' + path + ' is not imported or does not exists.');
    const mock: any = factory(module);
    Object.keys(mock).forEach(key => {
        module[key] = mock[key];
    });
};

global.restoreModules = function restoreModules(): void {
    for (const path of Object.keys(moduleCopy)) {
        const copy: any = moduleCopy[path];
        const module: any = moduleCache[path];
        Object.keys(copy).forEach(key => {
            try {
                module[key] = copy[key];
            } catch {
            }
        });
    }
};
