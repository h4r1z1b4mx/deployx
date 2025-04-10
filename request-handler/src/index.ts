import expres from 'express';
import {S3} from 'aws-sdk';

const s3 = new S3({
    accessKeyId:'',
    secretAccessKey:''
});

const app = expres();

app.get('/*', async (req, res) => {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;
    const contents = await s3.getObject({
        Bucket: "harizibam",
        Key:`dist/${id}${filePath}`
    }).promise(); 

    const type = filePath.endsWith("html")?"text/html":filePath.endsWith("css")?"text/css":"application/javascript";

    res.set("Content-Type",type);
    res.send(contents.Body);  
});

app.listen(3001, ()=>{
    console.log('Server is running on port 3001');
});