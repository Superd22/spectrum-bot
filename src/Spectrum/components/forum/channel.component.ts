import { SpectrumRichText } from './../chat/rich-text.component';
import { SpectrumTextMessage } from './../chat/textMessage.component';
import { ISpectrumChannelLabel } from './../../interfaces/spectrum/community/forum/channel-label.interface';
import { ISpectrumThread } from './../../interfaces/spectrum/community/forum/thread.interface';
import { ISpectrumChannel } from './../../interfaces/spectrum/community/forum/channel.interface';
import { RSI } from "../../../index";
import { SpectrumThreadSortFilter } from "../../interfaces/spectrum/community/forum/thread-sort-filter.type";
/**
 * @module Spectrum
 */ /** */

/**
 * ## SpectrumChannel
 * Helper class for a Spectrum Channel (= forum)
 * 
 * @class SpectrumChannel
 */
export class SpectrumChannel {

    private _channel: ISpectrumChannel;

    private _sort: SpectrumThreadSortFilter;
    private _page: number = 1;
    private _labelId: number = null;

    /** instance of RSI api */
    private rsi: RSI = RSI.getInstance();

    constructor(channel: ISpectrumChannel) {
        this._channel = channel;
    }

    public get channel(): ISpectrumChannel { return this._channel; }

    public set sort(sort: SpectrumThreadSortFilter) { this._sort = sort; }
    public set labelId(labelId: number) { this._labelId = labelId; }
    public set page(page: number) { this._page = page > 0 ? page : 1; }

    /**
     * Fetch threads in this channel from Spectrum API
     * 
     * @param page the page number to fetch thread from (null for default/current)
     * @param sort the type of sorting to do (null for default/current)
     * @param label_id if we want to filter threads by a specific label (null for default/current)
     * @return Promise<ISpectrumThread[]> 
     */
    public async getThreads(page?: number);
    public async getThreads(page: number, sort: SpectrumThreadSortFilter);
    public async getThreads(page: number, sort: SpectrumThreadSortFilter, label_id: number);
    public async getThreads(): Promise<ISpectrumThread[]> {
        let page = arguments[0];
        let sort = arguments[1];
        let label_id = arguments[2];

        if (Number(page) > 0) this._page = Number(page);
        if (this._sort !== null) this._sort = sort;
        if (this._labelId !== null) this._labelId = label_id;

        let post = {
            channel_id: this.channel.id,
            label_id: this._labelId,
            page: this._page,
            sort: this._sort,
        };

        let api = await this.rsi.post("/api/spectrum/forum/channel/threads", post);
        if (!api.success) throw api.msg;
        else {
            let ret = [];
            api.data.forEach((thread: ISpectrumThread) => {
                ret.push(thread);
            });

            return ret;
        }

    }

    /**
     * Publish a new thread in this channel
     * 
     * @param subject subject -title- of the new thread
     * @param message content of the new thread
     * @param label label underwhich to set this thread
     * @param type type of thred to create
     * @param highlightGroupId with what highlight group to send that thread
     * @return Promise<ISpectrumThread>
     */
    public async postNewThread(subject: string, message: string, label?: number | ISpectrumChannelLabel, type?: "discussion", highlightGroupId?: number): Promise<ISpectrumThread> {
        let post = Object.assign({
            channel_id: this.channel.id,
        }, this.generateTextPayload(message, null, highlightGroupId));

        return (await this.rsi.post("/api/spectrum/forum/thread/create", post)).data;
    }

    private generateTextPayload(text, mediaId = null, highlightId = null) {
        let textObj = { text: text };
        return {
            content_state: new SpectrumRichText(text).toJson(),
            highlight_role_id: highlightId,
            plaintext: textObj.text,
        };
    }
}