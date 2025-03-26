/// <reference path="../src/global.d.ts" />
/// <reference path="./jasmine.d.ts" />
// noinspection JSConstantReassignment,JSUnusedGlobalSymbols

process.env.NODE_ENV = 'testing';
process.env.TZ = 'Europe/Berlin';

import * as jsdom from 'jsdom';
import 'jsdom';

global.window = new jsdom.JSDOM().window as any;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.customElements = window.customElements;
global.MouseEvent = window.MouseEvent;

require('./extendModuleHook')();
require('./mock');
require('./mockModule');

// @ts-ignore
global.Storage = class {
    length: number = 0;

    setItem() {
    };

    removeItem() {
    };

    key() {
    };

    getItem() {
    };
};
