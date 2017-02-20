/**
 * @module RSI
 */ /** */

import { RSIApiResponse } from './RSIApiResponse.interface';

export interface ApiResponse {
    url:any,
    rawHeaders:any,
    body: RSIApiResponse,
    status:number,
    statusText:string,
}