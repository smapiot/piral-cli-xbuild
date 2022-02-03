"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const helpers_1 = require("../helpers");
function validateConfig(config) {
    if (typeof config.command !== 'string') {
        throw new Error('The "command" property needs to be a string.');
    }
    return {
        command: config.command,
    };
}
const handler = {
    create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { root } = options;
            const config = yield (0, helpers_1.getConfig)(root, 'piral:debug', validateConfig);
            return Promise.resolve({
                bundle() {
                    return Promise.resolve({
                        outDir: '',
                        outFile: '',
                    });
                },
                onEnd() { },
                onStart() { },
            });
        });
    },
};
exports.create = handler.create;
//# sourceMappingURL=piral-debug.js.map