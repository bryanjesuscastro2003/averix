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
        const authHeader = event.headers.authorization!;
        let token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as IUser;
        console.log("Decoded: ", decoded);
        const command = new ScanCommand({
            TableName: "Dronautica_authentication",
            FilterExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": { S: decoded.username }
            }
        })
        const response: any = await docClient.send(command);
        if (!response.Items.length) {
            throw new Error("User not found");
        }
        let user = response.Items[0];
        // Verify token expiration and if it is close to expiration, generate a new token
        const currentTime = Math.floor(Date.now() / 1000);
        console.log("Token expiration: ", decoded.exp!);
        console.log("Current time: ", currentTime);
        if (decoded.exp! - currentTime < 300) {
            console.log("Token is about to expire");
            token = jwt.sign({ username: user.username.S!, role: user.role.S }, process.env.JWT_SECRET_KEY!, { expiresIn: 200, algorithm: 'HS256' });
        }
        user = {
            id: user.id.S!,
            role: user.role.S!,
            username: user.username.S!,
            email: user.email.S!,
            isActive: user.isActive.BOOL!,
            token
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                user
            })
        }
    }
    catch (error) {
        console.error("Error: ", error.message);
        if (error.message === "User not found") {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "User not found"
                })
            }
        }
        else if (error.message === "jwt expired") {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Token expired"
                })
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal server error"
            })
        }
    }

}