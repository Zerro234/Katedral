/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const fs = require('fs');

const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzNhYmQ5MDY5ZjExNTQ5YWRhM2JiYTczODBlMGRkNmY5EgsSBxCji_ivyBUYAZIBIwoKcHJvamVjdF9pZBIVQhM3OTQ1NTY1NDgyOTgzOTM5Njcz&filename=&opi=89354086';

https.get(url, (res) => {
  const path = 'stitch_sakramen.html';
  const filePath = fs.createWriteStream(path);
  res.pipe(filePath);
  filePath.on('finish', () => {
    filePath.close();
    console.log('Download Completed');
  });
});
