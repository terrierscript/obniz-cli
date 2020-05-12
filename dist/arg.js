"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args = require("minimist")(process.argv.slice(2), { "--": true });
exports.default = async (routes) => {
    const command = args._;
    if (!command) {
        throw new Error(`No Command Provided`);
    }
    else if (args._ > 1) {
        throw new Error(`Too Many Command`);
    }
    const route = routes[command];
    if (args.help) {
        if (route && route.help) {
            await route.help();
        }
        else {
            await routes.help();
        }
    }
    else {
        if (!route) {
            console.error(`Unknown Command ${command} see below help`);
            await routes.help();
            return;
        }
        await route.execute(args);
    }
};