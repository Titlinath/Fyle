"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConfig = void 0;
const errors_1 = require("./errors");
function verifyConfig(options) {
    if (!options.target && !options.router) {
        throw new Error(errors_1.ERRORS.ERR_CONFIG_FACTORY_TARGET_MISSING);
    }
}
exports.verifyConfig = verifyConfig;
