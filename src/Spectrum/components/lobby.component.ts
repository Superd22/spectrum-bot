/**
 * @module Spectrum
 */ /** */

import { Service as RSI } from './../../RSI/services/rsi.service';
import { ISpectrumLobby } from './../interfaces/lobby.interface';
import { SpectrumBroadcaster } from './../services/broadcaster.service';
import { receivedTextMessage } from '../interfaces/receivedTextMessage.interface';
import { SpectrumTextMessage } from './textMessage.component';

/**
 * Used internal to represent a spectrum text lobby
 * @class SpectrumLobby
 */
export class SpectrumLobby {

    /** used internally to store the rsi lobby info */
    private _lobby: ISpectrumLobby | any;
    /** used internally to store the rsi community info */
    private _community;
    /** instance of RSI api */
    private rsi: RSI = RSI.getInstance();
    /** instance of RSI Spectrum ws */
    private broadcaster: SpectrumBroadcaster = SpectrumBroadcaster.getInstance();
    /** Our message listener */
    private _messageListener: number;

    /**
     * Create a new SpectrumLobby
     * @param lobby the rsi lobby info
     */
    constructor(lobby: number);
    constructor(lobby: ISpectrumLobby);
    constructor(lobby: any) {
        if (typeof lobby == 'number' || typeof lobby == 'string') this._lobby = { id: lobby, name: null };
        else {
            this._lobby = lobby;
            this._lobby.id = Number(lobby.id);
            this._lobby.community_id = Number(lobby.community_id);
            this._lobby.online_members_count = Number(lobby.online_members_count);
        }
    }

    /**
     * Sends a plain text message to the lobby
     * @param text the text to send
     * @param highlight_role_id the role id to take (color of the post)
     * @return A promise on the rsi api call 
     */
    public sendPlainTextMessage(text: string, highlight_role_id = null): Promise<SpectrumTextMessage> {
        let m = this.generateTextPayload(text, null, highlight_role_id);

        console.log("paylod:");
        console.log(JSON.stringify(m,null,2));
        console.log("\n\n");

        return this.doPostMessage(m);
    }

    /**
     * Sends a text messages with an embeded link
     * @param text the text to send
     * @param url the url of the object to embed
     * @param highlight_role_id the role id to take (color of the post)
     * @return information on the created post
     */
    public sendTextMessageWithEmbed(text: string, embedUrl: string, highlight_role_id = null): Promise<SpectrumTextMessage> {
        if (!embedUrl) return this.sendPlainTextMessage(text, highlight_role_id);

        return SpectrumTextMessage.fetchEmbedMediaId(embedUrl).then((embedId) => {
            let m = this.generateTextPayload(text, embedId, highlight_role_id);
            return this.doPostMessage(m);
        });
    }

    /**
     * @todo create interface to validate postData
     */
    private doPostMessage(postData): Promise<SpectrumTextMessage> {
        return this.rsi.post("api/spectrum/message/create", postData).then((res) => {
            return new SpectrumTextMessage(res.data);
        });
    }

    public editPlainTextMessage(messageId: number, text: string): Promise<any> {
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
            message_id: messageId,
        };

        return this.rsi.post("api/spectrum/message/edit", m).then(res => console.log(res.data));
    }

    private generateTextPayload(text, mediaId = null, highlightId = null) {
        let textObj = {text:text};
        return {
            content_state: SpectrumTextMessage.generateContentStateFromText(textObj),
            highlight_role_id: highlightId,
            lobby_id: this._lobby.id,
            media_id: mediaId,
            plaintext: textObj.text,
        };
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
        this.broadcaster.getState().subscribeToLobby(this);
    }

    public isSubscribed(): boolean {
        return this.broadcaster.getState().isSubscribedToLobby(this);
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
    public OnTextMessage(callback = (message: receivedTextMessage) => { }) {
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

    public getLobby(): ISpectrumLobby {
        return this._lobby;
    }


}