/**
 * @module Spectrum
 */ /** */
 
import { TextMessage } from '../interfaces/textMessage.interface';
import { ContentState } from 'draft-js';
import { RSI } from './../../RSI/';

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

    public static generateTextBlocksFromText(text:string, delimiter?:string) {
        let base = ContentState.createFromText(text, delimiter);

        let blocks = base.getBlocksAsArray();
        var finalBlocks = [];

        for(var i =0; i<blocks.length; i++) {
            let m = {
                key: blocks[i].key,
                type:blocks[i].type,
                text: blocks[i].text,
                entityRanges: [],
                inlineStyleRanges: [],
                data: blocks[i].data,
                depth: blocks[i].depth,
            }

            finalBlocks.push(m);
        }

        return finalBlocks;
    }

    public static fetchEmbedMediaId(url:string):Promise<string> {
        return RSI.getInstance().post("api/spectrum/media/embed/fetch",{url: url}).then( (data) => {
            if(!data.success) return null;
            return data.data.id;
        });
    }

    
}