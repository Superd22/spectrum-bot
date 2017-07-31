/**
 * @module Spectrum
 */ /** */

import { SpectrumLobby } from '../../components/chat/lobby.component';
import { receivedTextMessage } from '../spectrum/community/chat/receivedTextMessage.interface';

export interface aSpectrumCommand {
    /** Name of the command */
    name:string,
    /** Shortcode of the command */
    shortCode:string,
    /** Manual of the command */
    manual:string,
    /** callback function on message */
    callback: (message?:receivedTextMessage, lobby?:SpectrumLobby, matchs?:Array<any>) => any
    /** the ID of the active listener for this command */
    listenerID:number;
}