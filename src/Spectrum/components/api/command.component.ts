/**
 * @module Spectrum
 */ /** */

import { ISpectrumCommunity } from "../../interfaces/spectrum/community/community.interface";
import { ISpectrumLobby } from "../../interfaces/spectrum/community/chat/lobby.interface";
import { aSpectrumCommand } from "../../interfaces/api/command.interface";
import { SpectrumLobby } from "../chat/lobby.component";

/**
 * #
 * Helper class for a Bot Command
 *
 * @class aBotCommand
 */
export class aBotCommand implements aSpectrumCommand {
    public listenerID;
    public shortCode;
    public callback;
    public name;
    public manual;

    public constructor(shortCode, callback, name?, manual?) {
        this.shortCode = shortCode;
        this.callback = callback;
        this.name = name;
        this.manual = manual;
    }
}
