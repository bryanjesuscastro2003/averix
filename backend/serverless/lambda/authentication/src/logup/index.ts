import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { IUser } from '../types/IUser';
import jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';

dotenv.config();


const secretKey: Secret = process.env.JWT_SECRET_KEY!;

const hashedPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const generateToken = (payload: object, expiresIn: string = '1h'): string => {
    return jwt.sign(payload, secretKey, { expiresIn: 50, algorithm: 'HS256' });
};


export const handler = async (event: APIGatewayProxyEvent | any, context: Context | any): Promise<APIGatewayProxyResult | any> => {
    try {
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });
        const docClient = DynamoDBDocumentClient.from(client, {});
        const body = event.body;
        const { username, password, email } = body;
        let command = new ScanCommand({
            TableName: "Dronautica_authentication",
            FilterExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": { S: username }
            }
        })
        let response = await docClient.send(command);
        if (response.Items.length) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Such user already exists choose another username"
                })
            }
        }
        const hashed = await hashedPassword(password);
        const user: IUser = {
            id: uuidv4(),
            role: "ADMIN",
            username,
            password: hashed,
            email,
            isActive: true
        }
        command = new PutItemCommand({
            TableName: "Dronautica_authentication",
            Item: {
                //id: { S: user.id },
                id: { S: uuidv4() },
                role: { S: user.role },
                username: { S: user.username },
                password: { S: user.password },
                email: { S: user.email },
                isActive: { BOOL: user.isActive }
            },
        })
        response = await docClient.send(command);
        const token = generateToken({ username, role: user.role });
        console.log("Response: ", response);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Logup handler called",
                token
            }),
        };
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Logup Error occurred",
                token: null
            })
        }
    }

};