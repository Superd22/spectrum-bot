/**
 * @module RSI
 */ /** */

export interface RSIApiResponse<T = any> {
    success: number;
    data: T;
    code: string;
    msg: string;
}
