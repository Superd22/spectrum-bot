/**
 * @module Spectrum
 */ /** */

import { aSpectrumCommand } from './../interfaces/command.interface';
import { Broadcaster } from './broadcaster.service';
import { RSI } from './../../';
import { aBotCommand } from '../components/command.component';
import { SpectrumLobby } from './../components/lobby.component';
import { receivedTextMessage } from './../interfaces/receivedTextMessage.interface';

/** @class SpectrumCommand */
export class SpectrumCommands {

    protected _commandList: aSpectrumCommand[] = [];
    /** Our RSI API instance */
    private RSI: RSI = RSI.getInstance();
    /** Our RSI WS API instance  */
    private Broadcaster: Broadcaster=Broadcaster.getInstance();

    protected prefix:string="\\spbot"

    protected _listenerId:number;

    constructor() {
        this._listenerId = this.Broadcaster.addListener("message.new", this.checkForCommand);
    }

    private checkForCommand = (payload:{message:receivedTextMessage}) => {
        let bot = this.Broadcaster.getMember();
        let message = payload.message;

        //if(Number(bot.id) == Number(message.member.id)) return false;
        if(message.plaintext.toLowerCase().indexOf(this.prefix) == -1) return false;

        let lobby = new SpectrumLobby(message.lobby_id);

        for(var i = 0; i < this._commandList.length; i++) {
            let command = this._commandList[i];
            let re = new RegExp( String("^"+this.prefix+" "+command.shortCode).toLowerCase(), );

            let matchs = message.plaintext.toLowerCase().match(re);

            if(matchs) command.callback(message, lobby, matchs);
        }
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
        if(typeof name !== typeof "test") {
            co = new aBotCommand(shortCode, callback, name, manual);
        }
        else {
            co = name;
        }

        let id = this._commandList.push(co);
        co.listenerID = id;

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
        if(typeof co !== typeof 123) {
            co = co.ID;
            co.listenerID = null;
        }
        this._commandList.splice(co, 1);
    }

    public getCommandList(): aSpectrumCommand[] {
        return this._commandList;
    }


}