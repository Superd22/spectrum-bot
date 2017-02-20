/**
 * @module Spectrum
 */ /** */

import { Community } from './../interfaces/community.interface';
import { Lobby } from './../interfaces/lobby.interface';
import { SpectrumLobby } from './lobby.component';

/**
 * ## SpectrumCommunity
 * Helper class for a Spectrum Community (currently Star Citizen or Org)
 * 
 * @class SpectrumCommunity
 */
export class SpectrumCommunity {

    /** the community rsi api object  */
    protected _community:Community;
    /** an array of lobbies the bot can see in this community */
    protected _lobbies:SpectrumLobby[]=[];

    /**
     * @param co the community object sent by RSI
     */
    constructor(co:Community) {
        this._community = co;
        this._community.lobbies.forEach( (l:Lobby) => {
            this._lobbies.push(new SpectrumLobby(l));
        });
    }

    /**
     * Public getter for Lobbies in the Community
     * @return array of Lobbies the bot can see in this community
     */
    public getLobbies():SpectrumLobby[] {
        return this._lobbies;
    }

    public getLobbyById(id:number):SpectrumLobby {
        let i = this._community.lobbies.findIndex( (l:Lobby) => {
            return l.id == id;
        });

        if(i == -1) return null;
        else return this._lobbies[i];
    }

    public getLobbyByName(name:string):SpectrumLobby {
        let n = name.toLowerCase();
        let i = this._community.lobbies.findIndex( (l:Lobby) => {
            return l.name.toLowerCase() == n;
        });

        if(i == -1) return null;
        else return this._lobbies[i];
    }

    /**
     * Getter function for _community
     * @param _community
     * @return the community object in RSI api format
     */
    public getRaw():Community {
        return this._community;
    }



}