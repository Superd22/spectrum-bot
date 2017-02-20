/**
 * @module Spectrum
 */ /** */
 
import { Lobby } from './lobby.interface';

export interface Community {
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
    lobbies:Lobby[],
    /** idk */
    forum_channel_groups:any,
    roles:any,
}