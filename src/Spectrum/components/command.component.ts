/**
 * @module Spectrum
 */ /** */

import { Community } from './../interfaces/community.interface';
import { Lobby } from './../interfaces/lobby.interface';
import { aSpectrumCommand } from './../interfaces/command.interface';
import { SpectrumLobby } from './lobby.component';

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