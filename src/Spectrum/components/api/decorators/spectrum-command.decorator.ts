/**
 * @module Spectrum
 */ /** */
import { Container } from "typedi";
import { aSpectrumCommand } from "../../../interfaces/api/command.interface";
import { SpectrumCommands } from "../../../services/commands.service";

/**
 * Decorate a class as being a command a bot can listen to
 *
 * **example:**
 *```typescript
 * @SpectrumCommand("my-command")
 * export class MyCommand {
 *     public async callback(textMessage, lobby) {
 *         // This will be called automatically when someone says "my-command"
 *     }
 *}
 * ```
 * 
 * Do **not** forget to register your command via SpectrumCommands.registerCommands()
 */
export function SpectrumCommand(opts: SpectrumCommandOpts): SpectrumCommandHandlerClass;
export function SpectrumCommand(
    shortCode: SpectrumCommandOpts["shortCode"]
): SpectrumCommandHandlerClass;
export function SpectrumCommand(
    opts: SpectrumCommandOpts | SpectrumCommandOpts["shortCode"]
): SpectrumCommandHandlerClass {
    let options: SpectrumCommandOpts;
    if (typeof opts === "string" || opts instanceof RegExp) {
        options = { shortCode: opts };
    } else {
        options = { ...opts };
    }

    return (
        Class: new (...any: any[]) => {
            callback: aSpectrumCommand["callback"];
        }
    ) => {
        Reflect.defineMetadata("spectrum-command", true, Class);
        const instance = new Class();
        Container.get(SpectrumCommands).registerCommand(
            options.name || "",
            options.shortCode,
            instance.callback.bind(instance),
            options.manual || ""
        );
    };
}

export type SpectrumCommandHandlerClass = (target: SpectrumCommandMakable) => void;

export type SpectrumCommandMakable = new (...any: any[]) => {
    callback: aSpectrumCommand["callback"];
};

/**
 * Options for constructing a spectrum bot command
 */
export interface SpectrumCommandOpts {
    /**
     * the code that will trigger this command, excluding the prefix.
     * In case of a regex with capture groups, the resulting matches will be provided to the callback function
     *
     * **Example:**
     * *(prefix set to !bot)*
     *
     * shortCode: `testCommand`
     * Will match `!bot testCommand`
     **/
    shortCode: string | RegExp;
    /** pretty name to be given internally to this command */
    name?: string;
    /** manual entry for this command */
    manual?: string;
}
