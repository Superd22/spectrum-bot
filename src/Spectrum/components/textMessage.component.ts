import { Broadcaster } from './../services/broadcaster.service';
/**
 * @module Spectrum
 */ /** */

import { TextMessage } from '../interfaces/textMessage.interface';
import { ContentState } from 'draft-js';
import { RSI } from './../../RSI/';
import { emojioneList } from './emoji.component';

interface curEntities { entityRanges: any[], EntityMap: any, plainText: string };

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

    public static generateContentStateFromText(textObj: { text: string }, delimiter?: string, disableEmojis = false, disableMentions = false) {
        let text = textObj.text;
        let base = ContentState.createFromText(text, delimiter);

        let blocks = base.getBlocksAsArray();
        var finalBlocks = [];
        var finalEntities = [];
        var entityMap = {};
        var curEntity: curEntities = { EntityMap: {}, entityRanges: [], plainText: null };

        /**
         *  blocks: SpectrumTextMessage.generateTextBlocksFromText(text),
                    entityMap: {},
         */

        for (var i = 0; i < blocks.length; i++) {

            if (!disableMentions) {
                curEntity = SpectrumTextMessage.findMentionsInText(blocks[i].text, curEntity);
            }

            if (!disableEmojis) {
                curEntity = SpectrumTextMessage.findEmojiInText(curEntity);
            }

            if (!disableMentions && !disableEmojis) {
                curEntity = SpectrumTextMessage.reorganizeEntities(curEntity);
            }

            let m = {
                key: blocks[i].key,
                type: blocks[i].type,
                text: curEntity["plainText"],
                entityRanges: curEntity["entityRanges"],
                inlineStyleRanges: [],
                data: blocks[i].data,
                depth: blocks[i].depth,
            }

            finalBlocks.push(m);
        }

        textObj.text = "";
        finalBlocks.forEach(block => {
            //textObj.text += block.text;
        });

        return { blocks: finalBlocks, entityMap: curEntity["EntityMap"] };
    }

    /**
     * Called after we've parsed every different entitities for rich text in order to sort them.
     * Apparently, the spectrum back end doesn't like when the entities aren't in the same order they are in text,
     * and that causes a weird bug where the text will duplicate.
     * 
     * This fixes this.
     * 
     * @todo report this.
     */
    private static reorganizeEntities(curEntity: curEntities): curEntities {
        // sort the EntityRanges array by offset
        curEntity.entityRanges.sort((a, b) => {
            return a.offset - b.offset;
        });

        return curEntity;
    }

    public static findMentionsInText(text, curEntity): curEntities {
        var entityRanges = [];
        let menCheck = new RegExp(/<scAPIM>@([^ ]+):(\d+)<\/scAPIM>/, 'g');
        var m;

        let entityMap = curEntity["EntityMap"];

        while ((m = menCheck.exec(text)) !== null) {
            /** This is easier than emojis as spectrum currently doesn't give a shit and will treat multiple
             *  mention to the same guy as different mentions
             */

            // Add the mention to the entity map
            let eObj = Object.keys(entityMap).length;
            entityMap[eObj] = { type: "MENTION", mutability: "IMMUTABLE", data: { id: m[2] } };

            let mention = "@" + m[1];

            // Cut the mention to "@Handle"
            text = text.replace(m[0], mention);


            // Flag this spot as a mention
            entityRanges.push({
                offset: text.indexOf(mention),
                length: mention.length,
                key: eObj,
            });
        }

        return { entityRanges: entityRanges, EntityMap: entityMap, plainText: text };
    }

    public static findEmojiInText(curEntity): curEntities {
        let entityRanges = curEntity["entityRanges"] || [];
        let entityMap = curEntity["EntityMap"];

        if (!this._emojis) {
            for (var eName in emojioneList) this._emojis += eName + "|";
            this._emojis = this._emojis.slice(0, -1);
        }

        /** Seems faster than indexof for large array
         * @todo check that claim
         */
        let emoCheck = new RegExp(this._emojis, 'g');

        var m;
        let text = curEntity.plainText;
        while ((m = emoCheck.exec(text)) !== null) {

            // Check if we need to push to the entityMap
            let eObj = Object.keys(entityMap);
            var key = eObj.map((e) => e['type'] == "EMOJI" ? e['data'] : null).indexOf(m[0]);

            // Emojis seem to be unique in the map.
            if (key == -1) {
                entityMap[eObj.length] = { data: m[0], mutability: "IMMUTABLE", type: "EMOJI" };
                key = eObj.length;
            }

            // Push to the entity Range now that we have the corresponding map
            entityRanges.push({
                offset: m.index,
                length: m[0].length,
                key: key,
            });
        }

        return { entityRanges: entityRanges, EntityMap: entityMap, plainText: curEntity.plainText };
    }

    public static fetchEmbedMediaId(url: string): Promise<string> {
        return RSI.getInstance().post("api/spectrum/media/embed/fetch", { url: url }).then((data) => {
            if (!data.success) return null;
            return data.data.id;
        });
    }


}