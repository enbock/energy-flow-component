const Module = require('module');

function extendModuleHook() {
    Module._extensions['.css'] = function (module, filename) {
        module._compile('module.exports = "mocked.style {}";', filename);
    };
}

module.exports = extendModuleHook;
