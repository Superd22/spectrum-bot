/**
 * @module Spectrum
 */ /** */

import { Service as RSI } from './../RSI/rsi.service';
import { Lobby } from './lobby.interface';
import { Broadcaster } from './broadcaster.service';

/**
 * Used internal to represent a spectrum text lobby
 * @class SpectrumLobby
 */
export class SpectrumLobby {

    /** used internally to store the rsi lobby info */
    private _lobby: Lobby;
    /** used internally to store the rsi community info */
    private _community;
    /** instance of RSI api */
    private rsi: RSI = RSI.getInstance();
    /** instance of RSI Spectrum ws */
    private broadcaster:Broadcaster = Broadcaster.getInstance();

    /**
     * Create a new SpectrumLobby
     * @param lobby the rsi lobby info
     */
    constructor(lobby: Lobby) {
        this._lobby = lobby;
    }

    /**
     * Sends a plain text message to the lobby
     * @param text the text to send
     * @return A promise on the rsi api call 
     */
    public sendPlainTextMessage(text:string): Promise<any> {
        let m = {
            content_state: {
                blocks: [
                    {
                        data: {},
                        depth: 0,
                        entityRanges: [],
                        inlineStyleRanges: [],
                        // I typed this at random... oops
                        key: "dgmak",
                        text: text,
                        type: "unstyled"
                    }
                ],
                entityMap: {},
            },
            highlight_role_id: null,
            lobby_id: this._lobby.id,
            media_id: null,
            plaintext: text,
        };

        return this.rsi.post("api/spectrum/message/create", m).then(res => console.log(res.data));
    }

    public getHistory() {

    }

    public getMessages() {
        this.getHistory();
    }

    public getPresence() {

    }

    public getCommunity() {

    }

    /**
     * Joining a lobby will subscribe to its ws event and broadcast presence
     */
    public subscribe() {
        this.broadcaster.broadCastMessage(this.buildSubscribtionMessage());
    }

    /**
     * Builds and return the expected subscribtion ws message for this channel
     * @return the message that can be sent to the ws to subscribe to this channel
     */
    public buildSubscribtionMessage() {
        return {
            subscription_keys: [this._lobby.subscription_key],
            subscription_scope: "content",
            type: "subscribe"
        };
    }

    public join() {
    }

    public unSubscribe() {

    }


}