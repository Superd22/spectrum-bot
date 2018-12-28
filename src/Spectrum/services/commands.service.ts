/**
 * @module Spectrum
 */ /** */

import { aSpectrumCommand } from "../interfaces/api/command.interface";
import { SpectrumBroadcaster } from "./broadcaster.service";
import { RSI } from "./../../";
import { aBotCommand } from "../components/api/command.component";
import { SpectrumLobby } from "../components/chat/lobby.component";
import { receivedTextMessage } from "../interfaces/spectrum/community/chat/receivedTextMessage.interface";
import { Service } from "typedi";
import { TSMap } from "typescript-map";
import { SpectrumCommandMakable } from "../components/api/decorators/spectrum-command.decorator";
import * as requireGlob from "require-glob";
import "reflect-metadata";
/** @class SpectrumCommand */
@Service()
export class SpectrumCommands {
    /** Our RSI API instance */
    private RSI: RSI = RSI.getInstance();
    /** Our RSI WS API instance  */
    private Broadcaster: SpectrumBroadcaster = SpectrumBroadcaster.getInstance();
    /** The prefix for the commands */
    protected prefix: string = "\\spbot";
    /** Map of commands */
    protected _commandMap: Map<string, aSpectrumCommand> = new Map<string, aSpectrumCommand>();

    constructor() {
        this.Broadcaster.addListener("message.new", this.checkForCommand);
        this.Broadcaster.addListener("message.edit", this.checkForCommand);
    }

    private checkForCommand = (payload: { message: receivedTextMessage }) => {
        let bot = this.Broadcaster.getMember();
        let messageAsLower = payload.message.plaintext.toLowerCase();

        //if(Number(bot.id) == Number(message.member.id)) return false;
        if (messageAsLower.indexOf(this.prefix) == -1) return false;

        // why cant the spectrum message just own a Lobby instance if all it is wrapping is an ID?
        let lobby = new SpectrumLobby(payload.message.lobby_id);

        // This should probably just parse out the shortcode and use that as the key
        // with a direct equality compare rather than regexing.
        // Its unlikely you would have 2 commands with the same shortcode and different regex
        // arguments. Better to just map the shortcode and then let the command deal with its own
        // args. Regex is usually fairly expensive so would be nice to eliminate if possible
        //
        // Basically something like
        //
        // if ( messageAsLower.startsWith(this.prefix) ) {
        //    let parsedShortCode = ... something to get the second token (first is prefix)  (.toLowerCase())
        //    let args[] = ... something to get the third-Nth token (command args)
        //
        //    // no regex matching so faster since its a simple compare
        //    if (this._commandMap.has(parsedShortCode)) {
        //      this._commandMap[parsedShortCode].callback(payload.message, lobby, args);
        //      return;
        //    }
        //  }

        for (let [key, value] of this._commandMap.entries()) {
            let re = new RegExp(`^${this.escapeRegExp(this.prefix)} ${key}`);
            let matches = messageAsLower.match(re);
            if (matches) {
                value.callback(payload.message, lobby, matches);
                return; // there cant be 2 commands can there?
            }
        }
    };

    /**
     * Set the prefix for every commands. Any text message not starting with this prefix will be ignored
     * (case insensitive)
     */
    public setPrefix(prefix: string) {
        this.prefix = prefix.toLowerCase();
    }

    /**
     * Registers a command and listen for it.
     * Either supply aBotCommand or argument to create one.
     * @param command the aBotCommand to listen to
     * @param name the name of the command
     * @param shortCode the shortcode to listen for
     * @param callback the function to call when this command is used
     * @param manual an explanation of what this command does.
     * @deprecated use registerCommands instead
     * @return the aSpectrumCommand object that we are now listening for.
     */
    public registerCommand(command: aSpectrumCommand): aSpectrumCommand;
    public registerCommand(name: string, shortCode, callback, manual): aSpectrumCommand;
    public registerCommand(
        name: string | aSpectrumCommand,
        shortCode?: string,
        callback?: Function,
        manual?: string
    ): aSpectrumCommand {
        var co = null;
        if (typeof name === typeof "test") {
            co = new aBotCommand(shortCode, callback, name, manual);
        } else {
            co = name;
        }

        var commandString = co.shortCode.toLowerCase();
        this._commandMap.set(commandString, co);

        return co;
    }

    /**
     * Alias of registerCommand
     * @deprecated use registerCommands instead
     */
    public addCommand(name, shortCode, callback, manual) {
        return this.registerCommand(name, shortCode, callback, manual);
    }

    /**
     * Unbinds a command and stop listening to it.
     * @todo
     */
    public unRegisterCommand(command: aBotCommand);
    public unRegisterCommand(commandId: number);
    public unRegisterCommand(co) {
        let shortcodeAsLower = co.shortCode.toLowerCase();
    }

    /**
     * Return the list of commands currently registered and active
     */
    public getCommandList(): aSpectrumCommand[] {
        return Array.from(this._commandMap.values());
    }

    /**
     * Register a batch of commands, either as an array or with a glob.
     * Commands __must be decorated__ with @SpectrumCommand() decorator
     */
    public async registerCommands(opts: {
        /** array of actual commands or globs to import them */
        commands: SpectrumCommandMakable[] | string[];
    }) {
        if (opts.commands.length === 0) return;

        if (typeof opts.commands[0] === "string") {
            // Import as glob, we have nothing to do.
            await requireGlob((opts.commands as string[]).map(path => `${process.cwd()}/${path}`));
        } else {
            await Promise.all(
                (opts.commands as SpectrumCommandMakable[]).map(async Command => {
                    // We just make sure it's decorated and that we have nothing to do.
                    if (!Reflect.getMetadata("spectrum-command", Command)) {
                        console.error(
                            `[ERROR] Could not register command ${
                                Command.constructor.name
                            }. Did you forget to decorate it with @SpectrumCommand() ?`
                        );
                    }
                })
            );
        }
    }

    protected escapeRegExp(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }
}
