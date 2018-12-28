/**
 * @module Spectrum
 */

import { RSIService as RSI } from "../../../RSI/services/rsi.service";
import { ISpectrumLobby } from "../../interfaces/spectrum/community/chat/lobby.interface";
import { SpectrumBroadcaster } from "../../services/broadcaster.service";
import { receivedTextMessage } from "../../interfaces/spectrum/community/chat/receivedTextMessage.interface";
import { SpectrumTextMessage } from "./textMessage.component";
import { ISpectrumTextMessage, ISpectrumTextPacket } from "../../index";
import { SpectrumRichText, ISpectrumDraftJSRichText } from "./rich-text.component";
import { convertFromRaw } from "draft-js";

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
        if (typeof lobby == "number" || typeof lobby == "string")
            this._lobby = { id: lobby, name: null };
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
     * @deprecated
     * @see sendMessage
     * @return A promise on the rsi api call
     */
    public sendPlainTextMessage(
        text: string,
        highlight_role_id = null
    ): Promise<SpectrumTextMessage> {
        return this.sendMessage(text, highlight_role_id);
    }

    /**
     * Sends a text message to the given lobby
     * @param text the text to send
     * @param contentState the raw contentState to send
     * @param textMessage the textmessage to send (will take its content)
     * @param highlight_role_id the id of the highlight to go for
     */
    public sendMessage(text: string, highlight_role_id?: any): Promise<SpectrumTextMessage>;
    public sendMessage(
        contentState: ISpectrumDraftJSRichText,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage>;
    public sendMessage(
        textMessage: ISpectrumTextMessage,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage>;
    public sendMessage(
        text: string | ISpectrumDraftJSRichText | ISpectrumTextMessage,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage> {
        const m = this.generateTextPayload(<any>text, null, highlight_role_id);

        return this.doPostMessage(m);
    }

    /**
     * Sends a text message with an embed to the given lobby
     * @param text the text to send
     * @param contentState the raw contentState to send
     * @param textMessage the textmessage to send (will take its content)
     * @param embedUrl the url of the embed to join
     * @param highlight_role_id the id of the highlight to go for
     */
    public sendMessageEmbed(
        text: string,
        embedUrl: string,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage>;
    public sendMessageEmbed(
        contentState: ISpectrumDraftJSRichText,
        embedUrl: string,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage>;
    public sendMessageEmbed(
        textMessage: ISpectrumTextMessage,
        embedUrl: string,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage>;
    public sendMessageEmbed(
        text: string | ISpectrumDraftJSRichText | ISpectrumTextMessage,
        embedUrl: string,
        highlight_role_id?: any
    ): Promise<SpectrumTextMessage> {
        if (!embedUrl) return this.sendMessage(<any>text);

        return SpectrumTextMessage.fetchEmbedMediaId(embedUrl).then(embedId => {
            let m = this.generateTextPayload(<any>text, embedId, highlight_role_id);
            return this.doPostMessage(m);
        });
    }

    /**
     * Sends a text messages with an embeded link
     * @deprecated
     * @see sendMessageEmbed
     * @param text the text to send
     * @param url the url of the object to embed
     * @param highlight_role_id the role id to take (color of the post)
     * @return information on the created post
     */
    public sendTextMessageWithEmbed(
        text: string,
        embedUrl: string,
        highlight_role_id = null
    ): Promise<SpectrumTextMessage> {
        return this.sendMessageEmbed(text, embedUrl, highlight_role_id);
    }

    /**
     * @todo create interface to validate postData
     */
    private doPostMessage(postData: ISpectrumTextPacket): Promise<SpectrumTextMessage> {
        return this.rsi.post("api/spectrum/message/create", postData).then(res => {
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
                entityMap: {}
            },
            highlight_role_id: null,
            lobby_id: this._lobby.id,
            media_id: null,
            plaintext: text,
            message_id: messageId
        };

        return this.rsi.post("api/spectrum/message/edit", m).then(res => console.log(res.data));
    }

    /**
     * Create the text payload for this lobby
     * @param text the text that will be parsed
     * @param mediaId the media id for embeds
     * @param highlightId the group id to use for the highlight
     */
    private generateTextPayload(text: string, mediaId?, highlightId?): ISpectrumTextPacket;
    private generateTextPayload(
        contentState: ISpectrumDraftJSRichText,
        mediaId?,
        highlightId?
    ): ISpectrumTextPacket;
    private generateTextPayload(
        message: ISpectrumTextMessage,
        mediaId?,
        highlightId?
    ): ISpectrumTextPacket;
    private generateTextPayload(
        text: string | ISpectrumDraftJSRichText | ISpectrumTextMessage,
        mediaId = null,
        highlightId = null
    ): ISpectrumTextPacket {
        let contentState: ISpectrumDraftJSRichText;
        let plainText: string;

        if (typeof text === typeof "abc") {
            const rich = new SpectrumRichText(<string>text);
            contentState = rich.toJson();
            plainText = rich.plainText;
        } else if ((<ISpectrumDraftJSRichText>text).blocks) {
            contentState = <ISpectrumDraftJSRichText>text;
            plainText = convertFromRaw(<ISpectrumDraftJSRichText>text).getPlainText();
        } else if ((<ISpectrumTextMessage>text).content_state.blocks) {
            contentState = (<ISpectrumTextMessage>text).content_state;
            plainText = convertFromRaw((<ISpectrumTextMessage>text).content_state).getPlainText();
        } else throw "couldn't convert text payload";

        return {
            content_state: contentState,
            highlight_role_id: highlightId,
            lobby_id: this._lobby.id,
            media_id: mediaId,
            plaintext: plainText
        };
    }

    public getHistory() {}

    public getMessages() {
        this.getHistory();
    }

    public getPresence() {}

    public getCommunity() {}

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

    /**
     * not implemented yet
     */
    public unSubscribe() {}

    /**
     * Sets a function to be called everytime a new TextMessage is received in this lobby.
     * /!\ to receive any messages you need to be subscribed to this lobby
     * @see subscribe()
     * @todo have more than one callback
     * @param callback the function to callback on messages
     */
    public OnTextMessage(callback = (message: receivedTextMessage) => {}) {
        this.broadcaster.removeListener(this._messageListener);
        this._messageListener = this.broadcaster.addListener(
            "message.new",
            m => callback(m.message),
            {
                message: {
                    lobby_id: this._lobby.id
                }
            }
        );
    }

    /**
     * Tells the broadcaster to stop sending the messages from this lobby
     * to the callback.
     * Does not unSubscribe from the channel on its own.
     */
    public closeOnTextMessage() {
        this.broadcaster.removeListener(this._messageListener);
    }

    public get lobby(): ISpectrumLobby {
        return this._lobby;
    }
}
