/**
 * @module Spectrum
 */ /** */
 
import { TextMessage } from './textMessage.interface';
import { User } from './user.interface';
import { Lobby } from './lobby.interface';

export interface receivedTextMessage extends TextMessage {
    lobby:Lobby,
    member:User,
}