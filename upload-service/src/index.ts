import express from 'express';
import cors from 'cors';
import simpleClone from 'simple-git';
import { generate } from './utils';
import path from 'path' 
import { getAllFiles } from './file';
import { uploadFile } from './aws';
import { createClient } from 'redis';
const app = express()
const publisher = createClient();
publisher.connect(); 

app.use(cors());
app.use(express.json());
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    console.log(id);
    await simpleClone().clone(repoUrl,path.join(__dirname,`output/${id}`));
    console.log("cloned");
    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    console.log(files);

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length+1), file);
    })

    publisher.lPush("build-queue",id);

    res.json({
        id:id
    });
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});