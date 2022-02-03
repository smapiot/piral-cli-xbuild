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
exports.getConfig = void 0;
const utils_1 = require("piral-cli/utils");
function getConfig(root, name, validator) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = 'package.json';
        const details = yield (0, utils_1.readJson)(root, fileName);
        const section = details[name];
        if (!section) {
            throw new Error(`Could not find a "${name}" section in the "${fileName}" of "${root}". Make sure it exists.`);
        }
        try {
            return validator(section);
        }
        catch (err) {
            throw new Error(`Error while validating the "${name}" section of the "${fileName}": ${err.message}`);
        }
    });
}
exports.getConfig = getConfig;
//# sourceMappingURL=helpers.js.map