/**
 * @module Spectrum
 */ /** */

import { aSpectrumCommand } from "../../interfaces/api/command.interface";

/**
 * Helper class for a Bot Command
 *
 * This class is internal and should not be used anymore to create your own commands.
 * Please see SpectrumCommand decorator instead
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
