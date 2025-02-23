import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { IUser } from '../types/IUser';
import jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";


dotenv.config();


// Function to verify a password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
};

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        });
        const docClient = DynamoDBDocumentClient.from(client, {});
        console.log("Event: ", event.body);
        const body: { username: string, password: string } = event.body!;
        console.log("Username: ", body.username);
        const command = new ScanCommand({
            TableName: "Dronautica_authentication",
            FilterExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": { S: body.username }
            }
        })
        const response: any = await docClient.send(command);
        console.log("Response: ", response.Items.length);
        if (!response.Items.length) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "User not found"
                })
            }
        }
        let user = response.Items[0];
        user = {
            id: user.id.S!,
            role: user.role.S!,
            username: user.username.S!,
            password: user.password.S!,
            email: user.email.S!,
            isActive: user.isActive.BOOL!
        }

        console.log("User: ", user);
        const match = await verifyPassword(body.password, user.password);
        if (!match) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Unauthorized"
                })
            }
        }
        const token = jwt.sign({ username: body.username, role: user.role }, process.env.JWT_SECRET_KEY!, { expiresIn: 500, algorithm: 'HS256' });
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Login handler called",
                token
            })
        }
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error"
            })
        }
    }

}