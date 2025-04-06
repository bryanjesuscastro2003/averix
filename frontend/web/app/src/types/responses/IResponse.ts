export interface IResponse<T> {
    ok: boolean,
    message: string,
    error: string,
    data: T
}