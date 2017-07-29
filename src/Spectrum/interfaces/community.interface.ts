/**
 * @module Spectrum
 */ /** */
 
import { ISpectrumLobby } from './lobby.interface';

export interface ISpectrumCommunity {
    /** the numerical id of the community  */
    id:number,
    /** the type of community {public|private} */
    type:string,
    /** the slug of the community (URL) */
    slug:string,
    /** the human name of the community */
    name:string,
    /** the url for the community logo */
    avatar:string,
    /** the url for the community banner */
    banner:string,
    /** an array of acessible lobby */
    lobbies:ISpectrumLobby[],
    /** idk */
    forum_channel_groups:any,
    roles:any,
}