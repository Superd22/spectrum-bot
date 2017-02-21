import { SpectrumLobby } from './../components/lobby.component';
import { receivedTextMessage } from './../interfaces/receivedTextMessage.interface';
/**
 * @module Spectrum
 */ /** */

import { aSpectrumCommand } from './../interfaces/command.interface';
import { Broadcaster } from './broadcaster.service';
import { RSI } from './../../';

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

        if(Number(bot.id) == Number(message.member.id)) return false;
        if(message.plaintext.toLowerCase().indexOf(this.prefix) == -1) return false;

        let lobby = new SpectrumLobby(message.lobby_id);

        for(var i = 0; i < this._commandList.length; i++) {
            let command = this._commandList[i];
            let re = new RegExp( String(this.prefix+" "+command.shortCode).toLowerCase(), );

            let matchs = message.plaintext.toLowerCase().match(re);

            if(matchs) command.callback(message, lobby, matchs);
        }
    }

    public setPrefix(prefix:string) {
        this.prefix = prefix.toLowerCase();
    }

    public addCommand(name, shortCode, callback, manual): number {
        let co: aSpectrumCommand = {
            manual: manual,
            shortCode: shortCode,
            callback: callback,
            name: name,
        }

        return this._commandList.push(co);
    }

    public removeCommand(commandId) {
        this._commandList.splice(commandId, 1);
    }

    public getCommandList(): aSpectrumCommand[] {
        return this._commandList;
    }


}