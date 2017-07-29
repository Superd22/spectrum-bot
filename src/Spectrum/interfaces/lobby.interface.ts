/**
 * @module Spectrum
 */ /** */

export interface ISpectrumLobby {
    /** doesn't seem used rn */
    color?,
    /** the community id (= Community/Org) the lobby belongs to */
    community_id:number,
    /** the description of the lobby */
    description:string,
    /** the numerical id of the channel (url) */
    id:number,
    /** the name of the channel (human-readable) */
    name:string,
    /** the number of members connected to the lobby */
    online_members_count:number,
    /** the permissions of the lobby */
    permissions:any,
    /** the channel_id for ws/api calls */
    subscription_key:any,
    /** the type of the channel */
    type:any,
}