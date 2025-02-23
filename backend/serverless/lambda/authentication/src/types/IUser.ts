export interface IUser {
    id: string;
    role: string;
    username: string;
    password: string;
    email: string;
    isActive: boolean;
    iat?: number;
    exp?: number;
}  // user interface