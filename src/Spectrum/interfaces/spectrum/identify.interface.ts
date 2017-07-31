/**
 * @module Spectrum
 */ /** */

import { ISpectrumLobby } from './community/chat/lobby.interface';
import { ISpectrumCommunity } from './community/community.interface';
export interface ISpectrumIdentifyPacket {
    bookmarks,
    communities: ISpectrumCommunity[],
    config,
    member,
    notifications,
    notifications_unread,
    private_lobbies: ISpectrumLobby[],
    roles,
    settings,
    token,
}