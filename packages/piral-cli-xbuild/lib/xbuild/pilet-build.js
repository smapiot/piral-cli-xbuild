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
const utils_1 = require("piral-cli/utils");
const path_1 = require("path");
const events_1 = require("events");
const helpers_1 = require("../helpers");
function validateConfig(config) {
    if (typeof config.command !== 'string') {
        throw new Error('The required "command" property needs to be a string.');
    }
    if (typeof config.outputDir !== 'string') {
        throw new Error('The required "outputDir" property needs to be a string.');
    }
    if (typeof config.mainFile !== 'string') {
        throw new Error('The required "mainFile" property needs to be a string.');
    }
    if (config.skipTransform !== undefined && typeof config.skipTransform !== 'boolean') {
        throw new Error('The optional "skipTransform" property needs to be a boolean.');
    }
    return {
        command: config.command,
        mainFile: config.mainFile,
        outputDir: config.outputDir,
        skipTransform: config.skipTransform || false,
    };
}
const handler = {
    create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { root, contentHash, entryModule, externals, importmap, logLevel, minify, outDir, outFile, piral, sourceMaps, targetDir, version, } = options;
            const eventEmitter = new events_1.EventEmitter();
            const config = yield (0, helpers_1.getConfig)(root, 'pilet:build', validateConfig);
            process.env.PIRAL_ROOT = root;
            process.env.PIRAL_LOG_LEVEL = logLevel.toString();
            process.env.PIRAL_TARGET = targetDir;
            process.env.PILET_CONTENT_HASH = contentHash.toString();
            process.env.PILET_SOURCE_MAPS = sourceMaps.toString();
            process.env.PILET_MINIFY = minify.toString();
            process.env.PILET_ENTRY_MODULE = entryModule;
            process.env.PILET_EXTERNALS = externals.join(',');
            process.env.PILET_IMPORTMAP = JSON.stringify(importmap);
            process.env.PILET_SCHEMA = version;
            process.env.PILET_PIRAL_INSTANCE = piral;
            return {
                bundle() {
                    return __awaiter(this, void 0, void 0, function* () {
                        eventEmitter.emit('start', {});
                        yield (0, utils_1.runScript)(config.command, root);
                        const output = (0, path_1.resolve)(root, config.outputDir);
                        const mainFile = (0, path_1.resolve)(output, config.mainFile);
                        const exists = yield (0, utils_1.checkExists)(mainFile);
                        if (!exists) {
                            throw new Error(`Could not find file "${mainFile}". Maybe the command "${config.command}" did not run successfully.`);
                        }
                        if (!config.skipTransform) {
                            //TODO transform to schema
                        }
                        //TODO copy files to target
                        const result = {
                            outDir,
                            outFile,
                        };
                        eventEmitter.emit('end', result);
                        return result;
                    });
                },
                onEnd(cb) {
                    eventEmitter.on('end', cb);
                },
                onStart(cb) {
                    eventEmitter.on('start', cb);
                },
            };
        });
    },
};
exports.create = handler.create;
//# sourceMappingURL=pilet-build.js.map