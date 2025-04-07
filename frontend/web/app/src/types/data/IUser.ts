export interface IProfile {
    username: string,
    enabled: boolean,
    status: string,
    created: string,
    modified: string,
    attributes: IUser
}

export interface IUser {
    email: string,
    email_verified: string,
    nickname: string,
    name: string,
    "custom:role": string,
    sub: string
}
