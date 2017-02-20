/**
 * @module Spectrum
 */ /** */

import { Service as RSI } from './../../RSI/services/rsi.service';
import { Lobby } from './../interfaces/lobby.interface';
import { Broadcaster } from './../services/broadcaster.service';
import { receivedTextMessage } from '../interfaces/receivedTextMessage.interface';

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
    /** Our message listener */
    private _messageListener:number;

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
     * Subscribe a lobby will subscribe to its ws event and broadcast presence
     * It is needed to subscribe to a channel to get any update from it (new message/reaction...)
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


    public unSubscribe() {

    }

    /**
     * Sets a function to be called everytime a new TextMessage is received in this lobby.
     * /!\ to receive any messages you need to be subscribed to this lobby
     * @see subscribe()
     * @todo have more than one callback
     * @param callback the function to callback on messages
     */
    public OnTextMessage(callback=(message:receivedTextMessage)=>{}) {        
        this.broadcaster.removeListener(this._messageListener);
        this._messageListener = this.broadcaster.addListener("message.new", m => callback(m.message), {
            message: {
                lobby_id: this._lobby.id,
            }
        });
    }

    /**
     * Tells the broadcaster to stop sending the messages from this lobby
     * to the callback.
     * Does not unSubscribe from the channel on its own.
     */
    public closeOnTextMessage() {
        this.broadcaster.removeListener(this._messageListener);
    }

    public getLobby() {
        return this._lobby;
    }


}