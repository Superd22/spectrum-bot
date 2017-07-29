/**
 * @module Spectrum
 */ /** */

import { aSpectrumCommand } from './../interfaces/command.interface';
import { SpectrumBroadcaster } from './broadcaster.service';
import { RSI } from './../../';
import { aBotCommand } from '../components/api/command.component';
import { SpectrumLobby } from '../components/chat/lobby.component';
import { receivedTextMessage } from './../interfaces/receivedTextMessage.interface';

import { TSMap } from "typescript-map"

/** @class SpectrumCommand */
export class SpectrumCommands {
    /** Our RSI API instance */
    private RSI: RSI = RSI.getInstance();
    /** Our RSI WS API instance  */
    private Broadcaster: SpectrumBroadcaster=SpectrumBroadcaster.getInstance();
    /** The prefix for the commands */
    protected prefix:string="\\spbot"
    /** Main listener for commands */
    protected _listenerId:number;
    /** Map of commands */
    protected _commandMap: TSMap<string, aSpectrumCommand> = new TSMap<string, aSpectrumCommand>();

    constructor() {
        this._listenerId = this.Broadcaster.addListener("message.new", this.checkForCommand);
    }

    private checkForCommand = (payload:{message:receivedTextMessage}) => {
        let bot = this.Broadcaster.getMember();
        let messageAsLower = payload.message.plaintext.toLowerCase();

        //if(Number(bot.id) == Number(message.member.id)) return false;
        if(messageAsLower.indexOf(this.prefix) == -1) return false;

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

        this._commandMap.forEach((value:aSpectrumCommand, key:string)=>{
            let re = new RegExp("^" + key, );
            let matches = messageAsLower.match(re);
            if ( matches ) {
                value.callback(payload.message, lobby, matches);
                return; // there cant be 2 commands can there?
            }
        });
    }

    public setPrefix(prefix:string) {
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
     * @return the aSpectrumCommand object that we are now listening for.
     */
    public registerCommand(command:aSpectrumCommand):aSpectrumCommand;
    public registerCommand(name:string, shortCode, callback, manual):aSpectrumCommand;
    public registerCommand(name:string|aSpectrumCommand, shortCode?, callback?, manual?):aSpectrumCommand {
        var co = null;
        if(typeof name === typeof "test") {
            co = new aBotCommand(shortCode, callback, name, manual);
        }
        else {
            co = name;
        }

        var commandString = this.prefix.toLowerCase() + " " + co.shortCode.toLowerCase();
        this._commandMap.set(commandString, co);

        return co;
    }

    /**
     * Alias of registerCommand
     */
    public addCommand(name, shortCode, callback, manual) {
        return this.registerCommand(name,shortCode,callback,manual);
    }
    
    /** 
     * Unbinds a command and stop listening to it.
     */
    public unRegisterCommand(command:aBotCommand);
    public unRegisterCommand(commandId:number);
    public unRegisterCommand(co) {

        let shortcodeAsLower = co.shortCode.toLowerCase();

        this._commandMap.filter(function(command, key) {
            return key === shortcodeAsLower;
        });

    }

    public getCommandList(): aSpectrumCommand[] {
        return this._commandMap.values();
    }


}