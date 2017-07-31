
/**
 * @module Spectrum
 */ /** */

import { ISpectrumCommunity } from '../../interfaces/spectrum/community/community.interface';
import { ISpectrumLobby } from '../../interfaces/spectrum/community/chat/lobby.interface';
import { SpectrumLobby } from '../chat/lobby.component';
import { RSI } from "../../../index";
import { ISpectrumChannelGroup } from './../../interfaces/spectrum/community/forum/channel-group.interface';
import { ISpectrumChannel } from './../../interfaces/spectrum/community/forum/channel.interface';
import { SpectrumChannel } from './../forum/channel.component';

/**
 * ## SpectrumCommunity
 * Helper class for a Spectrum Community (currently Star Citizen or Org)
 * 
 * @class SpectrumCommunity
 */
export class SpectrumCommunity {

    /** the community rsi api object  */
    protected _community: ISpectrumCommunity;
    /** an array of lobbies the bot can see in this community */
    protected _lobbies: SpectrumLobby[] = [];
    /** channels in this community */
    protected _channels: SpectrumChannel[] = [];
    /** the RSI API instance */
    private rsi: RSI = RSI.getInstance();

    /**
     * @param co the community object sent by RSI
     */
    constructor(co: ISpectrumCommunity) {
        this._community = co;
        this._community.id = Number(co.id);

        this._community.lobbies.forEach((l: ISpectrumLobby) => {
            this._lobbies.push(new SpectrumLobby(l));
        });

        this._community.forum_channel_groups.forEach((group: ISpectrumChannelGroup) => {
            group.channels.forEach((channel) => {
                this._channels.push(new SpectrumChannel(channel));
            });
        });
    }

    /**
     * Public getter for Lobbies in the Community
     * @return array of Lobbies the bot can see in this community
     */
    public get lobbies(): SpectrumLobby[] {
        return this._lobbies;
    }

    public getLobbyById(id: number): SpectrumLobby {
        let i = this._community.lobbies.findIndex((l: ISpectrumLobby) => {
            return l.id == id;
        });

        if (i == -1) return null;
        else return this._lobbies[i];
    }

    public getLobbyByName(name: string): SpectrumLobby {
        let n = name.toLowerCase();
        let i = this._community.lobbies.findIndex((l: ISpectrumLobby) => {
            return l.name.toLowerCase() == n;
        });

        if (i == -1) return null;
        else return this._lobbies[i];
    }

    /**
     * Getter function for _community
     * @param _community
     * @return the community object in RSI api format
     */
    public get community(): ISpectrumCommunity {
        return this._community;
    }

    /**
     * Fetch online members count for every chat lobby of this community
     * @return a map of community id => onlineMemberCount
     */
    public async getOnlineMemberCount(): Promise<{ [lobbyId: string]: number }> {
        return await this.rsi.post("api/spectrum/lobby/online-members-count", { community_id: this._community.id }).then(
            (data) => {
                return data.data;
            }
        );
    }

    public getChannelGroups(): ISpectrumChannelGroup[] {
        return this._community.forum_channel_groups;
    }

    /**
     * Finds a given channel in this community
     * 
     * @param id the id of the channel
     * @param channel the channel to look for
     * @return SpectrumChannel or null if not found
     */
    public getChannel(id: number): SpectrumChannel;
    public getChannel(channel: ISpectrumChannel): SpectrumChannel;
    public getChannel(search): SpectrumChannel {
        let id;
        if (typeof search == typeof 123) id = search;
        else if (search && search.id) id = Number(search.id);
        else throw "can't compute requested channel id in Community.getChannel()";

        return this._channels.find(c => Number(c.channel.id) === id);
    }

    /**
     * Get all the channels (=forums) in this community
     */
    public get channels(): SpectrumChannel[] {
        return this._channels;
    }

}