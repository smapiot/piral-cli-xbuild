"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPilet = exports.debugPilet = exports.buildPiral = exports.watchPiral = exports.debugPiral = void 0;
const path_1 = require("path");
exports.debugPiral = {
    path: (0, path_1.resolve)(__dirname, 'xbuild', 'piral-debug.js'),
};
exports.watchPiral = {
    path: (0, path_1.resolve)(__dirname, 'xbuild', 'piral-watch.js'),
};
exports.buildPiral = {
    path: (0, path_1.resolve)(__dirname, 'xbuild', 'piral-build.js'),
};
exports.debugPilet = {
    path: (0, path_1.resolve)(__dirname, 'xbuild', 'pilet-debug.js'),
};
exports.buildPilet = {
    path: (0, path_1.resolve)(__dirname, 'xbuild', 'pilet-build.js'),
};
//# sourceMappingURL=actions.js.map