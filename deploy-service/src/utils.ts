import {exec, spawn }from 'child_process';
import fs from 'fs';
import path from 'path';
import {S3} from 'aws-sdk';

const s3 = new S3({
    accessKeyId:'',
    secretAccessKey:''
});
export function buildProject(id:string){
    return new Promise((resolve)    => {
        const child = exec(`cd ${path.join(__dirname,`output/${id}`)} && npm install && npm run build`);
        child.stdout?.on('data', function(data){
            console.log('stdout:' + data)
        });

        child.stderr?.on('data', function (data){
            console.log('stderr: ' +data);
        });
        child.on('close', function (code){
            resolve("")
        });
    });
}

export function copyFinalDist(id:string){
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/`+file.slice(folderPath.length+1),file);
    });
}
const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
} 