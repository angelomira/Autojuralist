"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const path = __importStar(require("node:path"));
const srcPath = path.resolve(__dirname, '..', '..', '..');
const patchExportFnPath = path.resolve(__dirname, 'export_all_patches.py');
const configPath = path.resolve(__dirname, '..', 'patches', 'config.json');
// Re-export all the patches to check if there were changes.
const proc = (0, node_child_process_1.spawnSync)('python3', [patchExportFnPath, configPath, '--dry-run'], {
    cwd: srcPath
});
// Fail if patch exporting returned 1, e.g dry run failed.
if (proc.status === 1) {
    console.log(proc.stderr.toString('utf8'));
    process.exit(1);
}
