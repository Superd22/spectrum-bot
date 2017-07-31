import { ISpectrumChannelGroup } from './forum/channel-group.interface';
/**
 * @module Spectrum
 */ /** */

import { ISpectrumLobby } from './chat/lobby.interface';

export interface ISpectrumCommunity {
    /** the numerical id of the community  */
    id: number,
    /** the type of community {public|private} */
    type: string,
    /** the slug of the community (URL) */
    slug: string,
    /** the human name of the community */
    name: string,
    /** the url for the community logo */
    avatar: string,
    /** the url for the community banner */
    banner: string,
    /** an array of acessible lobby */
    lobbies: ISpectrumLobby[],
    /** array of forum categories (group) in this lobby */
    forum_channel_groups: ISpectrumChannelGroup[],
    roles: any,
}