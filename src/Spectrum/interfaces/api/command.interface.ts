/**
 * @module Spectrum
 */ /** */

import { SpectrumLobby } from "../../components/chat/lobby.component";
import { receivedTextMessage } from "../spectrum/community/chat/receivedTextMessage.interface";

export interface aSpectrumCommand {
    /** Name of the command */
    name: string;
    /** Shortcode of the command */
    shortCode: string;
    /** Manual of the command */
    manual: string;
    /**
     * callback function on message
     * @param message the message that triggered this command
     * @param lobby lobby in which that command was triggered
     * @param match matchs of the regex for this command, if any
     */
    callback: (message?: receivedTextMessage, lobby?: SpectrumLobby, matchs?: Array<any>) => void;
    /** the ID of the active listener for this command */
    listenerID: number;
}
