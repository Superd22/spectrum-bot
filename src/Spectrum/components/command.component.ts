/**
 * @module Spectrum
 */ /** */

import { Community } from './../interfaces/community.interface';
import { Lobby } from './../interfaces/lobby.interface';
import { SpectrumLobby } from './lobby.component';

/**
 * #
 * Helper class for a Bot Command
 * 
 * @class aBotCommand
 */
export class aBotCommand {

    public ID;
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

    public setID(id:number) {
        this.ID = id;
    }

    public unsetID() {
        this.ID = null;
    }

    public register(id:number) {
        this.ID = id;
    }

    public unRegister() {
        this.ID = null;
    }

    public isRegistered() {
        return this.ID !== null;
    }
}