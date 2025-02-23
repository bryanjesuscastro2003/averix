import express, { Request, Response } from 'express';
import { handler } from './logup';
import { handler as loginHandler } from './login';
import { handler as profileHandler } from './profile';
import { CreateTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    try {

        const client = new DynamoDBClient({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });
        const docClient = DynamoDBDocumentClient.from(client, {});
        const createTable = new CreateTableCommand({
            TableName: "YourTableName", // Replace with your desired table name
            KeySchema: [
                { AttributeName: "id", KeyType: "HASH" },   // Partition key
                { AttributeName: "role", KeyType: "RANGE" } // Sort key
            ],
            AttributeDefinitions: [
                { AttributeName: "id", AttributeType: "S" },   // String type for id
                { AttributeName: "role", AttributeType: "S" }, // Boolean type for isActive
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,  // Adjust based on your needs
                WriteCapacityUnits: 5  // Adjust based on your needs
            }
        });
        const response = await docClient.send(createTable);
        console.log(response);
        res.send('This is a serverless application by bryan');
    }
    catch (error) {
        console.error("Error: ", error);
        res.send('This is a serverless application by bryan');
    }
});

app.post("/logup", async (req: Request, res: Response) => {
    const response = await handler(req, res);
    console.log("Response: ", response);
    res.send("Logup");
})

app.post("/login", async (req: Request, res: Response) => {
    const response = await loginHandler(req, res);
    console.log("Response: ", response);
    res.send("Login");
})

app.get("/profile", async (req: Request, res: Response) => {
    const response = await profileHandler(req, res);
    console.log("Response: ", response);
    res.send("Profile");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})