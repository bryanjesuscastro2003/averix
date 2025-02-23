!#/bin/bash

echo "installing depemdencies"
npm install @aws-sdk/client-lambda 
npm install typescript ts-node @types/node @types/aws-lambda
npm install express
npm install ts-node-dev --save-dev

echo "starting server"
npm run dev