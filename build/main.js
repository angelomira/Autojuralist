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
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const readline = __importStar(require("readline"));
const ROOT_DIRECTORY = __dirname;
const EXCLUDING_DIRECTORIES = ['node_modules', 'venv', '.git', 'out'];
let TARGET_VALUES = ['FALCION', 'PATTERNU', 'PATTERNUGIT'];
(() => __awaiter(void 0, void 0, void 0, function* () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const search_data = (path, search_data) => __awaiter(void 0, void 0, void 0, function* () {
        const content = (yield fs.readFile(path, 'utf-8')).split('\n');
        for (let i = 0; i < content.length; i++) {
            const line = content[i].toUpperCase();
            for (const searching_string of search_data)
                if (line.includes(searching_string))
                    console.log(`Found "${searching_string}" in L#${i++} of "${path}"`);
        }
    });
    const traverse_dir = (dirpath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const files = yield fs.readdir(dirpath);
            for (const file of files) {
                const fpath = path.join(dirpath, file);
                const fstat = yield fs.stat(fpath);
                if (fstat.isDirectory()) {
                    if (!EXCLUDING_DIRECTORIES.includes(file)) {
                        yield traverse_dir(fpath);
                    }
                }
                else if (fstat.isFile()) {
                    yield search_data(fpath, TARGET_VALUES);
                }
            }
        }
        catch (err) {
            console.error(`Error reading directory ${dirpath}: ${err}`);
        }
    });
    const write_manifest = (packageJSON) => __awaiter(void 0, void 0, void 0, function* () {
        const manifestJSON = {
            id: packageJSON.name,
            name: `${packageJSON.name[0].toUpperCase()}${packageJSON.name.slice(1, packageJSON.name.length)}`,
            description: packageJSON.description,
            author: packageJSON.author,
            license: packageJSON.license,
            version: packageJSON.version,
            authorUrl: '-'
        };
        yield fs.writeFile('manifest.json', JSON.stringify(manifestJSON, null, 4));
    });
    if (!(yield fs.pathExists(ROOT_DIRECTORY + '/.env'))) {
        yield fs.createFile('.env');
        yield fs.writeFile('.env', 'EXAMPLE_API_KEY=');
    }
    dotenv.config({
        path: './.env',
        encoding: 'utf-8'
    });
    const packageJSON = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }));
    if (!(yield fs.pathExists(ROOT_DIRECTORY + '/manifest.json'))) {
        yield fs.createFile('manifest.json');
        yield write_manifest(packageJSON);
    }
    const manifestAsJSON = JSON.parse(fs.readFileSync('manifest.json', { encoding: 'utf-8' }));
    const checkingRes = packageJSON.id === manifestAsJSON.id && packageJSON.name === manifestAsJSON.name
        && packageJSON.description === manifestAsJSON.description && packageJSON.author === manifestAsJSON.author
        && packageJSON.license === manifestAsJSON.license && packageJSON.version === manifestAsJSON.version;
    if (!checkingRes)
        console.error('There is desync in Manifest JSON and Package JSON! Causing override to manifest.json, but backuping at manifest-copy.json');
    yield fs.copyFile('manifest.json', 'manifest-backup.json');
    yield write_manifest(packageJSON);
    rl.question('Do you want to change the finding signature for the script? (y/n): ', (answ1) => {
        if (answ1 == 'y')
            rl.question('What words you need to find? (separated by comma): ', (answ2) => {
                const res = answ2.split(',');
                TARGET_VALUES = res;
                traverse_dir(ROOT_DIRECTORY);
                rl.close();
            });
        else {
            traverse_dir(ROOT_DIRECTORY);
            rl.close();
        }
    });
}))();
