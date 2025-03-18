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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProject = buildProject;
exports.copyFinalDist = copyFinalDist;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3({
    accessKeyId: '',
    secretAccessKey: ''
});
function buildProject(id) {
    return new Promise((resolve) => {
        var _a, _b;
        const child = (0, child_process_1.exec)(`cd ${path_1.default.join(__dirname, `output/${id}`)} && npm install && npm run build`);
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            console.log('stdout:' + data);
        });
        (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        child.on('close', function (code) {
            resolve("");
        });
    });
}
function copyFinalDist(id) {
    const folderPath = path_1.default.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    });
}
const getAllFiles = (folderPath) => {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path_1.default.join(folderPath, file);
        if (fs_1.default.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath));
        }
        else {
            response.push(fullFilePath);
        }
    });
    return response;
};
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = yield s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
});
