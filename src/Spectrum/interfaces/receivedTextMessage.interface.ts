/**
 * @module Spectrum
 */ /** */
 
import { ISpectrumTextMessage } from './textMessage.interface';
import { ISpectrumUser } from './user.interface';
import { ISpectrumLobby } from './lobby.interface';

export interface receivedTextMessage extends ISpectrumTextMessage {
    lobby:ISpectrumLobby,
    member:ISpectrumUser,
}