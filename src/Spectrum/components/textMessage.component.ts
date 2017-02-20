/**
 * @module Spectrum
 */ /** */
 
import { TextMessage } from '../interfaces/textMessage.interface';


export class SpectrumTextMessage {
    protected _message:TextMessage;

    constructor(message:TextMessage)
    constructor(plainText:string, lobby_id?);
    constructor(message, lobby_id?) {
        if(typeof message == "string") {
            this._message.plaintext = message;
            if(lobby_id) this._message.lobby_id = lobby_id;
        }
        else {
            this._message = message;
        }
    }

    public getMessage() {
        return this._message;
    }

    public getPlainText() {
        return this._message.plaintext;
    }

    
}