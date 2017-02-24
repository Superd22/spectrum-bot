import { Broadcaster } from './../services/broadcaster.service';
/**
 * @module Spectrum
 */ /** */

import { TextMessage } from '../interfaces/textMessage.interface';
import { ContentState } from 'draft-js';
import { RSI } from './../../RSI/';
import { emojioneList } from './emoji.component';

export class SpectrumTextMessage {
    protected _message: TextMessage;
    protected static _emojis = "";
    /** instance of RSI Spectrum ws */
    private broadcaster: Broadcaster = Broadcaster.getInstance();
    protected _reactionListener;

    constructor(message: TextMessage)
    constructor(plainText: string, lobby_id?);
    constructor(message, lobby_id?) {
        if (typeof message == "string") {
            this._message.plaintext = message;
            if (lobby_id) this._message.lobby_id = lobby_id;
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

    public onReaction(callback) {
        this.broadcaster.removeListener(this._reactionListener);
        this._reactionListener = this.broadcaster.addListener("reaction", m => callback(m), {
            reaction: {
                entity_id: this._message.id,
            }
        });
    }

    public removeOnReaction() {
        this.broadcaster.removeListener(this._reactionListener);
    }

    public onEdit() {

    }

    public onDelete() {

    }

    public static generateContentStateFromText(text: string, delimiter?: string, disableEmojis = false) {
        let base = ContentState.createFromText(text, delimiter);

        let blocks = base.getBlocksAsArray();
        var finalBlocks = [];
        var finalEntities = [];
        var entityMap = {};
        var curEntity: { EntityMap: any, entityRanges: any } = { EntityMap: {}, entityRanges: [] };

        /**
         *  blocks: SpectrumTextMessage.generateTextBlocksFromText(text),
                    entityMap: {},
         */

        for (var i = 0; i < blocks.length; i++) {

            if (!disableEmojis) {
                curEntity = SpectrumTextMessage.findEmojiInText(blocks[i].text, curEntity["EntityMap"]);
            }

            let m = {
                key: blocks[i].key,
                type: blocks[i].type,
                text: blocks[i].text,
                entityRanges: curEntity["entityRanges"],
                inlineStyleRanges: [],
                data: blocks[i].data,
                depth: blocks[i].depth,
            }

            finalBlocks.push(m);
        }

        return { blocks: finalBlocks, entityMap: curEntity["EntityMap"] };
    }

    public static findEmojiInText(text, entityMap): { entityRanges: any, EntityMap: any } {
        var entityRanges = [];

        if (!this._emojis) {
            for (var eName in emojioneList) this._emojis += eName + "|";
            this._emojis = this._emojis.slice(0, -1);
        }

        /** Seems faster than indexof for large array
         * @todo check that claim
         */
        let emoCheck = new RegExp(this._emojis, 'g');

        var m;
        while ((m = emoCheck.exec(text)) !== null) {
            console.log(entityMap);
            let eObj = Object.keys(entityMap);
            var key = eObj.map((e) => e['type'] == "EMOJI" ? e['data'] : null).indexOf(m[0]);
            console.log(key);
            if (key == -1) {
                entityMap[eObj.length] = { data: m[0], mutability: "IMMUTABLE", type: "EMOJI" };
                key = eObj.length;
            }


            entityRanges.push({
                offset: m.index,
                length: m[0].length,
                key: key,
            });
        }

        return { entityRanges: entityRanges, EntityMap: entityMap };
    }

    public static fetchEmbedMediaId(url: string): Promise<string> {
        return RSI.getInstance().post("api/spectrum/media/embed/fetch", { url: url }).then((data) => {
            if (!data.success) return null;
            return data.data.id;
        });
    }


}